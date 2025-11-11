import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { namespaceSchema } from "@/lib/validations/environment"
import { z } from "zod"

/**
 * GET /api/namespaces
 * List namespaces (optionally filtered by environment)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const environmentId = searchParams.get("environmentId")

    const where = environmentId ? { environmentId } : {}

    const namespaces = await prisma.namespace.findMany({
      where,
      include: {
        environment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(namespaces)
  } catch (error) {
    console.error("Failed to fetch namespaces:", error)
    return NextResponse.json(
      { error: "Failed to fetch namespaces" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/namespaces
 * Create a new namespace
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = namespaceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if environment exists
    const environment = await prisma.environment.findUnique({
      where: { id: data.environmentId },
    })

    if (!environment) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      )
    }

    // Check if namespace with same name already exists in this environment
    const existing = await prisma.namespace.findUnique({
      where: {
        name_environmentId: {
          name: data.name,
          environmentId: data.environmentId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Namespace with this name already exists in this environment" },
        { status: 409 }
      )
    }

    // Create namespace
    const namespace = await prisma.namespace.create({
      data: {
        name: data.name,
        environmentId: data.environmentId,
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

    return NextResponse.json(namespace, { status: 201 })
  } catch (error) {
    console.error("Failed to create namespace:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create namespace" },
      { status: 500 }
    )
  }
}



