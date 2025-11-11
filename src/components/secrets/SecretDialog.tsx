"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { SecretEditor } from "./SecretEditor"

interface SecretDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  environmentId: string
  namespaceName: string
  applicationId: string
  secretKey?: string | null
}

export function SecretDialog({
  open,
  onOpenChange,
  environmentId,
  namespaceName,
  applicationId,
  secretKey,
}: SecretDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState("")
  const [data, setData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (open) {
      if (secretKey) {
        // Editing existing secret
        setKey(secretKey)
        fetchSecret(secretKey)
      } else {
        // Creating new secret
        setKey("")
        setData({})
      }
    }
  }, [open, secretKey])

  const fetchSecret = async (secretKey: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/secrets/${encodeURIComponent(secretKey)}?environmentId=${environmentId}&namespaceName=${namespaceName}&applicationId=${applicationId}`
      )
      
      if (!response.ok) throw new Error("Failed to fetch secret")
      
      const result = await response.json()
      setData(result.data || {})
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load secret",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!key.trim()) {
      toast({
        title: "Error",
        description: "Secret key is required",
        variant: "destructive",
      })
      return
    }

    if (Object.keys(data).length === 0) {
      toast({
        title: "Error",
        description: "At least one key-value pair is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environmentId,
          namespaceName,
          applicationId,
          secretKey: key,
          data,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save secret")
      }

      toast({
        title: "Success",
        description: `Secret ${secretKey ? "updated" : "created"} successfully`,
      })

      onOpenChange(true) // Pass true to indicate success
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
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {secretKey ? "Edit Secret" : "Add Secret"}
            </DialogTitle>
            <DialogDescription>
              {secretKey
                ? "Update the secret key-value pairs"
                : "Create a new secret with key-value pairs"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Secret Key</Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g., database-config, api-keys"
                disabled={!!secretKey || loading}
                required
              />
              <p className="text-sm text-muted-foreground">
                The name of this secret (cannot be changed after creation)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Key-Value Pairs</Label>
              <SecretEditor
                data={data}
                onChange={setData}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : secretKey ? "Update Secret" : "Create Secret"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}



