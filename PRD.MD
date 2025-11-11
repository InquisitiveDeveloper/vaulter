# Vault Secret Management UI - Planning Document

## 1. Introduction & Goal

This document outlines the plan for developing a Next.js-based web application designed to manage secrets stored in HashiCorp Vault instances. The primary goal is to provide a centralized, user-friendly interface for developers and DevOps teams to interact with secrets across multiple environments and Vault instances, enhancing security, visibility, and collaboration.

## 2. Target Audience

*   DevOps Engineers
*   Platform Engineers
*   Software Developers
*   Security Teams

## 3. Core Features

*   **Environment Management:**
    *   Define distinct environments (e.g., dev, staging, prod).
    *   Store configuration per environment: Name, Description, Vault Address URL, Vault Auth Method details (User ID/Password for Userpass, potentially AppRole later), Vault Token Expiry settings.
    *   Support multiple Vault instances per logical environment if needed (though the initial model focuses on one Vault per defined Environment entry).
*   **Namespace Management:**
    *   Associate multiple Vault namespaces with each defined environment.
*   **Application Path Management:**
    *   Define logical "Applications" within the UI.
    *   Each application corresponds to a specific base path within Vault (e.g., `kv/my-app/`).
    *   Ability to add new applications (paths).
*   **Secret Management (KV V2 Focus):**
    *   Create, Read, Update, Delete (CRUD) secrets (key-value pairs) within a selected Environment, Namespace, and Application path.
    *   View existing keys and values under an application path.
*   **Secret Comparison:**
    *   Select multiple Environments and Namespaces.
    *   Compare secrets for the *same* Application across the selected contexts.
    *   Highlight rows (secrets) where keys exist in multiple selected contexts but have different values.
*   **Secret Copying:**
    *   Copy a single secret's value from one Environment/Namespace to another for the same Application and key.
    *   Copy *all* secrets for an Application from one Environment/Namespace to another (bulk copy).
*   **Secret Redaction (Visibility Control):**
    *   Default view: Keys and values are visible plain text.
    *   Per-key "Lock" button: Redacts the secret value (e.g., shows `********`).
    *   Per-key "Unlock/Eye" button (visible when locked): Temporarily reveals the secret value.
    *   Persistence of the "locked" state (stored in the application's database).
*   **Secret Version History:** View historical versions of secrets stored in Vault's KV V2 engine.
*   **Bulk Operations:**
    *   **Import:** Upload secrets (e.g., via JSON/CSV) for an application into a specific environment/namespace.
    *   **Export:** Download secrets for an application from a specific environment/namespace (e.g., as JSON/CSV).
*   **Access Control Management:**
    *   Define User Groups within the application.
    *   Create an Access Matrix page.
    *   Assign granular permissions to groups per Environment:
        *   View Secrets
        *   Add/Edit Secrets
        *   Delete Secrets / Keys
        *   Add Applications
        *   Lock/Unlock Secrets (Redaction Control)
        *   Manage Environments (Admin?)
        *   Manage Access Control (Admin?)
    *   Leverage OIDC claims (e.g., group membership) for assigning users to internal groups.
*   **Authentication:**
    *   Integrate OIDC (OpenID Connect) for user authentication.
    *   Protect all application routes/APIs.
*   **Database Support:**
    *   Use Prisma ORM to abstract database interactions.
    *   Support SQLite (for development/small deployments), PostgreSQL, and MS SQL Server.
*   **Vault Interaction:**
    *   Securely connect to configured Vault instances using provided credentials (initially Userpass).
    *   Manage Vault tokens (acquire, potentially renew based on expiry).
    *   Interact with Vault's KV V2 secret engine API.
*   **Audit Logging:** Record user actions (CRUD operations on environments, namespaces, applications, secrets, permissions, bulk actions, etc.) including who, what, when, and target resource details. Provide a UI to view audit logs.

## 4. Technology Stack

*   **Frontend Framework:** Next.js 15 (App Router)
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn/ui
*   **State Management:** React Context / Zustand / Jotai (TBD based on complexity)
*   **Authentication:** NextAuth.js (for OIDC)
*   **Database ORM:** Prisma
*   **Vault Client:** `node-vault` library or direct `fetch` calls
*   **Language:** TypeScript

## 5. Architecture Overview

*   **Frontend:** Next.js App Router handling UI rendering (Server Components where possible, Client Components for interactivity). Shadcn/ui for components.
*   **Backend:** Next.js API Routes (or potentially Route Handlers in App Router) handling business logic, database interactions, and Vault API communication.
*   **Database:** Stores application-specific configuration (Environments, Namespaces, Applications, Users, Groups, Permissions, Locked Secret states). Chosen DB via Prisma adapter.
*   **Authentication:** NextAuth.js middleware protects routes. Session management handled by NextAuth.js. OIDC provider handles user login.
*   **Authorization:** Custom middleware or checks within API routes/Server Components verify user group membership (derived from OIDC claims) against the defined permissions in the database.
*   **Vault Communication:** A dedicated service/module (`lib/vault.ts`) encapsulates logic for authenticating with Vault instances (based on selected Environment config) and performing CRUD operations on secrets.

## 6. Data Model (High-Level - Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite" or "sqlserver"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  oidcSubject   String?   @unique // Subject claim from OIDC provider
  groups        Group[]   @relation("UserGroups")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Group {
  id          String        @id @default(cuid())
  name        String        @unique
  description String?
  users       User[]        @relation("UserGroups")
  permissions Permission[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Environment {
  id            String        @id @default(cuid())
  name          String        @unique
  description   String?
  vaultAddress  String        // URL of the Vault instance
  vaultAuthType String        // e.g., "userpass", "approle"
  vaultUserId   String?       // For userpass
  vaultPassword String?       // Encrypted storage recommended - TBD
  vaultTokenTTL Int?          // Optional: desired TTL in seconds for tokens
  namespaces    Namespace[]
  permissions   Permission[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Namespace {
  id            String       @id @default(cuid())
  name          String       // Vault namespace path, e.g., "admin/ns1" or "" for root
  environmentId String
  environment   Environment  @relation(fields: [environmentId], references: [id], onDelete: Cascade)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@unique([name, environmentId])
}

model Application {
  id           String          @id @default(cuid())
  name         String          @unique // User-friendly name, e.g., "MyWebApp"
  vaultBasePath String         // e.g., "kv/my-web-app" - Must be unique
  description  String?
  lockedKeys   LockedSecretKey[]
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

// Stores which specific keys within an app are locked (redacted) by default
model LockedSecretKey {
  id            String      @id @default(cuid())
  applicationId String
  application   Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  environmentId String      // Environment context for the lock
  namespaceName String      // Namespace context for the lock (matches Namespace.name)
  secretKey     String      // The specific key within the Vault path that is locked
  createdAt     DateTime    @default(now())

  @@unique([applicationId, environmentId, namespaceName, secretKey])
}

model Permission {
  id            String      @id @default(cuid())
  groupId       String
  group         Group       @relation(fields: [groupId], references: [id], onDelete: Cascade)
  environmentId String?     // If null, permission is global (e.g., manage users/groups)
  environment   Environment? @relation(fields: [environmentId], references: [id], onDelete: Cascade)
  // Granular permissions
  canViewSecrets  Boolean     @default(false)
  canEditSecrets  Boolean     @default(false)
  canDeleteSecrets Boolean    @default(false)
  canAddApps      Boolean     @default(false)
  canManageLocks  Boolean     @default(false) // Lock/Unlock UI control
  canManageAccess Boolean     @default(false) // Manage Groups/Permissions
  canManageEnvs   Boolean     @default(false) // Add/Edit/Delete Environments

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([groupId, environmentId]) // Ensures one permission entry per group per environment (or global)
}

model AuditLog {
  id            String    @id @default(cuid())
  timestamp     DateTime  @default(now())
  userId        String?   // Link to User.id if available (system actions might be null)
  userEmail     String?   // Store email at the time of action for easier viewing
  action        String    // e.g., "SECRET_CREATE", "ENVIRONMENT_UPDATE", "PERMISSION_GRANT", "BULK_IMPORT"
  resourceType  String?   // e.g., "Secret", "Environment", "Permission"
  resourceId    String?   // ID of the affected resource (e.g., Environment.id, Application.id)
  targetDetails Json?     // Additional context (e.g., { environmentId, namespaceName, applicationName, secretKey, affectedKeys: [...] })
  success       Boolean   // Indicate if the action succeeded or failed (useful for failed attempts)
  clientIp      String?   // Optional: Record IP address if needed/available
  details       String?   // Optional: More free-form details about the event

  user          User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([timestamp])
  @@index([userId])
  @@index([action])
  @@index([resourceType, resourceId])
}
