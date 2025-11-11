"use client"

import { useAuth } from "@/contexts/AuthContext"

// Force dynamic rendering since we use client-side auth state
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            VAULT SECRETS
          </h1>
          <p className="text-slate-300 text-lg">
            Enterprise-grade secret management platform
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 shadow-2xl">
          <h2 className="text-3xl font-semibold mb-6 text-white">
            Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : user?.email ? `, ${user.email.split('@')[0]}` : ""}!
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Securely manage your vault secrets across multiple environments with enterprise-grade protection
          </p>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 rounded-lg border border-blue-500/30">
              <div className="text-3xl font-bold text-white mb-2">3</div>
              <div className="text-blue-300 font-medium">Environments</div>
              <div className="text-blue-400/70 text-sm">Active Vault instances</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-lg border border-purple-500/30">
              <div className="text-3xl font-bold text-white mb-2">8</div>
              <div className="text-purple-300 font-medium">Applications</div>
              <div className="text-purple-400/70 text-sm">Configured paths</div>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-lg border border-green-500/30">
              <div className="text-3xl font-bold text-white mb-2">147</div>
              <div className="text-green-300 font-medium">Secrets</div>
              <div className="text-green-400/70 text-sm">Total managed</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <a href="/dashboard/environments" className="group p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-slate-700/50 hover:to-slate-600/50 border border-slate-600/50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">Environments</h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Manage your Vault instances</p>
                </div>
              </div>
            </a>

            <a href="/dashboard/applications" className="group p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-slate-700/50 hover:to-slate-600/50 border border-slate-600/50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">Applications</h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Configure application paths</p>
                </div>
              </div>
            </a>

            <a href="/dashboard/secrets" className="group p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-slate-700/50 hover:to-slate-600/50 border border-slate-600/50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-green-300 transition-colors">Secrets</h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Manage your secrets</p>
                </div>
              </div>
            </a>

            <a href="/dashboard/access-control" className="group p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-slate-700/50 hover:to-slate-600/50 border border-slate-600/50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-orange-300 transition-colors">Access Control</h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Manage permissions</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}



