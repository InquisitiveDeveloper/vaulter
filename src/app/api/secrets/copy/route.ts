import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createVaultClientFromEnv } from "@/lib/vault/client"
import { decrypt } from "@/lib/crypto"
import { z } from "zod"

const copySchema = z.object({
  applicationId: z.string().cuid(),
  sourceEnvironmentId: z.string().cuid(),
  sourceNamespaceName: z.string(),
  targetEnvironmentId: z.string().cuid(),
  targetNamespaceName: z.string(),
  secretKeys: z.array(z.string()).optional(), // If not provided, copy all
  overwrite: z.boolean().default(false),
})

/**
 * POST /api/secrets/copy
 * Copy secrets from one context to another
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const validationResult = copySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const data = validationResult.data

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

    // Get source environment
    const sourceEnv = await prisma.environment.findUnique({
      where: { id: data.sourceEnvironmentId },
    })

    if (!sourceEnv) {
      return NextResponse.json(
        { error: "Source environment not found" },
        { status: 404 }
      )
    }

    // Get target environment
    const targetEnv = await prisma.environment.findUnique({
      where: { id: data.targetEnvironmentId },
    })

    if (!targetEnv) {
      return NextResponse.json(
        { error: "Target environment not found" },
        { status: 404 }
      )
    }

    // Create source client
    let sourcePassword: string | undefined
    if (sourceEnv.vaultPassword) {
      sourcePassword = decrypt(sourceEnv.vaultPassword)
    }

    const sourceClient = await createVaultClientFromEnv({
      ...sourceEnv,
      vaultPassword: sourcePassword,
      namespace: data.sourceNamespaceName,
    })

    // Create target client
    let targetPassword: string | undefined
    if (targetEnv.vaultPassword) {
      targetPassword = decrypt(targetEnv.vaultPassword)
    }

    const targetClient = await createVaultClientFromEnv({
      ...targetEnv,
      vaultPassword: targetPassword,
      namespace: data.targetNamespaceName,
    })

    // Parse vault path
    const pathParts = application.vaultBasePath.split("/")
    const mountPoint = pathParts[0]
    const basePath = pathParts.slice(1).join("/")

    // Determine which keys to copy
    let keysToCopy: string[]
    if (data.secretKeys && data.secretKeys.length > 0) {
      keysToCopy = data.secretKeys
    } else {
      // Copy all secrets
      keysToCopy = await sourceClient.listSecrets(mountPoint, basePath)
    }

    // Copy each secret
    const results = await Promise.all(
      keysToCopy.map(async (key) => {
        try {
          const fullPath = basePath ? `${basePath}/${key}` : key

          // Read from source
          const secretData = await sourceClient.readSecret(mountPoint, fullPath)
          if (!secretData) {
            return { key, success: false, error: "Secret not found in source" }
          }

          // Check if exists in target (if overwrite is false)
          if (!data.overwrite) {
            const existing = await targetClient.readSecret(mountPoint, fullPath)
            if (existing) {
              return { key, success: false, error: "Secret already exists in target", skipped: true }
            }
          }

          // Write to target
          await targetClient.writeSecret(mountPoint, fullPath, secretData)

          return { key, success: true }
        } catch (error: any) {
          return {
            key,
            success: false,
            error: error.message || "Failed to copy secret",
          }
        }
      })
    )

    const successCount = results.filter((r) => r.success).length
    const failedCount = results.filter((r) => !r.success && !r.skipped).length
    const skippedCount = results.filter((r) => r.skipped).length

    return NextResponse.json({
      success: true,
      total: keysToCopy.length,
      copied: successCount,
      failed: failedCount,
      skipped: skippedCount,
      results,
    })
  } catch (error: any) {
    console.error("Failed to copy secrets:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to copy secrets" },
      { status: 500 }
    )
  }
}



