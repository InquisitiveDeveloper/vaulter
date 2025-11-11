import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createVaultClientFromEnv } from "@/lib/vault/client"
import { decrypt } from "@/lib/crypto"
import { z } from "zod"

const compareSchema = z.object({
  applicationId: z.string().cuid(),
  contexts: z.array(
    z.object({
      environmentId: z.string().cuid(),
      namespaceName: z.string(),
    })
  ).min(2, "At least 2 contexts are required for comparison"),
})

/**
 * POST /api/secrets/compare
 * Compare secrets across multiple environment/namespace contexts
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const validationResult = compareSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { applicationId, contexts } = validationResult.data

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

    // Fetch secrets from each context
    const results = await Promise.all(
      contexts.map(async (context) => {
        try {
          // Get environment
          const environment = await prisma.environment.findUnique({
            where: { id: context.environmentId },
          })

          if (!environment) {
            return { context, error: "Environment not found", secrets: {} }
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
            namespace: context.namespaceName,
          })

          // Parse vault path
          const pathParts = application.vaultBasePath.split("/")
          const mountPoint = pathParts[0]
          const basePath = pathParts.slice(1).join("/")

          // List and fetch all secrets
          const keys = await client.listSecrets(mountPoint, basePath)
          const secrets: Record<string, any> = {}

          for (const key of keys) {
            const fullPath = basePath ? `${basePath}/${key}` : key
            const data = await client.readSecret(mountPoint, fullPath)
            if (data) {
              secrets[key] = data
            }
          }

          return {
            context,
            environmentName: environment.name,
            secrets,
            error: null,
          }
        } catch (error: any) {
          return {
            context,
            secrets: {} as Record<string, any>,
            error: error.message || "Failed to fetch secrets",
          }
        }
      })
    )

    // Build comparison data
    const allKeys = new Set<string>()
    results.forEach((result) => {
      Object.keys(result.secrets).forEach((key) => allKeys.add(key))
    })

    const comparison = Array.from(allKeys).map((key) => {
      const values = results.map((result) => ({
        environmentId: result.context.environmentId,
        environmentName: result.environmentName,
        namespaceName: result.context.namespaceName,
        value: result.secrets[key] || null,
        exists: !!result.secrets[key],
      }))

      // Check if values differ
      const existingValues = values.filter((v) => v.exists)
      const hasDifferences =
        existingValues.length > 1 &&
        !existingValues.every((v) =>
          JSON.stringify(v.value) === JSON.stringify(existingValues[0].value)
        )

      return {
        key,
        values,
        hasDifferences,
      }
    })

    return NextResponse.json({
      application: {
        id: application.id,
        name: application.name,
      },
      contexts: results.map((r) => ({
        environmentId: r.context.environmentId,
        environmentName: r.environmentName,
        namespaceName: r.context.namespaceName,
        error: r.error,
      })),
      comparison,
    })
  } catch (error: any) {
    console.error("Failed to compare secrets:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to compare secrets" },
      { status: 500 }
    )
  }
}



