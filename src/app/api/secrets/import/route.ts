import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createVaultClientFromEnv } from "@/lib/vault/client"
import { decrypt } from "@/lib/crypto"
import { z } from "zod"

const importSchema = z.object({
  environmentId: z.string().cuid(),
  namespaceName: z.string(),
  applicationId: z.string().cuid(),
  secrets: z.record(z.string(), z.record(z.string(), z.any())),
  overwrite: z.boolean().default(false),
})

/**
 * POST /api/secrets/import
 * Import secrets from JSON/CSV data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const validationResult = importSchema.safeParse(body)
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

    // Decrypt password
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

    // Import each secret
    const results = await Promise.all(
      Object.entries(data.secrets).map(async ([key, secretData]) => {
        try {
          const fullPath = basePath ? `${basePath}/${key}` : key

          // Check if exists (if overwrite is false)
          if (!data.overwrite) {
            const existing = await client.readSecret(mountPoint, fullPath)
            if (existing) {
              return {
                key,
                success: false,
                error: "Secret already exists",
                skipped: true,
              }
            }
          }

          // Write secret
          await client.writeSecret(mountPoint, fullPath, secretData)

          return { key, success: true }
        } catch (error: any) {
          return {
            key,
            success: false,
            error: error.message || "Failed to import secret",
          }
        }
      })
    )

    const successCount = results.filter((r) => r.success).length
    const failedCount = results.filter((r) => !r.success && !r.skipped).length
    const skippedCount = results.filter((r) => r.skipped).length

    return NextResponse.json({
      success: true,
      total: Object.keys(data.secrets).length,
      imported: successCount,
      failed: failedCount,
      skipped: skippedCount,
      results,
    })
  } catch (error: any) {
    console.error("Failed to import secrets:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to import secrets" },
      { status: 500 }
    )
  }
}



