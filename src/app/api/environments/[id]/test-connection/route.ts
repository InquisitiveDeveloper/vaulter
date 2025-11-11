import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { VaultClient } from "@/lib/vault/client"
import { VaultConfig } from "@/lib/vault/types"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/environments/[id]/test-connection
 * Test connection to a Vault instance
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params

    // Get environment
    const environment = await prisma.environment.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!environment) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      )
    }

    // Decrypt password if exists
    let password: string | undefined
    if (environment.vaultPassword) {
      try {
        password = decrypt(environment.vaultPassword)
      } catch (error) {
        console.error("Failed to decrypt password:", error)
        return NextResponse.json(
          { error: "Failed to decrypt stored credentials" },
          { status: 500 }
        )
      }
    }

    // Create Vault config
    const config: VaultConfig = {
      address: environment.vaultAddress,
      authType: environment.vaultAuthType as "userpass" | "approle" | "token",
      userId: environment.vaultUserId || undefined,
      password,
      tokenTTL: environment.vaultTokenTTL || undefined,
    }

    // Test connection
    const client = new VaultClient(config)
    const isConnected = await client.testConnection()

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: "Successfully connected to Vault",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to Vault. Please check your credentials.",
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to test connection",
      },
      { status: 500 }
    )
  }
}



