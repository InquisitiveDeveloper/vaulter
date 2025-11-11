"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Shield, Lock, Key, Eye, EyeOff, User, Mail, CheckCircle } from "lucide-react"
import { HyperText } from "@/components/ui/hyper-text"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { Particles } from "@/components/ui/particles"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { TextAnimate } from "@/components/ui/text-animate"
import { AuroraText } from "@/components/ui/aurora-text"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password, name)

      if (error) {
        setError(error.message || "Failed to create account")
      } else {
        setSuccess("Account created successfully! Check your email to verify your account.")
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up")
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
              CREATE ACCOUNT
            </HyperText>

            <AuroraText className="text-lg">
              Join the Secure Vault Platform
            </AuroraText>

            <div className="max-w-xs mx-auto">
              <TypingAnimation
                className="text-sm text-muted-foreground"
                duration={50}
              >
                Establishing secure registration protocols...
              </TypingAnimation>
            </div>
          </div>

          {/* Registration Form */}
          <NeonGradientCard className="p-8">
            <div className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-semibold text-sm">Registration Failed</h4>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-green-400 font-semibold text-sm">Success!</h4>
                      <p className="text-green-300 text-sm">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-cyan-400" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                    className="border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-400 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4 text-cyan-400" />
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
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter secure password (min. 6 characters)"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white font-semibold flex items-center gap-2">
                    <Key className="h-4 w-4 text-cyan-400" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-400 h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
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
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Create Secure Account
                    </div>
                  )}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    Sign in here
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
              Your data is encrypted and protected with industry-standard security
            </TextAnimate>
          </div>
        </div>
      </div>
    </div>
  )
}

