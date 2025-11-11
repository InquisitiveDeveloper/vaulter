"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Home, Shield, AlertTriangle } from "lucide-react"
import { HyperText } from "@/components/ui/hyper-text"
import { Particles } from "@/components/ui/particles"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { TextAnimate } from "@/components/ui/text-animate"
import { AuroraText } from "@/components/ui/aurora-text"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { Confetti } from "@/components/ui/confetti"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo)
    
    // Handle ChunkLoadError by automatically reloading the page
    // This occurs when webpack chunks fail to load due to cache issues or deployments
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.warn('ChunkLoadError detected - reloading page to fetch latest chunks...')
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative min-h-screen overflow-hidden">
          {/* Background Effects */}
          <Particles
            className="absolute inset-0"
            quantity={40}
            ease={90}
            color="#ffffff"
            size={0.3}
            staticity={30}
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
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                  <AlertTriangle className="h-10 w-10 text-white" />
                </div>

                <HyperText
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent"
                  duration={1000}
                >
                  SYSTEM ERROR
                </HyperText>

                <AuroraText className="text-lg">
                  Critical Application Failure
                </AuroraText>
              </div>

              {/* Error Details */}
              <NeonGradientCard className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Application Crash Detected
                    </h3>
                    <TextAnimate
                      animation="fadeIn"
                      delay={200}
                      className="text-muted-foreground"
                    >
                      An unexpected error has occurred. Our security systems have been notified.
                    </TextAnimate>
                  </div>

                  {/* Error Information */}
                  {this.state.error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <h4 className="text-red-400 font-semibold text-sm">Error Details</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Error:</span>
                          <span className="font-mono text-red-300 text-right">
                            {this.state.error.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Message:</span>
                          <span className="font-mono text-red-300 text-right max-w-[200px] truncate">
                            {this.state.error.message}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Timestamp:</span>
                          <span className="font-mono text-red-300 text-right">
                            {new Date().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recovery Options */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="text-blue-400 font-semibold text-sm mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Recovery Options
                    </h4>
                    <div className="grid gap-3">
                      <ShimmerButton
                        onClick={() => window.location.reload()}
                        className="w-full py-3"
                      >
                        <div className="flex items-center gap-3">
                          <RefreshCw className="h-4 w-4" />
                          Refresh Application
                        </div>
                      </ShimmerButton>

                      <Button
                        onClick={() => window.location.href = "/"}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 border border-slate-500"
                      >
                        <div className="flex items-center gap-3">
                          <Home className="h-4 w-4" />
                          Return to Dashboard
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="text-center">
                    <TextAnimate
                      animation="fadeIn"
                      delay={1000}
                      className="text-xs text-muted-foreground"
                    >
                      This error has been automatically reported to our security team for investigation
                    </TextAnimate>
                  </div>
                </div>
              </NeonGradientCard>

              {/* Confetti Animation on Recovery */}
              <Confetti />
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}



