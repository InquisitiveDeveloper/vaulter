import { Inter } from 'next/font/google'
import { Providers } from "@/components/layout/Providers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import './globals.css'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Vault Secret UI",
  description: "Secure secret management interface",
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  )
}
