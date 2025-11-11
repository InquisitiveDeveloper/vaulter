# 🚀 Quick Start Guide - Vault Secret Management UI

Get up and running in **5 minutes**!

---

## ⚡ Prerequisites

- Node.js 18+ installed
- A Vault instance (or use a test Vault server)

---

## 📝 Step 1: Create Environment File

Create `.env` in the `vault-secret-ui` directory:

```bash
cd vault-secret-ui
```

Create `.env` with this content:

```env
# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-secure-32-char-secret"

# Environment
NODE_ENV="development"

# Encryption (for Vault credentials)
ENCRYPTION_KEY="replace-with-secure-32-char-key"

# Optional: OIDC Configuration (leave commented for dev mode)
# OIDC_CLIENT_ID="your-oidc-client-id"
# OIDC_CLIENT_SECRET="your-oidc-client-secret"
# OIDC_ISSUER="https://your-oidc-provider.com"
```

### Generate Secure Keys

```bash
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and replace the values in `.env`.

---

## 📦 Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, shadcn/ui, and Vault client.

---

## 🗄️ Step 3: Setup Database

```bash
# Create database schema
npm run db:push

# Seed default groups (Admin, Developers, Viewers)
npm run db:seed
```

---

## 🎯 Step 4: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔐 Step 5: First Login

### Development Login (Default)

Use these credentials to login:

- **Email**: `admin@example.com`
- **Password**: `password123`

> **Note**: In production, disable Credentials provider and use OIDC only!

---

## 🎨 Step 6: Configure Your First Vault Environment

1. **Navigate to Environments**
   - Click "Environments" in the sidebar
   - Click "Add Environment"

2. **Fill in Vault Details**
   ```
   Name: Development Vault
   URL: http://localhost:8200
   Auth Method: Userpass
   Username: your-vault-username
   Password: your-vault-password
   ```

3. **Test Connection**
   - Click "Test Connection" to verify
   - Save the environment

4. **Add Namespaces** (optional)
   - On the environment detail page
   - Click "Add Namespace"
   - Enter namespace name (e.g., `team-a`, `team-b`)

---

## 📱 Step 7: Create Your First Application

1. **Navigate to Applications**
   - Click "Applications" in the sidebar
   - Click "Add Application"

2. **Configure Application**
   ```
   Name: My API Service
   Description: Backend API secrets
   Vault Base Path: secret/data/api-service
   ```

   > **Path Format**: `<mount-point>/data/<path>`
   > For KV V2 engine at `secret/`, use `secret/data/your-app`

---

## 🔑 Step 8: Manage Secrets

1. **Navigate to Secrets**
   - Click "Secrets" in the sidebar

2. **Select Context**
   - Choose Environment
   - Choose Namespace (if applicable)
   - Choose Application

3. **Add a Secret**
   - Click "Add Secret"
   - Enter secret name (e.g., `database-config`)
   - Add key-value pairs:
     ```
     DB_HOST: localhost
     DB_USER: admin
     DB_PASS: secret123
     ```
   - Save

4. **Lock Sensitive Secrets**
   - Click the lock icon to redact values
   - Unlocked users can temporarily view with the eye icon

---

## 👥 Step 9: Configure Access Control

1. **Navigate to Access Control**
   - Click "Access Control" in the sidebar

2. **Create Groups** (Tab: Groups)
   - Default groups already exist:
     - `admin` - Full access
     - `developers` - Read/Write secrets
     - `viewers` - Read-only

3. **Set Permissions** (Tab: Permissions)
   - Select Environment (or "Global")
   - Check permissions for each group:
     - ✅ View Secrets
     - ✅ Edit Secrets
     - ✅ Delete Secrets
     - ✅ Add Applications
     - ✅ Manage Locks
     - ✅ Manage Access
     - ✅ Manage Environments

---

## 📊 Step 10: View Audit Logs

1. **Navigate to Audit Logs**
   - Click "Audit Logs" in the sidebar

2. **Filter Logs**
   - By Action (e.g., `SECRET_CREATE`)
   - By Resource Type (e.g., `Secret`)
   - By Date Range

All user actions are automatically logged!

---

## 🎉 You're All Set!

### What You Can Do Now

✅ **Manage Multiple Vault Instances**
- Add environments for Dev, Staging, Production
- Configure different auth methods per environment

✅ **Organize Secrets by Application**
- Create logical application groupings
- Map to specific Vault paths

✅ **Control Access with Granular Permissions**
- Create custom groups
- Set per-environment permissions

✅ **Advanced Secret Operations**
- Compare secrets across environments
- Copy secrets between contexts
- Import/Export in JSON, CSV, .env formats

✅ **Track Everything**
- View comprehensive audit logs
- Filter by user, action, resource
- Export audit data

---

## 🚀 Advanced Features

### Secret Comparison
1. Go to Secrets page
2. Select an application
3. Click "Compare" (when implemented in UI)
4. Select multiple environment/namespace contexts
5. View differences side-by-side

### Bulk Copy
1. Select source context
2. Click "Copy All Secrets"
3. Choose target environment/namespace
4. Choose overwrite strategy

### Import/Export
1. **Export**: Click "Export" → Choose format (JSON/CSV/.env)
2. **Import**: Click "Import" → Upload JSON file → Review → Import

---

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Vault Connection Failed
- Verify Vault URL is correct
- Check Vault is running: `vault status`
- Verify credentials are correct
- Ensure KV V2 engine is mounted at specified path

### Permission Denied
- Check user is assigned to a group
- Verify group has appropriate permissions
- Check environment-specific permissions

---

## 📚 Additional Resources

- **Full Documentation**: See `README.md`
- **Setup Guide**: See `SETUP_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_STATUS.md`
- **Completion Summary**: See `COMPLETION_SUMMARY.md`

---

## 🔐 Production Deployment

### Switch to PostgreSQL

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
DIRECT_URL="postgresql://user:pass@host:5432/dbname"
```

3. Run migration:
```bash
npm run db:push
npm run db:seed
```

### Enable OIDC

Update `.env`:
```env
OIDC_CLIENT_ID="your-client-id"
OIDC_CLIENT_SECRET="your-client-secret"
OIDC_ISSUER="https://your-oidc-provider.com"
```

### Disable Credentials Provider

In `src/lib/auth.ts`, remove or comment out the `CredentialsProvider`.

---

## 🎯 Next Steps

1. ✅ Configure your Vault instances
2. ✅ Set up your teams and permissions
3. ✅ Migrate your secrets
4. ✅ Train your team
5. ✅ Deploy to production!

---

**Happy Secret Managing! 🔐✨**

For questions or issues, refer to the complete documentation in the project root.



