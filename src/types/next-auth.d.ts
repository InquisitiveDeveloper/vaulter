import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      groups: string[]
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    groups?: string[]
  }

  interface Profile {
    sub: string
    name?: string
    email: string
    groups?: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    groups?: string[]
  }
}



