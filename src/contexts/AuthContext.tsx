"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: any
  session: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false)
    }
  }, [status])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { error: { message: result.error } }
      }

      if (result?.ok) {
        // Redirect to dashboard on successful login
        router.push('/dashboard')
      }

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    // For development, signup is not implemented
    // In production, you would implement signup logic
    return { error: { message: 'Signup not implemented for development mode' } }
  }

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/auth/signin' })
  }

  const value = {
    user: session?.user || null,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

