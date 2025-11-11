import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createVaultClientFromEnv } from "@/lib/vault/client"
import { decrypt } from "@/lib/crypto"

interface RouteParams {
  params: Promise<{
    key: string
  }>
}

/**
 * GET /api/secrets/[key]
 * Get a specific secret
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const environmentId = searchParams.get("environmentId")
    const namespaceName = searchParams.get("namespaceName") || ""
    const applicationId = searchParams.get("applicationId")
    const version = searchParams.get("version")

    if (!environmentId || !applicationId) {
      return NextResponse.json(
        { error: "environmentId and applicationId are required" },
        { status: 400 }
      )
    }

    // Get environment
    const environment = await prisma.environment.findUnique({
      where: { id: environmentId },
    })

    if (!environment) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      )
    }

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Decrypt password if exists
    let password: string | undefined
    if (environment.vaultPassword) {
      password = decrypt(environment.vaultPassword)
    }

    // Create Vault client
    const client = await createVaultClientFromEnv({
      ...environment,
      vaultPassword: password,
      namespace: namespaceName,
    })

    // Parse vault path
    const pathParts = application.vaultBasePath.split("/")
    const mountPoint = pathParts[0]
    const basePath = pathParts.slice(1).join("/")
    const secretKey = decodeURIComponent(resolvedParams.key)
    const fullPath = basePath ? `${basePath}/${secretKey}` : secretKey

    // Read secret
    const data = await client.readSecret(
      mountPoint,
      fullPath,
      version ? parseInt(version) : undefined
    )

    if (!data) {
      return NextResponse.json({ error: "Secret not found" }, { status: 404 })
    }

    // Check if any keys are locked
    const lockedKeys = await prisma.lockedSecretKey.findMany({
      where: {
        applicationId,
        environmentId,
        namespaceName,
        secretKey,
      },
    })

    const lockedKeySet = new Set(lockedKeys.map((lk) => lk.secretKey))

    return NextResponse.json({
      data,
      isLocked: lockedKeySet.has(secretKey),
    })
  } catch (error: any) {
    console.error("Failed to get secret:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get secret" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/secrets/[key]
 * Delete a secret
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const environmentId = searchParams.get("environmentId")
    const namespaceName = searchParams.get("namespaceName") || ""
    const applicationId = searchParams.get("applicationId")

    if (!environmentId || !applicationId) {
      return NextResponse.json(
        { error: "environmentId and applicationId are required" },
        { status: 400 }
      )
    }

    // Get environment
    const environment = await prisma.environment.findUnique({
      where: { id: environmentId },
    })

    if (!environment) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      )
    }

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Decrypt password if exists
    let password: string | undefined
    if (environment.vaultPassword) {
      password = decrypt(environment.vaultPassword)
    }

    // Create Vault client
    const client = await createVaultClientFromEnv({
      ...environment,
      vaultPassword: password,
      namespace: namespaceName,
    })

    // Parse vault path
    const pathParts = application.vaultBasePath.split("/")
    const mountPoint = pathParts[0]
    const basePath = pathParts.slice(1).join("/")
    const secretKey = decodeURIComponent(resolvedParams.key)
    const fullPath = basePath ? `${basePath}/${secretKey}` : secretKey

    // Delete secret
    await client.deleteSecret(mountPoint, fullPath)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Failed to delete secret:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete secret" },
      { status: 500 }
    )
  }
}



