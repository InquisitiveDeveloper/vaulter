import { prisma } from "@/lib/prisma"

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
 * Get user permissions for a specific environment (or global if no environmentId)
 */
export async function getUserPermissions(
  userId: string,
  environmentId?: string
): Promise<UserPermissions> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      groups: {
        include: {
          permissions: {
            where: environmentId
              ? { OR: [{ environmentId }, { environmentId: null }] }
              : { environmentId: null },
          },
        },
      },
    },
  })

  if (!user) {
    return {
      canViewSecrets: false,
      canEditSecrets: false,
      canDeleteSecrets: false,
      canAddApps: false,
      canManageLocks: false,
      canManageAccess: false,
      canManageEnvs: false,
    }
  }

  // Aggregate permissions from all groups (OR logic - if any group grants, permission is granted)
  const permissions: UserPermissions = {
    canViewSecrets: false,
    canEditSecrets: false,
    canDeleteSecrets: false,
    canAddApps: false,
    canManageLocks: false,
    canManageAccess: false,
    canManageEnvs: false,
  }

  user.groups.forEach((group) => {
    group.permissions.forEach((permission) => {
      permissions.canViewSecrets = permissions.canViewSecrets || permission.canViewSecrets
      permissions.canEditSecrets = permissions.canEditSecrets || permission.canEditSecrets
      permissions.canDeleteSecrets = permissions.canDeleteSecrets || permission.canDeleteSecrets
      permissions.canAddApps = permissions.canAddApps || permission.canAddApps
      permissions.canManageLocks = permissions.canManageLocks || permission.canManageLocks
      permissions.canManageAccess = permissions.canManageAccess || permission.canManageAccess
      permissions.canManageEnvs = permissions.canManageEnvs || permission.canManageEnvs
    })
  })

  return permissions
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  permission: keyof UserPermissions,
  environmentId?: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, environmentId)
  return permissions[permission]
}

/**
 * Require permission - throws error if not authorized
 */
export async function requirePermission(
  userId: string,
  permission: keyof UserPermissions,
  environmentId?: string
): Promise<void> {
  const hasAccess = await hasPermission(userId, permission, environmentId)
  if (!hasAccess) {
    throw new Error(`Permission denied: ${permission}`)
  }
}



