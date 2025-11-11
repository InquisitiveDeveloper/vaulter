"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { EnvironmentForm } from "@/components/environments/EnvironmentForm"
import { NamespaceList } from "@/components/namespaces/NamespaceList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

interface Environment {
  id: string
  name: string
  description?: string
  vaultAddress: string
  vaultAuthType: string
  vaultUserId?: string
  vaultTokenTTL?: number
}

export default function EnvironmentDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [environment, setEnvironment] = useState<Environment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnvironment()
  }, [params.id])

  const fetchEnvironment = async () => {
    try {
      const response = await fetch(`/api/environments/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch environment")
      const data = await response.json()
      setEnvironment(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load environment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading environment...</p>
      </div>
    )
  }

  if (!environment) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Environment not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{environment.name}</h1>
        <p className="text-muted-foreground">
          Manage environment settings and namespaces
        </p>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="namespaces">Namespaces</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <EnvironmentForm initialData={environment} onSuccess={fetchEnvironment} />
        </TabsContent>

        <TabsContent value="namespaces">
          <NamespaceList environmentId={environment.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}



