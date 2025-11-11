import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { applicationSchema } from "@/lib/validations/application"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/applications/[id]
 * Get a specific application
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const application = await prisma.application.findUnique({
      where: { id: resolvedParams.id },
      include: {
        lockedKeys: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Failed to fetch application:", error)
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/applications/[id]
 * Update an application
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()

    // Validate input
    const validationResult = applicationSchema.partial().safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if application exists
    const existing = await prisma.application.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // If name is being changed, check for conflicts
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.application.findUnique({
        where: { name: data.name },
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: "Application with this name already exists" },
          { status: 409 }
        )
      }
    }

    // If path is being changed, check for conflicts
    if (data.vaultBasePath && data.vaultBasePath !== existing.vaultBasePath) {
      const pathConflict = await prisma.application.findFirst({
        where: { vaultBasePath: data.vaultBasePath },
      })

      if (pathConflict) {
        return NextResponse.json(
          { error: "Application with this Vault path already exists" },
          { status: 409 }
        )
      }
    }

    // Update application
    const application = await prisma.application.update({
      where: { id: resolvedParams.id },
      data: {
        name: data.name,
        vaultBasePath: data.vaultBasePath,
        description: data.description,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error("Failed to update application:", error)
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete an application
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params

    // Check if application exists
    const existing = await prisma.application.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Delete application (locked keys will be cascade deleted)
    await prisma.application.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete application:", error)
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    )
  }
}



