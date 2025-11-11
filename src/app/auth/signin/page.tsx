"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Shield, Lock, Key, Eye, EyeOff } from "lucide-react"
import { HyperText } from "@/components/ui/hyper-text"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { Particles } from "@/components/ui/particles"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { TextAnimate } from "@/components/ui/text-animate"
import { AuroraText } from "@/components/ui/aurora-text"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message || "Invalid email or password")
      }
      // Success is handled by the AuthContext (redirects to dashboard)
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <Particles
        className="absolute inset-0"
        quantity={80}
        ease={70}
        color="#ffffff"
        size={0.5}
        staticity={20}
        vx={0}
        vy={0}
      />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <Shield className="h-10 w-10 text-white" />
            </div>

            <HyperText
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
              duration={1000}
            >
              SECURE ACCESS
            </HyperText>

            <AuroraText className="text-lg">
              Enterprise Authentication Portal
            </AuroraText>

            <div className="max-w-xs mx-auto">
              <TypingAnimation
                className="text-sm text-muted-foreground"
                duration={50}
              >
                Initializing secure authentication protocols...
              </TypingAnimation>
            </div>
          </div>

          {/* Authentication Form */}
          <NeonGradientCard className="p-8">
            <div className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-semibold text-sm">Authentication Failed</h4>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-semibold flex items-center gap-2">
                    <Key className="h-4 w-4 text-cyan-400" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="security@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-400 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-cyan-400" />
                    Access Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-400 h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Sign In Securely
                    </div>
                  )}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          </NeonGradientCard>

          {/* Security Footer */}
          <div className="text-center">
            <TextAnimate
              animation="fadeIn"
              delay={1000}
              className="text-xs text-muted-foreground"
            >
              Your connection is encrypted and monitored for security compliance
            </TextAnimate>
          </div>
        </div>
      </div>
    </div>
  )
}



