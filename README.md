# Vault Secret Management UI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A Next.js web application providing a user-friendly interface to manage secrets stored in HashiCorp Vault across multiple environments and namespaces.

## Features

*   **Multi-Environment & Namespace:** Manage connections to different Vault instances or namespaces categorized by environment (Dev, Staging, Prod, etc.).
*   **Application-Centric View:** Organize secrets based on logical applications, mapping to specific Vault paths.
*   **KV Secret Management:** Full CRUD operations (Create, Read, Update, Delete) for Key-Value (KV V2) secrets.
*   **Secret Comparison:** Compare secret values for the same application across selected environments/namespaces, highlighting differences.
*   **Secret Copying:** Easily copy individual secrets or entire application secret sets between environments/namespaces.
*   **Secret Version History:** View and inspect previous versions of secrets stored in Vault's KV V2 engine.
*   **Bulk Import/Export:** Upload secrets from a file (JSON/CSV) or download existing secrets for backup or migration.
*   **Granular Access Control:** Define user groups and assign specific permissions (view, edit, delete, lock, manage apps, view audit logs, etc.) per environment via an Access Matrix UI.
*   **OIDC Authentication:** Secure the application using OpenID Connect for user login, mapping OIDC groups to internal application groups.
*   **Audit Logging:** Comprehensive logging of user actions (who, what, when, target resource) for security and compliance. Includes a dedicated UI to view audit trails.
*   **Modern UI:** Built with Next.js 15, Tailwind CSS, and Shadcn/ui.

## Tech Stack

*   **Framework:** Next.js 15 (App Router)
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn/ui
*   **Authentication:** NextAuth.js (OIDC Provider)
*   **Database ORM:** Prisma
*   **Vault Interaction:** node-vault
*   **Language:** TypeScript

## Prerequisites

*   Node.js (Check `.nvmrc` or specify version, e.g., v18+)
*   npm, yarn, or pnpm
*   Access to a HashiCorp Vault instance (v1.x+)
*   An OIDC Provider (e.g., Keycloak, Okta, Google, Auth0) configured for this application.
*   A database instance (PostgreSQL, SQL Server, or SQLite file).

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Copy the example environment file:
    ```bash
    cp .env.example .env.local
    ```
    Edit `.env.local` and fill in the required values:

    ```dotenv
    # Database
    # Example for PostgreSQL: postgresql://user:password@host:port/database?schema=public
    # Example for SQLite: file:./dev.db
    # Example for SQL Server: sqlserver://host:port;database=dbname;user=user;password=password;encrypt=true;trustServerCertificate=false;
    DATABASE_URL="your_database_connection_string"

    # NextAuth.js Configuration
    NEXTAUTH_URL="http://localhost:3000" # Replace with your deployed URL in production
    NEXTAUTH_SECRET="generate_a_strong_secret_key" # Run `openssl rand -base64 32`

    # OIDC Provider Configuration (replace with your provider's details)
    # Example using a generic OIDC provider in NextAuth.js:
    OIDC_CLIENT_ID="your_oidc_client_id"
    OIDC_CLIENT_SECRET="your_oidc_client_secret"
    OIDC_ISSUER="your_oidc_issuer_url" # e.g., https://your-keycloak-domain/realms/your-realm
    # Optional: Specify OIDC claim containing user groups for authorization mapping
    OIDC_GROUPS_CLAIM="groups" # Adjust if your provider uses a different claim name

    # Optional: Define an OIDC group name or user email/subject for the initial Admin
    # This user/group will be granted full permissions on first login if no admins exist.
    INITIAL_ADMIN_GROUP="VaultAdmins" # Or use INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_SUBJECT
    # INITIAL_ADMIN_EMAIL="admin@example.com"
    # INITIAL_ADMIN_SUBJECT="oidc-subject-of-admin"

    # Vault connection details are configured via the UI per environment, not here.
    ```

4.  **Set up Database:**
    Run Prisma migrations to create the database schema:
    ```bash
    npx prisma migrate dev
    ```
    You might be prompted to name the migration (e.g., "init").

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser. You should be redirected to your OIDC provider for login.

## Running the Application

*   **Development:** `npm run dev`
*   **Build:** `npm run build`
*   **Production Start:** `npm start`

## Project Structure (Key Directories)