import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { lockSecretSchema } from "@/lib/validations/secret"

interface RouteParams {
  params: Promise<{
    key: string
  }>
}

/**
 * POST /api/secrets/[key]/lock
 * Lock a secret (redact its value in UI)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const secretKey = decodeURIComponent(resolvedParams.key)

    const validationResult = lockSecretSchema.safeParse({
      ...body,
      secretKey,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if already locked
    const existing = await prisma.lockedSecretKey.findUnique({
      where: {
        applicationId_environmentId_namespaceName_secretKey: {
          applicationId: data.applicationId,
          environmentId: data.environmentId,
          namespaceName: data.namespaceName,
          secretKey: data.secretKey,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Secret is already locked" },
        { status: 409 }
      )
    }

    // Create lock entry
    const lockedKey = await prisma.lockedSecretKey.create({
      data: {
        applicationId: data.applicationId,
        environmentId: data.environmentId,
        namespaceName: data.namespaceName,
        secretKey: data.secretKey,
      },
    })

    return NextResponse.json(lockedKey, { status: 201 })
  } catch (error: any) {
    console.error("Failed to lock secret:", error)
    return NextResponse.json(
      { error: error.message || "Failed to lock secret" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/secrets/[key]/lock
 * Unlock a secret (show its value in UI)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get("applicationId")
    const environmentId = searchParams.get("environmentId")
    const namespaceName = searchParams.get("namespaceName") || ""

    if (!applicationId || !environmentId) {
      return NextResponse.json(
        { error: "applicationId and environmentId are required" },
        { status: 400 }
      )
    }

    const secretKey = decodeURIComponent(resolvedParams.key)

    // Find and delete lock entry
    const deleted = await prisma.lockedSecretKey.deleteMany({
      where: {
        applicationId,
        environmentId,
        namespaceName,
        secretKey,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Secret lock not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Failed to unlock secret:", error)
    return NextResponse.json(
      { error: error.message || "Failed to unlock secret" },
      { status: 500 }
    )
  }
}



