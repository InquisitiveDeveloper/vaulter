import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const groupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/groups/[id]
 * Get a specific group
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const group = await prisma.group.findUnique({
      where: { id: resolvedParams.id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        permissions: {
          include: {
            environment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error("Failed to fetch group:", error)
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/groups/[id]
 * Update a group
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
    const validationResult = groupSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if group exists
    const existing = await prisma.group.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // If name is being changed, check for conflicts
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.group.findUnique({
        where: { name: data.name },
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: "Group with this name already exists" },
          { status: 409 }
        )
      }
    }

    // Update group
    const group = await prisma.group.update({
      where: { id: resolvedParams.id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        users: true,
        permissions: true,
      },
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error("Failed to update group:", error)
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/groups/[id]
 * Delete a group
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params

    // Check if group exists
    const existing = await prisma.group.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Delete group (users will be unlinked, permissions cascade deleted)
    await prisma.group.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete group:", error)
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    )
  }
}



