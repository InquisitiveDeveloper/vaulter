import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import { getUserPermissions, hasPermission, requirePermission } from '../check'
import { prisma } from '@/lib/prisma'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

describe('Permission Check Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserPermissions', () => {
    test('should return all false permissions for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const permissions = await getUserPermissions('non-existent-user')

      expect(permissions).toEqual({
        canViewSecrets: false,
        canEditSecrets: false,
        canDeleteSecrets: false,
        canAddApps: false,
        canManageLocks: false,
        canManageAccess: false,
        canManageEnvs: false,
      })
    })

    test('should return permissions from user groups', async () => {
      const mockUser = {
        id: 'user-1',
        groups: [
          {
            id: 'group-1',
            permissions: [
              {
                id: 'perm-1',
                canViewSecrets: true,
                canEditSecrets: true,
                canDeleteSecrets: false,
                canAddApps: false,
                canManageLocks: false,
                canManageAccess: false,
                canManageEnvs: false,
                environmentId: null,
              },
            ],
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const permissions = await getUserPermissions('user-1')

      expect(permissions.canViewSecrets).toBe(true)
      expect(permissions.canEditSecrets).toBe(true)
      expect(permissions.canDeleteSecrets).toBe(false)
    })

    test('should aggregate permissions from multiple groups (OR logic)', async () => {
      const mockUser = {
        id: 'user-1',
        groups: [
          {
            id: 'group-1',
            permissions: [
              {
                id: 'perm-1',
                canViewSecrets: true,
                canEditSecrets: false,
                canDeleteSecrets: false,
                canAddApps: false,
                canManageLocks: false,
                canManageAccess: false,
                canManageEnvs: false,
                environmentId: null,
              },
            ],
          },
          {
            id: 'group-2',
            permissions: [
              {
                id: 'perm-2',
                canViewSecrets: false,
                canEditSecrets: true,
                canDeleteSecrets: true,
                canAddApps: false,
                canManageLocks: false,
                canManageAccess: false,
                canManageEnvs: false,
                environmentId: null,
              },
            ],
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const permissions = await getUserPermissions('user-1')

      expect(permissions.canViewSecrets).toBe(true)
      expect(permissions.canEditSecrets).toBe(true)
      expect(permissions.canDeleteSecrets).toBe(true)
    })

    test('should filter permissions by environment', async () => {
      const mockUser = {
        id: 'user-1',
        groups: [
          {
            id: 'group-1',
            permissions: [
              {
                id: 'perm-1',
                canViewSecrets: true,
                canEditSecrets: true,
                canDeleteSecrets: false,
                canAddApps: false,
                canManageLocks: false,
                canManageAccess: false,
                canManageEnvs: false,
                environmentId: 'env-1',
              },
            ],
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const permissions = await getUserPermissions('user-1', 'env-1')

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          groups: {
            include: {
              permissions: {
                where: {
                  OR: [{ environmentId: 'env-1' }, { environmentId: null }],
                },
              },
            },
          },
        },
      })
    })

    test('should handle user with no groups', async () => {
      const mockUser = {
        id: 'user-1',
        groups: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const permissions = await getUserPermissions('user-1')

      expect(permissions).toEqual({
        canViewSecrets: false,
        canEditSecrets: false,
        canDeleteSecrets: false,
        canAddApps: false,
        canManageLocks: false,
        canManageAccess: false,
        canManageEnvs: false,
      })
    })
  })

  describe('hasPermission', () => {
    test('should return true when user has permission', async () => {
      const mockUser = {
        id: 'user-1',
        groups: [
          {
            id: 'group-1',
            permissions: [
              {
                id: 'perm-1',
                canViewSecrets: true,
                canEditSecrets: false,
                canDeleteSecrets: false,
                canAddApps: false,
                canManageLocks: false,
                canManageAccess: false,
                canManageEnvs: false,
                environmentId: null,
              },
            ],
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await hasPermission('user-1', 'canViewSecrets')

      expect(result).toBe(true)
    })

    test('should return false when user lacks permission', async () => {
      const mockUser = {
        id: 'user-1',
        groups: [
          {
            id: 'group-1',
            permissions: [
              {
                id: 'perm-1',
                canViewSecrets: true,
                canEditSecrets: false,
                canDeleteSecrets: false,
                canAddApps: false,
                canManageLocks: false,
                canManageAccess: false,
                canManageEnvs: false,
                environmentId: null,
              },
            ],
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const result = await hasPermission('user-1', 'canDeleteSecrets')

      expect(result).toBe(false)
    })
  })

  describe('requirePermission', () => {
    test('should not throw when user has permission', async () => {
      const mockUser = {
        id: 'user-1',
        groups: [
          {
            id: 'group-1',
            permissions: [
              {
                id: 'perm-1',
                canViewSecrets: true,
                canEditSecrets: false,
                canDeleteSecrets: false,
                canAddApps: false,
                canManageLocks: false,
                canManageAccess: false,
                canManageEnvs: false,
                environmentId: null,
              },
            ],
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      await expect(
        requirePermission('user-1', 'canViewSecrets')
      ).resolves.not.toThrow()
    })

    test('should throw when user lacks permission', async () => {
      const mockUser = {
        id: 'user-1',
        groups: [
          {
            id: 'group-1',
            permissions: [
              {
                id: 'perm-1',
                canViewSecrets: true,
                canEditSecrets: false,
                canDeleteSecrets: false,
                canAddApps: false,
                canManageLocks: false,
                canManageAccess: false,
                canManageEnvs: false,
                environmentId: null,
              },
            ],
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      await expect(
        requirePermission('user-1', 'canDeleteSecrets')
      ).rejects.toThrow('Permission denied: canDeleteSecrets')
    })
  })
})

