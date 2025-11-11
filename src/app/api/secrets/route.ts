import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createVaultClientFromEnv } from "@/lib/vault/client"
import { decrypt } from "@/lib/crypto"
import { secretSchema } from "@/lib/validations/secret"
import { z } from "zod"

/**
 * GET /api/secrets
 * List secrets for an application in a specific environment/namespace
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Parse vault path (e.g., "secret/my-app" -> mountPoint: "secret", path: "my-app")
    const pathParts = application.vaultBasePath.split("/")
    const mountPoint = pathParts[0]
    const secretPath = pathParts.slice(1).join("/")

    // List secrets
    const keys = await client.listSecrets(mountPoint, secretPath)

    // Get locked keys for this application/environment/namespace
    const lockedKeys = await prisma.lockedSecretKey.findMany({
      where: {
        applicationId,
        environmentId,
        namespaceName,
      },
    })

    const lockedKeySet = new Set(lockedKeys.map((lk) => lk.secretKey))

    return NextResponse.json({
      keys,
      lockedKeys: Array.from(lockedKeySet),
    })
  } catch (error: any) {
    console.error("Failed to list secrets:", error)
    return NextResponse.json(
      { error: error.message || "Failed to list secrets" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/secrets
 * Create or update a secret
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = secretSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Get environment
    const environment = await prisma.environment.findUnique({
      where: { id: data.environmentId },
    })

    if (!environment) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      )
    }

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
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
      namespace: data.namespaceName,
    })

    // Parse vault path
    const pathParts = application.vaultBasePath.split("/")
    const mountPoint = pathParts[0]
    const basePath = pathParts.slice(1).join("/")
    const fullPath = basePath ? `${basePath}/${data.secretKey}` : data.secretKey

    // Write secret
    const result = await client.writeSecret(mountPoint, fullPath, data.data)

    return NextResponse.json({
      success: true,
      version: result.version,
    })
  } catch (error: any) {
    console.error("Failed to create/update secret:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to create/update secret" },
      { status: 500 }
    )
  }
}



