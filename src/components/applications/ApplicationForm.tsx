"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface ApplicationFormProps {
  initialData?: {
    id?: string
    name: string
    vaultBasePath: string
    description?: string
  }
  onSuccess?: () => void
}

export function ApplicationForm({ initialData, onSuccess }: ApplicationFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    vaultBasePath: initialData?.vaultBasePath || "",
    description: initialData?.description || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData?.id
        ? `/api/applications/${initialData.id}`
        : "/api/applications"
      const method = initialData?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save application")
      }

      toast({
        title: "Success",
        description: `Application ${initialData?.id ? "updated" : "created"} successfully`,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard/applications")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            Define the application and its Vault secret path
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Application Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., my-web-app"
              required
            />
            <p className="text-sm text-muted-foreground">
              A unique identifier for this application
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vaultBasePath">Vault Base Path *</Label>
            <Input
              id="vaultBasePath"
              value={formData.vaultBasePath}
              onChange={(e) =>
                setFormData({ ...formData, vaultBasePath: e.target.value })
              }
              placeholder="e.g., secret/my-app"
              required
            />
            <p className="text-sm text-muted-foreground">
              The base path in Vault where secrets for this application are stored
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description of this application"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/applications")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData?.id ? "Update Application" : "Create Application"}
        </Button>
      </div>
    </form>
  )
}



