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
 * GET /api/secrets/[key]/versions
 * Get version history for a secret
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

    // Get metadata (includes version info)
    const metadata = await client.getMetadata(mountPoint, fullPath)

    if (!metadata) {
      return NextResponse.json(
        { error: "Secret metadata not found" },
        { status: 404 }
      )
    }

    // Transform versions object to array
    const versions = Object.entries(metadata.versions).map(([version, info]) => ({
      version: parseInt(version),
      created_time: info.created_time,
      deletion_time: info.deletion_time,
      destroyed: info.destroyed,
    })).sort((a, b) => b.version - a.version) // Sort by version descending

    return NextResponse.json({
      current_version: metadata.current_version,
      oldest_version: metadata.oldest_version,
      versions,
    })
  } catch (error: any) {
    console.error("Failed to get secret versions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get secret versions" },
      { status: 500 }
    )
  }
}



