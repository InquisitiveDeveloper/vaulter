import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAuditLogs } from "@/lib/db-helpers"

/**
 * GET /api/audit-logs
 * List audit logs with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "50")
    const userId = searchParams.get("userId") || undefined
    const action = searchParams.get("action") || undefined
    const resourceType = searchParams.get("resourceType") || undefined
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined

    const skip = (page - 1) * pageSize

    const { logs, total } = await getAuditLogs({
      skip,
      take: pageSize,
      userId,
      action,
      resourceType,
      startDate,
      endDate,
    })

    return NextResponse.json({
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error("Failed to fetch audit logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}



