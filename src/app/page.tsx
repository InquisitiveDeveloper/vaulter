"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect authenticated users to dashboard
        router.push("/dashboard")
      } else {
        // Redirect unauthenticated users to sign in
        router.push("/auth/signin")
      }
    }
  }, [user, loading, router])

  // Show loading state
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      <p className="mt-4 text-sm text-slate-300">Loading Vault Security System...</p>
    </main>
  )
}


