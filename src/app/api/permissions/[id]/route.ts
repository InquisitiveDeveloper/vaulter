import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * DELETE /api/permissions/[id]
 * Delete a permission
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params

    // Check if permission exists
    const existing = await prisma.permission.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      )
    }

    // Delete permission
    await prisma.permission.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete permission:", error)
    return NextResponse.json(
      { error: "Failed to delete permission" },
      { status: 500 }
    )
  }
}



