import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // OIDC Provider Configuration
    {
      id: "oidc",
      name: "OIDC",
      type: "oauth",
      wellKnown: process.env.OIDC_ISSUER + "/.well-known/openid_configuration",
      authorization: { params: { scope: "openid email profile groups" } },
      idToken: true,
      checks: ["pkce", "state"],
      clientId: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          groups: profile.groups || [],
        }
      },
    },
    // Fallback credentials provider for development/testing
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // In production, validate against your user database
        // For development, accept any credentials
        if (process.env.NODE_ENV === "development") {
          return {
            id: "dev-user",
            email: credentials.email,
            name: "Development User",
            groups: ["admin"],
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Auto-create user on OIDC login
      if (account?.provider === "oidc" && profile) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { oidcSubject: profile.sub },
          })

          if (!existingUser) {
            // Create new user
            await prisma.user.create({
              data: {
                email: profile.email || user.email!,
                name: profile.name || user.name,
                oidcSubject: profile.sub,
              },
            })
          } else {
            // Update existing user info
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                email: profile.email || user.email!,
                name: profile.name || user.name,
              },
            })
          }
        } catch (error) {
          console.error("Error creating/updating user:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.groups = (user as any).groups || []
      }

      // Extract groups from OIDC claims if available
      if (profile?.groups) {
        token.groups = profile.groups
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.groups = token.groups as string[]
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}
