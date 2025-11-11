import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { applicationSchema } from "@/lib/validations/application"
import { z } from "zod"

/**
 * GET /api/applications
 * List all applications
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const applications = await prisma.application.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Failed to fetch applications:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications
 * Create a new application
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = applicationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if application with same name already exists
    const existingName = await prisma.application.findUnique({
      where: { name: data.name },
    })

    if (existingName) {
      return NextResponse.json(
        { error: "Application with this name already exists" },
        { status: 409 }
      )
    }

    // Check if application with same vault path already exists
    const existingPath = await prisma.application.findFirst({
      where: { vaultBasePath: data.vaultBasePath },
    })

    if (existingPath) {
      return NextResponse.json(
        { error: "Application with this Vault path already exists" },
        { status: 409 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        name: data.name,
        vaultBasePath: data.vaultBasePath,
        description: data.description,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Failed to create application:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    )
  }
}



