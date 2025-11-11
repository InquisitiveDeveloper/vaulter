"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Database, Trash2, Edit, TestTube2, CheckCircle, XCircle, AlertTriangle, Shield, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { MagicCard } from "@/components/ui/magic-card"
import { BorderBeam } from "@/components/ui/border-beam"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { AuroraText } from "@/components/ui/aurora-text"
import { RetroGrid } from "@/components/ui/retro-grid"
import { Particles } from "@/components/ui/particles"
import { TextAnimate } from "@/components/ui/text-animate"

interface Environment {
  id: string
  name: string
  description?: string
  vaultAddress: string
  vaultAuthType: string
  connectionStatus?: 'connected' | 'disconnected' | 'testing' | 'error'
  lastTested?: string
  _count?: {
    namespaces: number
  }
}

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchEnvironments()
  }, [])

  const fetchEnvironments = async () => {
    try {
      const response = await fetch("/api/environments")
      if (!response.ok) throw new Error("Failed to fetch environments")
      const data = await response.json()

      // Add mock connection status for demo purposes
      const environmentsWithStatus = data.map((env: Environment) => ({
        ...env,
        connectionStatus: Math.random() > 0.3 ? 'connected' : 'disconnected' as const,
        lastTested: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      }))

      setEnvironments(environmentsWithStatus)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load environments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async (id: string) => {
    setTesting(id)

    // Update UI to show testing status
    setEnvironments(prev => prev.map(env =>
      env.id === id ? { ...env, connectionStatus: 'testing' as const } : env
    ))

    try {
      const response = await fetch(`/api/environments/${id}/test-connection`, {
        method: "POST",
      })
      const data = await response.json()

      // Update connection status based on response
      const newStatus = data.success ? 'connected' : 'error'

      setEnvironments(prev => prev.map(env =>
        env.id === id ? {
          ...env,
          connectionStatus: newStatus,
          lastTested: new Date().toISOString()
        } : env
      ))

      if (data.success) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Vault instance",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: data.message || "Failed to connect to Vault",
          variant: "destructive",
        })
      }
    } catch (error) {
      setEnvironments(prev => prev.map(env =>
        env.id === id ? {
          ...env,
          connectionStatus: 'error' as const,
          lastTested: new Date().toISOString()
        } : env
      ))

      toast({
        title: "Connection Error",
        description: "Failed to test connection to Vault",
        variant: "destructive",
      })
    } finally {
      setTesting(null)
    }
  }

  const deleteEnvironment = async (id: string) => {
    try {
      const response = await fetch(`/api/environments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Environment deleted successfully",
      })

      fetchEnvironments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete environment",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'testing':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 animate-spin" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'connected':
        return '#10b981'
      case 'disconnected':
        return '#ef4444'
      case 'testing':
        return '#f59e0b'
      case 'error':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <RetroGrid className="opacity-20" />
        <Particles
          className="absolute inset-0"
          quantity={30}
          ease={80}
          color="#ffffff"
          size={0.3}
          staticity={60}
          vx={0}
          vy={0}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <NeonGradientCard>
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <TextAnimate
                animation="blurIn"
                className="text-xl font-semibold text-white"
              >
                Loading Environments...
              </TextAnimate>
            </div>
          </NeonGradientCard>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <RetroGrid className="opacity-30" />
      <Particles
        className="absolute inset-0"
        quantity={40}
        ease={80}
        color="#ffffff"
        size={0.4}
        staticity={50}
        vx={0}
        vy={0}
      />

      {/* Header Section */}
      <div className="relative z-10 space-y-6 p-6">
        <div className="text-center space-y-4">
          <AuroraText className="text-4xl md:text-6xl font-bold">
            VAULT ENVIRONMENTS
          </AuroraText>
          <TextAnimate
            animation="fadeIn"
            delay={200}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Securely manage your Vault instances with real-time connection monitoring and enterprise-grade protection
          </TextAnimate>
        </div>

        {/* Add Environment Button */}
        <div className="flex justify-center">
          <Link href="/dashboard/environments/new">
            <ShimmerButton className="px-8 py-4 text-lg">
              <Plus className="mr-2 h-5 w-5" />
              Add New Environment
            </ShimmerButton>
          </Link>
        </div>

        {/* Environments Grid */}
        {environments.length === 0 ? (
          <div className="flex justify-center">
            <NeonGradientCard className="max-w-md">
              <div className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Environments Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Get started by configuring your first Vault environment with secure connection details
                  </p>
                  <Link href="/dashboard/environments/new">
                    <ShimmerButton className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Environment
                    </ShimmerButton>
                  </Link>
                </div>
              </div>
            </NeonGradientCard>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {environments.map((env) => (
              <MagicCard
                key={env.id}
                className="relative p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                gradientColor="#262626"
                gradientSize={200}
                gradientOpacity={0.8}
              >
                {/* Connection Status Border Beam */}
                {env.connectionStatus === 'connected' && (
                  <BorderBeam
                    size={60}
                    duration={8}
                    colorFrom={getStatusColor(env.connectionStatus)}
                    colorTo={getStatusColor(env.connectionStatus)}
                    className="opacity-60"
                  />
                )}

                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{env.name}</h3>
                        <p className="text-sm text-muted-foreground">{env.description}</p>
                      </div>
                    </div>
                    {getStatusIcon(env.connectionStatus)}
                  </div>

                  {/* Connection Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-cyan-400" />
                      <span className="text-muted-foreground">Auth:</span>
                      <span className="text-white font-medium">{env.vaultAuthType}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-cyan-400" />
                      <span className="text-muted-foreground">Address:</span>
                      <span className="text-white font-medium truncate">{env.vaultAddress}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4 text-cyan-400" />
                      <span className="text-muted-foreground">Namespaces:</span>
                      <span className="text-white font-medium">{env._count?.namespaces || 0}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      env.connectionStatus === 'connected'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : env.connectionStatus === 'error'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : env.connectionStatus === 'testing'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {env.connectionStatus === 'connected' && 'Connected'}
                      {env.connectionStatus === 'disconnected' && 'Disconnected'}
                      {env.connectionStatus === 'testing' && 'Testing...'}
                      {env.connectionStatus === 'error' && 'Connection Error'}
                      {!env.connectionStatus && 'Unknown'}
                    </div>

                    {env.lastTested && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(env.lastTested).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(env.id)}
                      disabled={testing === env.id}
                      className="flex-1"
                    >
                      <TestTube2 className="h-4 w-4 mr-2" />
                      {testing === env.id ? 'Testing...' : 'Test'}
                    </Button>

                    <Link href={`/dashboard/environments/${env.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-400">
                            Delete Environment
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{env.name}&quot;? This
                            will also delete all associated namespaces and secrets. This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteEnvironment(env.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Environment
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </MagicCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



