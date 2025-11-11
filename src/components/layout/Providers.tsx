"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ChunkErrorHandler } from "@/components/ChunkErrorHandler"

export function Providers({ children, session }: { children: React.ReactNode, session?: any }) {
  return (
    <ErrorBoundary>
      <ChunkErrorHandler />
      <SessionProvider session={session}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}

