import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addUserSchema = z.object({
  userId: z.string().cuid(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/groups/[id]/users
 * Add a user to a group
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()

    // Validate input
    const validationResult = addUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { userId } = validationResult.data

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: resolvedParams.id },
      include: { users: true },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is already in group
    if (group.users.some((u) => u.id === userId)) {
      return NextResponse.json(
        { error: "User is already in this group" },
        { status: 409 }
      )
    }

    // Add user to group
    await prisma.group.update({
      where: { id: resolvedParams.id },
      data: {
        users: {
          connect: { id: userId },
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to add user to group:", error)
    return NextResponse.json(
      { error: "Failed to add user to group" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/groups/[id]/users/[userId]
 * Remove a user from a group
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Remove user from group
    await prisma.group.update({
      where: { id: resolvedParams.id },
      data: {
        users: {
          disconnect: { id: userId },
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove user from group:", error)
    return NextResponse.json(
      { error: "Failed to remove user from group" },
      { status: 500 }
    )
  }
}



