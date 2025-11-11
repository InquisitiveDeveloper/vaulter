import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, name } = body

    // Validate required fields
    if (!id || !email) {
      console.error('Missing required fields in sync-user request:', { id, email, name })
      return NextResponse.json(
        { error: 'Missing required fields: id and email are required' },
        { status: 400 }
      )
    }

    console.log('Syncing user:', { id, email, name })

    // Check if user already exists by email (email should be unique)
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
      console.log('Updated existing user:', email)
    } else {
      // Create new user with Supabase UUID as ID
      await prisma.user.create({
        data: {
          id,
          email,
          name: name || email.split('@')[0],
        },
      })
      console.log('Created new user:', email)
    }

    return NextResponse.json({
      success: true,
      message: 'User synced successfully'
    })
  } catch (error: any) {
    console.error('Error syncing user:', error)

    // Return more detailed error info in development
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Failed to sync user: ${error.message}`
      : 'Failed to sync user'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
