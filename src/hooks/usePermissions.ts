"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export interface UserPermissions {
  canViewSecrets: boolean
  canEditSecrets: boolean
  canDeleteSecrets: boolean
  canAddApps: boolean
  canManageLocks: boolean
  canManageAccess: boolean
  canManageEnvs: boolean
}

/**
 * Hook to get current user's permissions
 */
export function usePermissions(environmentId?: string) {
  const { data: session } = useSession()
  const [permissions, setPermissions] = useState<UserPermissions>({
    canViewSecrets: false,
    canEditSecrets: false,
    canDeleteSecrets: false,
    canAddApps: false,
    canManageLocks: false,
    canManageAccess: false,
    canManageEnvs: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }

      try {
        const params = new URLSearchParams()
        if (environmentId) {
          params.set("environmentId", environmentId)
        }

        const response = await fetch(`/api/users/${session.user.id}/permissions?${params}`)
        if (response.ok) {
          const data = await response.json()
          setPermissions(data)
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [session?.user?.id, environmentId])

  return {
    permissions,
    loading,
    hasPermission: (permission: keyof UserPermissions) => permissions[permission],
  }
}



