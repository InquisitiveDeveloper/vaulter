import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createVaultClientFromEnv } from "@/lib/vault/client"
import { decrypt } from "@/lib/crypto"

/**
 * GET /api/secrets/export
 * Export secrets in various formats (JSON, CSV, .env)
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
    const format = searchParams.get("format") || "json" // json, csv, env

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

    // Decrypt password
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

    // Format based on requested type
    let content: string
    let contentType: string
    let filename: string

    switch (format) {
      case "csv":
        // CSV format: key,field,value
        const csvLines = ["key,field,value"]
        Object.entries(secrets).forEach(([secretKey, secretData]) => {
          Object.entries(secretData).forEach(([field, value]) => {
            csvLines.push(`"${secretKey}","${field}","${value}"`)
          })
        })
        content = csvLines.join("\n")
        contentType = "text/csv"
        filename = `${application.name}-secrets.csv`
        break

      case "env":
        // .env format: KEY=value (flattened)
        const envLines: string[] = []
        Object.entries(secrets).forEach(([secretKey, secretData]) => {
          Object.entries(secretData).forEach(([field, value]) => {
            const envKey = `${secretKey.toUpperCase()}_${field.toUpperCase()}`
              .replace(/[^A-Z0-9_]/g, "_")
            envLines.push(`${envKey}=${value}`)
          })
        })
        content = envLines.join("\n")
        contentType = "text/plain"
        filename = `${application.name}.env`
        break

      case "json":
      default:
        content = JSON.stringify(secrets, null, 2)
        contentType = "application/json"
        filename = `${application.name}-secrets.json`
        break
    }

    // Return file
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error("Failed to export secrets:", error)
    return NextResponse.json(
      { error: error.message || "Failed to export secrets" },
      { status: 500 }
    )
  }
}



