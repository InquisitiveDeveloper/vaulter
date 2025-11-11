"use client"

import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Confetti } from "@/components/ui/confetti"
import { useState, useEffect } from "react"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  // Listen for success events to trigger confetti
  useEffect(() => {
    const handleSuccess = () => {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }

    window.addEventListener('vault-success', handleSuccess)
    return () => window.removeEventListener('vault-success', handleSuccess)
  }, [])

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Global Success Animation */}
      {showConfetti && <Confetti />}
    </ErrorBoundary>
  )
}



