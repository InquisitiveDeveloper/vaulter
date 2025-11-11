import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to auth pages
        if (pathname.startsWith('/auth/')) {
          return true
        }

        // Protect dashboard routes
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }

        // Allow access to public routes
        return true
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|api/auth/).*)',
  ],
}



