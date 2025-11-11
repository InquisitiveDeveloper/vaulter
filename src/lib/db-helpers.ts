import { prisma } from "./prisma"

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      groups: true,
    },
  })
}

/**
 * Get user by OIDC subject
 */
export async function getUserByOidcSubject(oidcSubject: string) {
  return await prisma.user.findUnique({
    where: { oidcSubject },
    include: {
      groups: true,
    },
  })
}

/**
 * Get all environments
 */
export async function getAllEnvironments() {
  return await prisma.environment.findMany({
    include: {
      namespaces: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

/**
 * Get environment by ID
 */
export async function getEnvironmentById(id: string) {
  return await prisma.environment.findUnique({
    where: { id },
    include: {
      namespaces: true,
    },
  })
}

/**
 * Get all applications
 */
export async function getAllApplications() {
  return await prisma.application.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

/**
 * Get application by ID
 */
export async function getApplicationById(id: string) {
  return await prisma.application.findUnique({
    where: { id },
    include: {
      lockedKeys: true,
    },
  })
}

/**
 * Get all groups
 */
export async function getAllGroups() {
  return await prisma.group.findMany({
    include: {
      users: true,
      permissions: {
        include: {
          environment: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

/**
 * Get group by ID
 */
export async function getGroupById(id: string) {
  return await prisma.group.findUnique({
    where: { id },
    include: {
      users: true,
      permissions: {
        include: {
          environment: true,
        },
      },
    },
  })
}

/**
 * Get user permissions for a specific environment
 */
export async function getUserPermissions(userId: string, environmentId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      groups: {
        include: {
          permissions: {
            where: environmentId
              ? { OR: [{ environmentId }, { environmentId: null }] }
              : { environmentId: null },
            include: {
              environment: true,
            },
          },
        },
      },
    },
  })

  if (!user) return null

  // Aggregate permissions from all groups
  const permissions = {
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
      // Global permissions or environment-specific permissions
      if (!environmentId || !permission.environmentId || permission.environmentId === environmentId) {
        permissions.canViewSecrets = permissions.canViewSecrets || permission.canViewSecrets
        permissions.canEditSecrets = permissions.canEditSecrets || permission.canEditSecrets
        permissions.canDeleteSecrets = permissions.canDeleteSecrets || permission.canDeleteSecrets
        permissions.canAddApps = permissions.canAddApps || permission.canAddApps
        permissions.canManageLocks = permissions.canManageLocks || permission.canManageLocks
        permissions.canManageAccess = permissions.canManageAccess || permission.canManageAccess
        permissions.canManageEnvs = permissions.canManageEnvs || permission.canManageEnvs
      }
    })
  })

  return permissions
}

/**
 * Check if a secret key is locked
 */
export async function isSecretKeyLocked(
  applicationId: string,
  environmentId: string,
  namespaceName: string,
  secretKey: string
) {
  const lockedKey = await prisma.lockedSecretKey.findUnique({
    where: {
      applicationId_environmentId_namespaceName_secretKey: {
        applicationId,
        environmentId,
        namespaceName,
        secretKey,
      },
    },
  })

  return !!lockedKey
}

/**
 * Get audit logs with pagination
 */
export async function getAuditLogs(options: {
  skip?: number
  take?: number
  userId?: string
  action?: string
  resourceType?: string
  startDate?: Date
  endDate?: Date
}) {
  const where: any = {}

  if (options.userId) {
    where.userId = options.userId
  }

  if (options.action) {
    where.action = options.action
  }

  if (options.resourceType) {
    where.resourceType = options.resourceType
  }

  if (options.startDate || options.endDate) {
    where.timestamp = {}
    if (options.startDate) {
      where.timestamp.gte = options.startDate
    }
    if (options.endDate) {
      where.timestamp.lte = options.endDate
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      skip: options.skip || 0,
      take: options.take || 50,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total }
}



