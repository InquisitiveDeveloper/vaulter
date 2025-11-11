"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface EnvironmentFormProps {
  initialData?: {
    id?: string
    name: string
    description?: string
    vaultAddress: string
    vaultAuthType: string
    vaultUserId?: string
    vaultTokenTTL?: number
  }
  onSuccess?: () => void
}

export function EnvironmentForm({ initialData, onSuccess }: EnvironmentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    vaultAddress: initialData?.vaultAddress || "",
    vaultAuthType: initialData?.vaultAuthType || "userpass",
    vaultUserId: initialData?.vaultUserId || "",
    vaultPassword: "",
    vaultTokenTTL: initialData?.vaultTokenTTL?.toString() || "3600",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        vaultTokenTTL: formData.vaultTokenTTL ? parseInt(formData.vaultTokenTTL) : undefined,
        // Only include password if it's been entered
        vaultPassword: formData.vaultPassword || undefined,
      }

      const url = initialData?.id
        ? `/api/environments/${initialData.id}`
        : "/api/environments"
      const method = initialData?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save environment")
      }

      toast({
        title: "Success",
        description: `Environment ${initialData?.id ? "updated" : "created"} successfully`,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard/environments")
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
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Configure the basic details for this environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Environment Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., production, staging, dev"
              required
            />
            <p className="text-sm text-muted-foreground">
              A unique name for this environment
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
              placeholder="Optional description of this environment"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vault Configuration</CardTitle>
          <CardDescription>
            Configure the connection to your Vault instance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vaultAddress">Vault Address *</Label>
            <Input
              id="vaultAddress"
              type="url"
              value={formData.vaultAddress}
              onChange={(e) =>
                setFormData({ ...formData, vaultAddress: e.target.value })
              }
              placeholder="https://vault.example.com:8200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vaultAuthType">Authentication Method *</Label>
            <Select
              value={formData.vaultAuthType}
              onValueChange={(value) =>
                setFormData({ ...formData, vaultAuthType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="userpass">Username/Password</SelectItem>
                <SelectItem value="approle">AppRole</SelectItem>
                <SelectItem value="token">Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.vaultAuthType === "userpass" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="vaultUserId">Vault User ID *</Label>
                <Input
                  id="vaultUserId"
                  value={formData.vaultUserId}
                  onChange={(e) =>
                    setFormData({ ...formData, vaultUserId: e.target.value })
                  }
                  placeholder="vault-user"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vaultPassword">
                  Vault Password {initialData?.id ? "(leave blank to keep current)" : "*"}
                </Label>
                <Input
                  id="vaultPassword"
                  type="password"
                  value={formData.vaultPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, vaultPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  required={!initialData?.id}
                />
                <p className="text-sm text-muted-foreground">
                  This password will be encrypted before storage
                </p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="vaultTokenTTL">Token TTL (seconds)</Label>
            <Input
              id="vaultTokenTTL"
              type="number"
              value={formData.vaultTokenTTL}
              onChange={(e) =>
                setFormData({ ...formData, vaultTokenTTL: e.target.value })
              }
              placeholder="3600"
            />
            <p className="text-sm text-muted-foreground">
              How long tokens should remain valid (default: 3600 seconds / 1 hour)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/environments")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData?.id ? "Update Environment" : "Create Environment"}
        </Button>
      </div>
    </form>
  )
}



