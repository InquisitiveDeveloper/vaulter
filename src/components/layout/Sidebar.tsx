"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Database,
  FolderOpen,
  Key,
  Shield,
  FileText,
  LayoutDashboard,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Environments", href: "/dashboard/environments", icon: Database },
  { name: "Applications", href: "/dashboard/applications", icon: FolderOpen },
  { name: "Secrets", href: "/dashboard/secrets", icon: Key },
  { name: "Access Control", href: "/dashboard/access-control", icon: Shield },
  { name: "Audit Logs", href: "/dashboard/audit-logs", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Key className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Vault Manager</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}



