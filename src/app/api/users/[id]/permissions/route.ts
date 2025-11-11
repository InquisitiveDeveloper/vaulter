import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserPermissions } from "@/lib/permissions/check"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/users/[id]/permissions
 * Get user's permissions
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params

    // Users can only check their own permissions unless they have admin access
    if (session.user.id !== resolvedParams.id) {
      return NextResponse.json(
        { error: "You can only check your own permissions" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const environmentId = searchParams.get("environmentId") || undefined

    const permissions = await getUserPermissions(resolvedParams.id, environmentId)

    return NextResponse.json(permissions)
  } catch (error) {
    console.error("Failed to get permissions:", error)
    return NextResponse.json(
      { error: "Failed to get permissions" },
      { status: 500 }
    )
  }
}



