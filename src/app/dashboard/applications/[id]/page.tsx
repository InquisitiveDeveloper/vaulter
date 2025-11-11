"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ApplicationForm } from "@/components/applications/ApplicationForm"
import { useToast } from "@/components/ui/use-toast"

interface Application {
  id: string
  name: string
  vaultBasePath: string
  description?: string
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplication()
  }, [params.id])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch application")
      const data = await response.json()
      setApplication(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load application",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading application...</p>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Application not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{application.name}</h1>
        <p className="text-muted-foreground">
          Edit application configuration
        </p>
      </div>

      <ApplicationForm initialData={application} onSuccess={fetchApplication} />
    </div>
  )
}



