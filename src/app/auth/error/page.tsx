"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle, Shield, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { HyperText } from "@/components/ui/hyper-text"
import { Particles } from "@/components/ui/particles"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { TextAnimate } from "@/components/ui/text-animate"
import { AuroraText } from "@/components/ui/aurora-text"
import { ShimmerButton } from "@/components/ui/shimmer-button"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Server configuration error detected. Security protocols may be misconfigured."
      case "AccessDenied":
        return "Access denied. Your account may not have the required security clearance."
      case "Verification":
        return "Security token expired or invalid. Please request a new authentication."
      case "OAuthSignin":
        return "OAuth authorization URL construction failed. Check provider configuration."
      case "OAuthCallback":
        return "OAuth provider response could not be processed. Authentication failed."
      case "OAuthCreateAccount":
        return "Could not create user account in the secure database."
      case "EmailCreateAccount":
        return "Email provider account creation failed in the database."
      case "Callback":
        return "OAuth callback handler encountered an error during authentication."
      case "OAuthAccountNotLinked":
        return "Email already linked to different OAuth account. Contact security team."
      case "EmailSignin":
        return "Security verification email could not be sent. Check email configuration."
      case "CredentialsSignin":
        return "Credential authorization callback failed. Invalid authentication attempt."
      case "SessionRequired":
        return "Active security session required. Please authenticate to continue."
      default:
        return "Critical authentication error occurred. System security may be compromised."
    }
  }

  const getErrorSeverity = (error: string | null) => {
    switch (error) {
      case "AccessDenied":
      case "SessionRequired":
        return "warning"
      case "Configuration":
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
      case "OAuthAccountNotLinked":
      case "EmailSignin":
      case "CredentialsSignin":
        return "error"
      case "Verification":
        return "info"
      default:
        return "critical"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "warning":
        return { bg: "from-yellow-500 to-orange-500", text: "text-yellow-400", icon: AlertTriangle }
      case "error":
        return { bg: "from-red-500 to-red-600", text: "text-red-400", icon: AlertCircle }
      case "critical":
        return { bg: "from-red-600 to-red-800", text: "text-red-300", icon: AlertTriangle }
      default:
        return { bg: "from-blue-500 to-cyan-500", text: "text-blue-400", icon: AlertCircle }
    }
  }

  const severity = getErrorSeverity(error)
  const colors = getSeverityColor(severity)
  const ErrorIcon = colors.icon

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <Particles
        className="absolute inset-0"
        quantity={60}
        ease={80}
        color="#ffffff"
        size={0.4}
        staticity={25}
        vx={0}
        vy={0}
      />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${colors.bg} rounded-full flex items-center justify-center shadow-2xl`}>
              <ErrorIcon className="h-10 w-10 text-white" />
            </div>

            <HyperText
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent"
              duration={1000}
            >
              SECURITY ALERT
            </HyperText>

            <AuroraText className="text-lg">
              Authentication Failure Detected
            </AuroraText>
          </div>

          {/* Error Details */}
          <NeonGradientCard className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>
                  Authentication Error
                </h3>
                <TextAnimate
                  animation="fadeIn"
                  delay={200}
                  className="text-muted-foreground"
                >
                  {getErrorMessage(error)}
                </TextAnimate>
              </div>

              {/* Error Details */}
              <div className="p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Error Code:</span>
                    <span className="font-mono text-white">{error || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Severity:</span>
                    <span className={`font-semibold capitalize ${colors.text}`}>
                      {severity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="font-mono text-white">
                      {new Date().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Recommendations */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-400 font-semibold text-sm mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Recommendations
                </h4>
                <ul className="text-sm text-blue-300 space-y-1">
                  <li>• Verify your credentials are correct</li>
                  <li>• Ensure your account has proper permissions</li>
                  <li>• Contact security team if issue persists</li>
                  <li>• Check your network connection</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href="/auth/signin">
                  <ShimmerButton className="w-full py-4 text-lg">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5" />
                      Retry Authentication
                    </div>
                  </ShimmerButton>
                </Link>

                <TextAnimate
                  animation="fadeIn"
                  delay={500}
                  className="text-xs text-center text-muted-foreground"
                >
                  This incident has been logged for security review
                </TextAnimate>
              </div>
            </div>
          </NeonGradientCard>

          {/* Emergency Contact */}
          <div className="text-center">
            <TextAnimate
              animation="fadeIn"
              delay={1000}
              className="text-xs text-muted-foreground"
            >
              For urgent access issues, contact your security administrator
            </TextAnimate>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto"></div>
            <p className="text-xl font-semibold text-white">Loading Security Error...</p>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}



