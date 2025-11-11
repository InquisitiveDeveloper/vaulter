import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { environmentSchema } from "@/lib/validations/environment"
import { encrypt } from "@/lib/crypto"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/environments/[id]
 * Get a specific environment
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const environment = await prisma.environment.findUnique({
      where: { id: resolvedParams.id },
      include: {
        namespaces: true,
      },
    })

    if (!environment) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      )
    }

    // Remove sensitive data from response
    const response = {
      ...environment,
      vaultPassword: undefined,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Failed to fetch environment:", error)
    return NextResponse.json(
      { error: "Failed to fetch environment" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/environments/[id]
 * Update an environment
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
    const validationResult = environmentSchema.partial().safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if environment exists
    const existing = await prisma.environment.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      )
    }

    // If name is being changed, check for conflicts
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.environment.findUnique({
        where: { name: data.name },
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: "Environment with this name already exists" },
          { status: 409 }
        )
      }
    }

    // Encrypt password if provided
    let encryptedPassword: string | undefined
    if (data.vaultPassword) {
      encryptedPassword = encrypt(data.vaultPassword)
    }

    // Update environment
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.vaultAddress) updateData.vaultAddress = data.vaultAddress
    if (data.vaultAuthType) updateData.vaultAuthType = data.vaultAuthType
    if (data.vaultUserId !== undefined) updateData.vaultUserId = data.vaultUserId
    if (encryptedPassword) updateData.vaultPassword = encryptedPassword
    if (data.vaultTokenTTL !== undefined) updateData.vaultTokenTTL = data.vaultTokenTTL

    const environment = await prisma.environment.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        namespaces: true,
      },
    })

    // Remove sensitive data from response
    const response = {
      ...environment,
      vaultPassword: undefined,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Failed to update environment:", error)
    return NextResponse.json(
      { error: "Failed to update environment" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/environments/[id]
 * Delete an environment
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params

    // Check if environment exists
    const existing = await prisma.environment.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      )
    }

    // Delete environment (namespaces will be cascade deleted)
    await prisma.environment.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete environment:", error)
    return NextResponse.json(
      { error: "Failed to delete environment" },
      { status: 500 }
    )
  }
}



