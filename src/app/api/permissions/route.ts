import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const permissionSchema = z.object({
  groupId: z.string().cuid(),
  environmentId: z.string().cuid().nullable().optional(),
  canViewSecrets: z.boolean().default(false),
  canEditSecrets: z.boolean().default(false),
  canDeleteSecrets: z.boolean().default(false),
  canAddApps: z.boolean().default(false),
  canManageLocks: z.boolean().default(false),
  canManageAccess: z.boolean().default(false),
  canManageEnvs: z.boolean().default(false),
})

/**
 * GET /api/permissions
 * List all permissions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get("groupId")
    const environmentId = searchParams.get("environmentId")

    const where: any = {}
    if (groupId) where.groupId = groupId
    if (environmentId) where.environmentId = environmentId

    const permissions = await prisma.permission.findMany({
      where,
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        environment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { environmentId: "asc" },
        { groupId: "asc" },
      ],
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error("Failed to fetch permissions:", error)
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/permissions
 * Create or update a permission
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = permissionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: data.groupId },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // If environment is specified, check if it exists
    if (data.environmentId) {
      const environment = await prisma.environment.findUnique({
        where: { id: data.environmentId },
      })

      if (!environment) {
        return NextResponse.json(
          { error: "Environment not found" },
          { status: 404 }
        )
      }
    }

    // Upsert permission
    const permission = await prisma.permission.upsert({
      where: {
        groupId_environmentId_unique: {
          groupId: data.groupId,
          environmentId: data.environmentId || (null as any),
        },
      },
      create: {
        groupId: data.groupId,
        environmentId: data.environmentId || null,
        canViewSecrets: data.canViewSecrets,
        canEditSecrets: data.canEditSecrets,
        canDeleteSecrets: data.canDeleteSecrets,
        canAddApps: data.canAddApps,
        canManageLocks: data.canManageLocks,
        canManageAccess: data.canManageAccess,
        canManageEnvs: data.canManageEnvs,
      },
      update: {
        canViewSecrets: data.canViewSecrets,
        canEditSecrets: data.canEditSecrets,
        canDeleteSecrets: data.canDeleteSecrets,
        canAddApps: data.canAddApps,
        canManageLocks: data.canManageLocks,
        canManageAccess: data.canManageAccess,
        canManageEnvs: data.canManageEnvs,
      },
      include: {
        group: true,
        environment: true,
      },
    })

    return NextResponse.json(permission, { status: 201 })
  } catch (error) {
    console.error("Failed to create/update permission:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create/update permission" },
      { status: 500 }
    )
  }
}



