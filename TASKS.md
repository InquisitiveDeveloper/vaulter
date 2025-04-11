# Vault Secret Management UI - Development Tasks

This list breaks down the development work based on the PLANNING.md document.

## Phase 1: Project Setup & Core Foundation

*   [ ] **Project Init:** Initialize Next.js 15 project (`npx create-next-app@latest`).
*   [ ] **Styling Setup:** Integrate Tailwind CSS.
*   [ ] **UI Component Setup:** Integrate Shadcn/ui (`npx shadcn-ui@latest init`).
*   [ ] **Prisma Setup:** Initialize Prisma (`npx prisma init`).
    *   [ ] Define initial `schema.prisma` (User, Group, Environment, Namespace, Application, Permission, LockedSecretKey).
    *   [ ] Configure `datasource` for SQLite (for initial dev).
    *   [ ] Configure `datasource` for PostgreSQL.
    *   [ ] Configure `datasource` for SQL Server.
*   [ ] **Database Migration:** Generate initial migration (`npx prisma migrate dev --name init`).
*   [ ] **Vault Client:** Add `node-vault` dependency (`npm install node-vault @types/node-vault`).
*   [ ] **Vault Service:** Create initial Vault service structure (`lib/vault.ts`) - connection logic TBD later.
*   [ ] **Layout:** Create basic application layout (Sidebar navigation, main content area) using Shadcn components.

## Phase 2: Authentication & Authorization

*   [ ] **NextAuth.js Setup:** Install and configure NextAuth.js (`npm install next-auth`).
*   [ ] **OIDC Provider:** Configure NextAuth.js with an OIDC provider (using environment variables for client ID, secret, issuer URL).
*   [ ] **Auth Middleware:** Protect application routes using NextAuth.js middleware.
*   [ ] **User Profile:** Display basic logged-in user information.
*   [ ] **User/Group Sync:** Implement logic (e.g., on sign-in) to map OIDC user info (subject, email, groups claim) to internal User and Group models in the database.
*   [ ] **Authorization Service:** Create helper functions/middleware (`lib/authz.ts`) to check user permissions based on their group and the target resource (e.g., `canUser(userId, 'viewSecrets', environmentId)`).

## Phase 3: Environment & Namespace Management

*   [ ] **UI: Environment List:** Create a page to display configured Environments.
*   [ ] **API: Environments CRUD:** Create API routes/Route Handlers for:
    *   [ ] `GET /api/environments` (List environments)
    *   [ ] `POST /api/environments` (Add new environment)
    *   [ ] `GET /api/environments/[id]` (Get single environment details)
    *   [ ] `PUT /api/environments/[id]` (Update environment)
    *   [ ] `DELETE /api/environments/[id]` (Delete environment)
*   [ ] **UI: Environment Form:** Create a form (dialog or page) for adding/editing Environments (Name, Description, Vault URL, Auth details).
    *   [ ] **Security:** Handle Vault password input securely (consider storing encrypted).
*   [ ] **UI: Namespace Management:** Integrate Namespace management within the Environment view/edit form (or dedicated section).
*   [ ] **API: Namespaces CRUD:** Create API routes for adding/removing Namespaces associated with an Environment.
    *   [ ] `POST /api/environments/[envId]/namespaces`
    *   [ ] `DELETE /api/environments/[envId]/namespaces/[nsId]` (or delete by name)
*   [ ] **Authorization:** Apply permission checks (`canManageEnvs`) to Environment CRUD operations.

## Phase 4: Application & Secret Management

*   [ ] **UI: Application List:** Create UI section (perhaps sidebar or dropdown) to list/select Applications.
*   [ ] **API: Application CRUD:** Create API routes for managing Applications (Name, Vault Base Path).
    *   [ ] `GET /api/applications`
    *   [ ] `POST /api/applications`
    *   [ ] `PUT /api/applications/[id]`
    *   [ ] `DELETE /api/applications/[id]`
*   [ ] **UI: Application Form:** Create form for adding/editing Applications.
*   [ ] **Authorization:** Apply permission checks (`canAddApps`) to Application CRUD.
*   [ ] **UI: Secret View:**
    *   [ ] Create main secret viewing/editing page.
    *   [ ] Add selectors for Environment, Namespace, and Application.
    *   [ ] Fetch and display secrets (key-value pairs) from Vault based on selection.
*   [ ] **API: Secret Read:** Create API route (`GET /api/secrets?envId=...&nsName=...&appId=...`) to fetch secrets from Vault.
    *   [ ] Implement Vault connection logic using selected Environment's config.
    *   [ ] Handle Vault authentication (Userpass initially).
    *   [ ] Fetch secrets from the correct path (`<app.vaultBasePath>`).
*   [ ] **Authorization:** Apply `canViewSecrets` check in the Secret Read API.
*   [ ] **UI: Secret Edit/Add:** Implement inline editing or a form/dialog to add/update key-value pairs.
*   [ ] **API: Secret Write:** Create API route (`POST /api/secrets?envId=...&nsName=...&appId=...`) to write/update secrets in Vault.
*   [ ] **Authorization:** Apply `canEditSecrets` check.
*   [ ] **UI: Secret Delete:** Implement button/action to delete individual keys.
*   [ ] **API: Secret Delete:** Create API route (`DELETE /api/secrets?envId=...&nsName=...&appId=...&key=...`) to delete keys from Vault.
*   [ ] **Authorization:** Apply `canDeleteSecrets` check.

## Phase 5: Secret Redaction (Locking)

*   [ ] **UI: Lock/Unlock Buttons:** Add Lock ( Padlock ) and Unlock/View ( Eye ) icons next to each secret value.
*   [ ] **UI: Redaction Logic:** Implement client-side logic to show/hide secret values based on locked state and button clicks.
*   [ ] **API: Update Lock State:** Create API route (`POST /api/locks`) to store the locked state of a specific key (AppID, EnvID, NamespaceName, SecretKey) in the `LockedSecretKey` database table.
*   [ ] **API: Delete Lock State:** Create API route (`DELETE /api/locks`) to remove the locked state entry when unlocked persistently (if desired, or just handle visibility client-side).
*   [ ] **API: Fetch Lock States:** Modify the Secret Read API (or create a separate one) to fetch the lock status for keys along with their values.
*   [ ] **Authorization:** Apply `canManageLocks` permission check to the Lock State API routes.

## Phase 6: Secret Comparison & Copying

*   [ ] **UI: Multi-Select:** Enhance Environment/Namespace selectors to allow multiple selections for comparison.
*   [ ] **UI: Comparison View:** Design a view (e.g., side-by-side tables or a merged table) to display secrets for the *same* application across selected Env/Namespaces.
*   [ ] **API: Comparison Fetch:** Modify the Secret Read API or create a new one (`GET /api/secrets/compare?appId=...&contexts=[{envId, nsName},{envId, nsName}]`) to fetch secrets from multiple Vault contexts.
*   [ ] **UI: Highlight Differences:** Implement logic to compare values for the same key across contexts and apply highlighting (e.g., different background color) to rows with differing values.
*   [ ] **UI: Copy Button (Individual):** Add a "copy" button next to secret values in the comparison view to trigger copying from one context to another.
*   [ ] **API: Copy Secret (Individual):** Create API route (`POST /api/secrets/copy/individual`) taking source/destination context, app ID, and secret key/value. This will use the Secret Write API logic internally after permission checks.
*   [ ] **Authorization:** Check `canEditSecrets` permission for the *destination* environment.
*   [ ] **UI: Copy Button (Namespace/Bulk):** Add a button to copy *all* secrets for the current application from a source Env/Namespace to a destination Env/Namespace.
*   [ ] **API: Copy Secrets (Bulk):** Create API route (`POST /api/secrets/copy/bulk`) taking source/destination context and app ID. Fetch all secrets from the source and write them to the destination.
*   [ ] **Authorization:** Check `canEditSecrets` permission for the *destination* environment.

## Phase 7: Access Control Management

*   [ ] **UI: Group Management:** Create page/section for Admins to CRUD User Groups.
*   [ ] **API: Group CRUD:** Create API routes for managing Groups.
*   [ ] **UI: Access Matrix:** Create the main Access Control page.
    *   [ ] Display Groups vs Environments.
    *   [ ] Show checkboxes/toggles for each granular permission (`canViewSecrets`, `canEditSecrets`, etc.).
*   [ ] **API: Permission Management:** Create API routes (`GET /api/permissions`, `PUT /api/permissions`) to fetch and update the `Permission` table entries based on UI changes in the Access Matrix.
*   [ ] **Authorization:** Restrict access to Group/Permission management APIs/UIs based on `canManageAccess` permission (likely assigned to an Admin group). Define how the initial Admin user/group is created (e.g., via OIDC claim, environment variable, or seed script).

## Phase 8: Secret Version History (KV V2)

*   [ ] **Vault Service:** Extend `lib/vault.ts` to fetch secret version metadata and specific versions (`getSecretVersions`, `getSecretVersion`).
*   [ ] **API: Version History:** Create API route (`GET /api/secrets/versions?envId=...&nsName=...&appId=...&key=...`) to fetch version list for a secret key.
*   [ ] **API: Specific Version:** Create API route (`GET /api/secrets/version?envId=...&nsName=...&appId=...&key=...&version=...`) to fetch a specific version's data.
*   [ ] **UI: History Button:** Add a "History" icon/button next to secret keys in the main view.
*   [ ] **UI: History Modal/View:** Create a modal or panel to display the list of versions (version number, timestamp, potentially who made the change if Vault metadata provides it).
*   [ ] **UI: View Specific Version:** Allow selecting a version from the history view to see its value (respecting lock/redaction status).
*   [ ] **Authorization:** Apply `canViewSecrets` check to version history APIs.
*   [ ] **Audit:** Log when a user views historical secret data (optional, but good practice).

## Phase 9: Bulk Import / Export

*   [ ] **UI: Export Button:** Add "Export" button to the Secret View (active when Env/Namespace/App selected).
*   [ ] **API: Export Secrets:** Create API route (`GET /api/secrets/export?envId=...&nsName=...&appId=...&format=json|csv`).
    *   [ ] Fetch secrets via Vault service.
    *   [ ] Format data (JSON array of {key: value} or CSV).
    *   [ ] Set `Content-Disposition` header for download.
    *   [ ] Apply `canViewSecrets` check.
    *   [ ] **Audit:** Log the export action.
*   [ ] **UI: Import Button:** Add "Import" button.
*   [ ] **UI: Import Dialog/Form:** Create component for file upload (accept JSON/CSV). Include options (e.g., overwrite existing keys?).
*   [ ] **API: Import Secrets:** Create API route (`POST /api/secrets/import?envId=...&nsName=...&appId=...`).
    *   [ ] Handle multipart/form-data upload.
    *   [ ] Add file parsing library (e.g., PapaParse for CSV).
    *   [ ] Parse uploaded file (JSON/CSV).
    *   [ ] Validate data structure.
    *   [ ] Iterate through secrets and write to Vault via Vault service (handle overwrites based on UI option).
    *   [ ] Implement robust error handling (parsing, validation, Vault writes). Return meaningful error messages.
    *   [ ] Apply `canEditSecrets` check.
    *   [ ] **Audit:** Log the bulk import action (include filename, number of secrets attempted/succeeded).

## Phase 10: Access Control Management

*   [ ] **UI: Group Management:** ...
*   [ ] **API: Group CRUD:** ...
    *   [ ] **Audit:** Log group create/update/delete actions.
*   [ ] **UI: Access Matrix:** ...
*   [ ] **API: Permission Management:** ...
    *   [ ] **Audit:** Log permission grant/revoke actions.
*   [ ] **Authorization (Access Management):** ...

## Phase 11: Audit Logging View

*   [ ] **Audit Log Service:** Create `lib/audit.ts` with a function like `logAction(userId, userEmail, action, resourceType, resourceId, targetDetails, success, clientIp)`.
*   [ ] **Integration:** Call `logAction` from all relevant API handlers (CRUD for Env, Ns, App, Secrets, Locks, Permissions, Groups; Bulk Ops; Copy Ops; potentially logins/logouts).
*   [ ] **API: Fetch Audit Logs:** Create API route (`GET /api/audit-logs?...`) with pagination and filtering options (by user, date range, action type, resource type/id).
*   [ ] **UI: Audit Log Page:** Create a page to display audit logs in a table format.
*   [ ] **UI: Filtering/Pagination:** Add controls for filtering and navigating audit log pages.
*   [ ] **Authorization:** Define who can view audit logs (e.g., a specific permission `canViewAuditLogs` assigned to Admin/Security groups).

## Phase 12: Testing & Refinement

*   [ ] **Unit Tests:** Write unit tests for utility functions, Vault service logic (mocking Vault client), and authorization helpers.
*   [ ] **Integration Tests:** Test API routes, including database interactions and Vault communication (potentially against a local dev Vault instance).
*   [ ] **E2E Tests (Optional):** Use tools like Playwright or Cypress to test key user flows.
*   [ ] **UI/UX Refinement:** Polish the UI, improve usability, ensure responsiveness.
*   [ ] **Error Handling:** Implement robust error handling and user feedback (e.g., using toasts for success/failure messages).
*   [ ] **Security Audit:** Review code for potential security vulnerabilities (OWASP Top 10).
*   [ ] **Performance Optimization:** Identify and address any performance bottlenecks (API response times, UI rendering).

## Phase 13: Documentation & Deployment

*   [ ] **README:** Update README.md with final setup, configuration, and usage instructions.
*   [ ] **Environment Variables:** Document all required environment variables (`.env.example`).
*   [ ] **Database Migrations:** Ensure migrations are stable and cover all schema changes.
*   [ ] **Build Process:** Configure build (`npm run build`).
*   [ ] **Deployment:**
    *   [ ] Create Dockerfile.
    *   [ ] Prepare deployment scripts/configuration (e.g., docker-compose.yml, Kubernetes manifests).
*   [ ] **Code Cleanup:** Remove console logs, unused code.