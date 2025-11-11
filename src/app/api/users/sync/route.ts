import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, name } = body

    if (!id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists by email (email is unique in schema)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Update existing user - keep their original ID but update info
      await prisma.user.update({
        where: { email },
        data: {
          email,
          name: name || existingUser.name,
        },
      })
    } else {
      // Create new user with Supabase UUID as ID
      await prisma.user.create({
        data: {
          id,
          email,
          name: name || email.split('@')[0],
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error syncing user:', error)
    // Return more detailed error info in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Failed to sync user'
      : 'Failed to sync user'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

