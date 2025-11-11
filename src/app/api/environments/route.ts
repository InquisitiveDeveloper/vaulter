import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { environmentSchema } from "@/lib/validations/environment"
import { encrypt } from "@/lib/crypto"
import { z } from "zod"

/**
 * GET /api/environments
 * List all environments
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const environments = await prisma.environment.findMany({
      include: {
        namespaces: true,
        _count: {
          select: {
            namespaces: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    // Remove sensitive data from response
    const sanitized = environments.map((env) => ({
      ...env,
      vaultPassword: undefined,
    }))

    return NextResponse.json(sanitized)
  } catch (error) {
    console.error("Failed to fetch environments:", error)
    return NextResponse.json(
      { error: "Failed to fetch environments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/environments
 * Create a new environment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = environmentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if environment with same name already exists
    const existing = await prisma.environment.findUnique({
      where: { name: data.name },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Environment with this name already exists" },
        { status: 409 }
      )
    }

    // Encrypt password if provided
    let encryptedPassword: string | undefined
    if (data.vaultPassword) {
      encryptedPassword = encrypt(data.vaultPassword)
    }

    // Create environment
    const environment = await prisma.environment.create({
      data: {
        name: data.name,
        description: data.description,
        vaultAddress: data.vaultAddress,
        vaultAuthType: data.vaultAuthType,
        vaultUserId: data.vaultUserId,
        vaultPassword: encryptedPassword,
        vaultTokenTTL: data.vaultTokenTTL,
      },
      include: {
        namespaces: true,
      },
    })

    // Remove sensitive data from response
    const response = {
      ...environment,
      vaultPassword: undefined,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Failed to create environment:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create environment" },
      { status: 500 }
    )
  }
}



