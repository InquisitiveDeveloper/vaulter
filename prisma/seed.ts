import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create admin group
  const adminGroup = await prisma.group.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'System administrators with full access',
    },
  })

  console.log('Created admin group:', adminGroup)

  // Create developers group
  const devGroup = await prisma.group.upsert({
    where: { name: 'developers' },
    update: {},
    create: {
      name: 'developers',
      description: 'Developers with secret read/write access',
    },
  })

  console.log('Created developers group:', devGroup)

  // Create viewers group
  const viewersGroup = await prisma.group.upsert({
    where: { name: 'viewers' },
    update: {},
    create: {
      name: 'viewers',
      description: 'Users with read-only access',
    },
  })

  console.log('Created viewers group:', viewersGroup)

  // Create global admin permissions
  const existingAdminPerm = await prisma.permission.findFirst({
    where: {
      groupId: adminGroup.id,
      environmentId: null,
    },
  })

  if (!existingAdminPerm) {
    await prisma.permission.create({
      data: {
        groupId: adminGroup.id,
        environmentId: null,
        canViewSecrets: true,
        canEditSecrets: true,
        canDeleteSecrets: true,
        canAddApps: true,
        canManageLocks: true,
        canManageAccess: true,
        canManageEnvs: true,
      },
    })
  }

  console.log('Created admin permissions')

  // Create global developer permissions
  const existingDevPerm = await prisma.permission.findFirst({
    where: {
      groupId: devGroup.id,
      environmentId: null,
    },
  })

  if (!existingDevPerm) {
    await prisma.permission.create({
      data: {
        groupId: devGroup.id,
        environmentId: null,
        canViewSecrets: true,
        canEditSecrets: true,
        canDeleteSecrets: false,
        canAddApps: true,
        canManageLocks: false,
        canManageAccess: false,
        canManageEnvs: false,
      },
    })
  }

  console.log('Created developer permissions')

  // Create global viewer permissions
  const existingViewerPerm = await prisma.permission.findFirst({
    where: {
      groupId: viewersGroup.id,
      environmentId: null,
    },
  })

  if (!existingViewerPerm) {
    await prisma.permission.create({
      data: {
        groupId: viewersGroup.id,
        environmentId: null,
        canViewSecrets: true,
        canEditSecrets: false,
        canDeleteSecrets: false,
        canAddApps: false,
        canManageLocks: false,
        canManageAccess: false,
        canManageEnvs: false,
      },
    })
  }

  console.log('Created viewer permissions')

  console.log('Database seed completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

