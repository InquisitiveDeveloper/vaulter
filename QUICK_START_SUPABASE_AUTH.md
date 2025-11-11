# 🚀 Quick Start: Supabase Authentication

## ⚡ Get Up and Running in 5 Minutes!

### 1️⃣ Create Supabase Project (2 minutes)

1. Go to **https://supabase.com** → Sign in
2. Click **"New Project"**
3. Fill in:
   - Name: `vault-secret-management`
   - Password: (create a strong password - **SAVE THIS!**)
   - Region: (closest to you)
4. Wait for project to initialize (~2 minutes)

### 2️⃣ Get Your Credentials (1 minute)

1. Once ready, go to **Settings** → **API**
2. Copy these two values:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
```

3. Go to **Settings** → **Database**
4. Copy **Connection pooling** string

### 3️⃣ Configure Your App (1 minute)

1. In your project folder, create `.env.local`:

```bash
cd vault-secret-ui
cp env.example .env.local
```

2. Edit `.env.local` - paste your values:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@....pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:PASSWORD@....pooler.supabase.com:5432/postgres"
```

### 4️⃣ Set Up Database (1 minute)

```bash
npm run db:generate
npm run db:push
```

### 5️⃣ Run Your App! (30 seconds)

```bash
npm run dev
```

Open **http://localhost:3000** 

🎉 **You're done!** You'll see the login page!

---

## 🧪 Test It Out

1. **Click "Create one here"** to sign up
2. Enter:
   - Your name
   - Email address
   - Password (min 6 characters)
3. Click **"Create Secure Account"**
4. **Sign in** with your credentials
5. **Boom!** You're in the dashboard! 🚀

---

## 🆘 Having Issues?

### "Missing Supabase environment variables"
→ Make sure `.env.local` exists and has the correct values

### "Failed to connect to database"
→ Check DATABASE_URL has your password filled in

### "Invalid login credentials"
→ Make sure you signed up first!

---

## 📚 Full Docs

- **Complete Setup Guide:** `SUPABASE_AUTH_SETUP.md`
- **MCP Integration:** `SUPABASE_MCP_SETUP.md`
- **Integration Details:** `SUPABASE_AUTH_INTEGRATION_COMPLETE.md`

---

## ✨ What You Get

✅ **Beautiful Login Page** (with animations!)
✅ **Sign Up Page** (create accounts)
✅ **Protected Routes** (must login to access)
✅ **Session Management** (stays logged in)
✅ **User Database Sync** (automatic)
✅ **Secure Authentication** (Supabase powered)

---

**Ready to manage your secrets securely!** 🔐

