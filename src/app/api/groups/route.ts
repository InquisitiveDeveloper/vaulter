import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const groupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "Name can only contain letters, numbers, hyphens, and underscores"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
})

/**
 * GET /api/groups
 * List all groups
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const groups = await prisma.group.findMany({
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
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error("Failed to fetch groups:", error)
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/groups
 * Create a new group
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Check if group with same name already exists
    const existing = await prisma.group.findUnique({
      where: { name: data.name },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Group with this name already exists" },
        { status: 409 }
      )
    }

    // Create group
    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        users: true,
        permissions: true,
      },
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error("Failed to create group:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    )
  }
}



