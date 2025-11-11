import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { namespaceSchema } from "@/lib/validations/environment"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/namespaces/[id]
 * Get a specific namespace
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const namespace = await prisma.namespace.findUnique({
      where: { id: resolvedParams.id },
      include: {
        environment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!namespace) {
      return NextResponse.json(
        { error: "Namespace not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(namespace)
  } catch (error) {
    console.error("Failed to fetch namespace:", error)
    return NextResponse.json(
      { error: "Failed to fetch namespace" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/namespaces/[id]
 * Update a namespace
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
    const validationResult = namespaceSchema.partial().safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if namespace exists
    const existing = await prisma.namespace.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Namespace not found" },
        { status: 404 }
      )
    }

    // If name is being changed, check for conflicts
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.namespace.findUnique({
        where: {
          name_environmentId: {
            name: data.name,
            environmentId: existing.environmentId,
          },
        },
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: "Namespace with this name already exists in this environment" },
          { status: 409 }
        )
      }
    }

    // Update namespace
    const namespace = await prisma.namespace.update({
      where: { id: resolvedParams.id },
      data: {
        name: data.name,
      },
      include: {
        environment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(namespace)
  } catch (error) {
    console.error("Failed to update namespace:", error)
    return NextResponse.json(
      { error: "Failed to update namespace" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/namespaces/[id]
 * Delete a namespace
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params

    // Check if namespace exists
    const existing = await prisma.namespace.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Namespace not found" },
        { status: 404 }
      )
    }

    // Delete namespace
    await prisma.namespace.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete namespace:", error)
    return NextResponse.json(
      { error: "Failed to delete namespace" },
      { status: 500 }
    )
  }
}



