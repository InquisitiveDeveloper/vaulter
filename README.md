# Vault Secret Management UI

A modern, production-grade Next.js application for managing secrets across multiple HashiCorp Vault instances with OIDC authentication, granular access control, and comprehensive secret management capabilities.

## 🌟 Features

### Implemented (Phases 1-2 Complete, Phase 3 In Progress)

- ✅ **OIDC Authentication** - Secure login with OpenID Connect or development credentials
- ✅ **Environment Management** - Configure multiple Vault instances
- ✅ **Namespace Support** - Manage Vault namespaces per environment
- ✅ **Application Paths** - Define logical application secret paths
- ✅ **Vault Connection Testing** - Verify connectivity before deployment
- ✅ **Encrypted Credentials** - Secure storage of Vault credentials
- ✅ **Dark Mode** - Beautiful UI with light/dark theme support
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ⏳ **Secret Management** - CRUD operations on secrets (API complete, UI pending)

### Planned Features

- ⏳ Secret lock/unlock (redaction)
- ⏳ Version history viewer
- ⏳ Access control matrix
- ⏳ Secret comparison across environments
- ⏳ Bulk import/export
- ⏳ Comprehensive audit logging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A HashiCorp Vault instance (or use development mode)
- (Optional) OIDC provider for production authentication

### Installation

1. **Clone and install dependencies**:

```bash
cd vault-secret-ui
npm install
```

2. **Create environment file**:

Create a `.env` file in the `vault-secret-ui` directory:

```env
# Database Configuration - SQLite for development
DATABASE_URL="file:./dev.db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-minimum-32-characters-required-for-security"

# OIDC Provider (Optional - for production)
# OIDC_CLIENT_ID="your-client-id"
# OIDC_CLIENT_SECRET="your-client-secret"
# OIDC_ISSUER="https://your-oidc-provider.com"

# Application Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_NAME="Vault Secret Management UI"

# Encryption Key (for encrypting Vault credentials)
ENCRYPTION_KEY="your-encryption-key-minimum-32-characters-very-important"
```

**Important**: Generate secure random values for `NEXTAUTH_SECRET` and `ENCRYPTION_KEY`:
```bash
openssl rand -base64 32
```

3. **Initialize the database**:

```bash
npm run db:push    # Create database tables
npm run db:seed    # Seed default groups and permissions
```

4. **Start the development server**:

```bash
npm run dev
```

5. **Access the application**:

Open http://localhost:3000 in your browser.

**Development Mode**: Sign in with any email/password combination.

## 📚 Database Configuration

### SQLite (Default - Development)

The project uses SQLite by default for easy local development. The database file is created as `dev.db`.

### PostgreSQL / Supabase (Production)

To use PostgreSQL or Supabase:

1. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Required for Supabase
}
```

2. Update your `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:password@host:5432/dbname"
```

3. Run migrations:

```bash
npm run db:push
npm run db:seed
```

### MS SQL Server

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}
```

## 🔒 Vault Configuration

### Supported Authentication Methods

- **Userpass** - Username and password authentication
- **AppRole** - Role ID and Secret ID (planned)
- **Token** - Direct token authentication (planned)

### Adding Your First Vault Environment

1. Navigate to **Environments** in the sidebar
2. Click **Add Environment**
3. Fill in the details:
   - **Name**: e.g., "production", "staging", "dev"
   - **Vault Address**: e.g., `https://vault.example.com:8200`
   - **Auth Method**: Select "Username/Password"
   - **User ID**: Your Vault username
   - **Password**: Your Vault password (encrypted before storage)
4. Click **Test Connection** to verify
5. Save the environment

### Adding Namespaces

1. Go to **Environments** → Select your environment
2. Switch to the **Namespaces** tab
3. Click **Add Namespace**
4. Enter the namespace path (or leave empty for root)

### Adding Applications

1. Navigate to **Applications**
2. Click **Add Application**
3. Provide:
   - **Name**: Friendly name (e.g., "MyWebApp")
   - **Vault Base Path**: Path in Vault (e.g., "secret/myapp")
   - **Description**: Optional description

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Shadcn/ui + Tailwind CSS
- **Authentication**: NextAuth.js (OIDC + Credentials)
- **Database**: Prisma ORM (SQLite/PostgreSQL/SQL Server)
- **Vault Client**: Custom implementation with token caching
- **Encryption**: AES-256-GCM for sensitive data

### Project Structure

```
vault-secret-ui/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Default data seeder
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── environments/
│   │   │   ├── applications/
│   │   │   ├── secrets/       # (UI pending)
│   │   │   ├── access-control/ # (Pending)
│   │   │   └── audit-logs/    # (Pending)
│   │   ├── api/               # API routes
│   │   │   ├── environments/
│   │   │   ├── namespaces/
│   │   │   ├── applications/
│   │   │   └── secrets/
│   │   ├── auth/              # Auth pages
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                # Shadcn/ui components
│   │   ├── layout/            # App layout components
│   │   ├── environments/
│   │   ├── namespaces/
│   │   └── applications/
│   ├── lib/
│   │   ├── vault/             # Vault client & operations
│   │   ├── validations/       # Zod schemas
│   │   ├── auth.ts            # NextAuth config
│   │   ├── crypto.ts          # Encryption utilities
│   │   ├── db-helpers.ts      # Database queries
│   │   ├── prisma.ts          # Prisma client
│   │   └── utils.ts           # Utility functions
│   ├── hooks/                 # React hooks
│   └── types/                 # TypeScript types
├── .env                       # Environment variables (create this)
├── components.json            # Shadcn/ui config
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🔐 Security Considerations

### Encryption

- Vault credentials are encrypted using AES-256-GCM before database storage
- Encryption key must be set via `ENCRYPTION_KEY` environment variable
- **Never commit** your `.env` file to version control

### Authentication

- OIDC recommended for production
- Development credentials should only be used in development
- All routes are protected by NextAuth.js middleware

### Vault Tokens

- Tokens are cached in memory with automatic expiration
- Token renewal is handled automatically
- Tokens are never stored in the database

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

## 🎯 Default Groups & Permissions

The seed script creates three default groups:

### Admin
- Full access to all features
- Can manage environments, applications, secrets
- Can manage access control
- Can view audit logs

### Developers
- Can view and edit secrets
- Can add applications
- Cannot delete secrets
- Cannot manage access control

### Viewers
- Read-only access to secrets
- Cannot modify anything

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `Environment variable not found: DATABASE_URL`

**Solution**: Create a `.env` file with `DATABASE_URL="file:./dev.db"`

### Vault Connection Fails

1. Verify Vault is running and accessible
2. Check the Vault address (include protocol: `https://`)
3. Verify credentials are correct
4. Check network connectivity
5. Ensure Vault namespace is correct (if using Enterprise)

### Authentication Issues

**Development Mode**: Any email/password will work
**Production**: Ensure OIDC environment variables are set correctly

## 📖 Documentation

- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Track project progress
- [Prisma Schema](./prisma/schema.prisma) - Database schema documentation

## 🤝 Contributing

This is a custom internal tool. For modifications:

1. Follow the existing code patterns
2. Update TypeScript types
3. Add Zod validation for new inputs
4. Test Vault connectivity before committing
5. Update IMPLEMENTATION_STATUS.md

## 📄 License

Private/Internal Use

## 🔮 Roadmap

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed progress tracking.

**Next Milestones**:
1. Complete Secret Management UI
2. Implement secret lock/unlock
3. Build Access Control interface
4. Add audit logging
5. Secret comparison & bulk operations

---

**Built with** Next.js, Prisma, Shadcn/ui, and HashiCorp Vault
