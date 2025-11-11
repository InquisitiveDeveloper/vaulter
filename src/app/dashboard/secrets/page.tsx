"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SecretTable } from "@/components/secrets/SecretTable"
import { useToast } from "@/components/ui/use-toast"
import { Database, FolderOpen, AlertCircle, Shield, Lock, Key } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { AuroraText } from "@/components/ui/aurora-text"
import { HyperText } from "@/components/ui/hyper-text"
import { RetroGrid } from "@/components/ui/retro-grid"
import { Particles } from "@/components/ui/particles"
import { TextAnimate } from "@/components/ui/text-animate"

interface Environment {
  id: string
  name: string
}

interface Namespace {
  id: string
  name: string
  environmentId: string
}

interface Application {
  id: string
  name: string
  vaultBasePath: string
}

export default function SecretsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("")
  const [selectedNamespace, setSelectedNamespace] = useState<string>("")
  const [selectedApplication, setSelectedApplication] = useState<string>("")
  
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedEnvironment) {
      fetchNamespaces(selectedEnvironment)
    } else {
      setNamespaces([])
      setSelectedNamespace("")
    }
  }, [selectedEnvironment])

  const fetchInitialData = async () => {
    try {
      const [envsRes, appsRes] = await Promise.all([
        fetch("/api/environments"),
        fetch("/api/applications"),
      ])

      if (!envsRes.ok || !appsRes.ok) throw new Error("Failed to fetch data")

      const envsData = await envsRes.json()
      const appsData = await appsRes.json()

      setEnvironments(envsData)
      setApplications(appsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load initial data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchNamespaces = async (environmentId: string) => {
    try {
      const response = await fetch(`/api/namespaces?environmentId=${environmentId}`)
      if (!response.ok) throw new Error("Failed to fetch namespaces")
      const data = await response.json()
      setNamespaces(data)
      
      // Auto-select first namespace or empty string for root
      if (data.length > 0) {
        setSelectedNamespace(data[0].name)
      } else {
        setSelectedNamespace("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load namespaces",
        variant: "destructive",
      })
    }
  }

  const isContextSelected = selectedEnvironment && selectedApplication

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
                Initializing Secure Environment...
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
          <HyperText
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent"
            duration={800}
          >
            SECRET VAULT
          </HyperText>
          <AuroraText className="text-xl md:text-2xl">
            Enterprise-Grade Secret Management
          </AuroraText>
          <TextAnimate
            animation="fadeIn"
            delay={300}
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Securely manage, encrypt, and control access to sensitive configuration data across your infrastructure with military-grade protection
          </TextAnimate>
        </div>

        {/* Context Selection */}
        <NeonGradientCard className="max-w-4xl mx-auto">
          <div className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Security Context Configuration
              </h3>
              <p className="text-muted-foreground">
                Establish your secure environment boundaries
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Environment Selection */}
              <div className="space-y-3">
                <Label htmlFor="environment" className="text-white font-semibold flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  Environment
                </Label>
                <Select
                  value={selectedEnvironment}
                  onValueChange={setSelectedEnvironment}
                >
                  <SelectTrigger id="environment" className="border-slate-700 bg-slate-900/50 text-white">
                    <SelectValue placeholder="Select secure environment" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900">
                    {environments.map((env) => (
                      <SelectItem key={env.id} value={env.id} className="text-white hover:bg-slate-800">
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Namespace Selection */}
              <div className="space-y-3">
                <Label htmlFor="namespace" className="text-white font-semibold flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  Namespace
                </Label>
                <Select
                  value={selectedNamespace}
                  onValueChange={setSelectedNamespace}
                  disabled={!selectedEnvironment}
                >
                  <SelectTrigger id="namespace" className="border-slate-700 bg-slate-900/50 text-white">
                    <SelectValue placeholder="Select security namespace" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900">
                    <SelectItem value="" className="text-white hover:bg-slate-800">(root)</SelectItem>
                    {namespaces.map((ns) => (
                      <SelectItem key={ns.id} value={ns.name} className="text-white hover:bg-slate-800">
                        {ns.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Application Selection */}
              <div className="space-y-3">
                <Label htmlFor="application" className="text-white font-semibold flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Key className="h-4 w-4 text-white" />
                  </div>
                  Application
                </Label>
                <Select
                  value={selectedApplication}
                  onValueChange={setSelectedApplication}
                >
                  <SelectTrigger id="application" className="border-slate-700 bg-slate-900/50 text-white">
                    <SelectValue placeholder="Select target application" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900">
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id} className="text-white hover:bg-slate-800">
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isContextSelected && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h4 className="text-yellow-400 font-semibold">Security Context Required</h4>
                    <p className="text-yellow-300 text-sm">
                      Please configure your environment, namespace, and application to access the secure vault
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </NeonGradientCard>

        {/* Secret Management Interface */}
        {isContextSelected && (
          <SecretTable
            environmentId={selectedEnvironment}
            namespaceName={selectedNamespace}
            applicationId={selectedApplication}
          />
        )}
      </div>
    </div>
  )
}



