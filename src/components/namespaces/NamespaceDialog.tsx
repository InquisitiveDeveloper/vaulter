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

interface Namespace {
  id: string
  name: string
  environmentId: string
}

interface NamespaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  environmentId: string
  namespace?: Namespace | null
}

export function NamespaceDialog({
  open,
  onOpenChange,
  environmentId,
  namespace,
}: NamespaceDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")

  useEffect(() => {
    if (namespace) {
      setName(namespace.name)
    } else {
      setName("")
    }
  }, [namespace, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name,
        environmentId,
      }

      const url = namespace
        ? `/api/namespaces/${namespace.id}`
        : "/api/namespaces"
      const method = namespace ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save namespace")
      }

      toast({
        title: "Success",
        description: `Namespace ${namespace ? "updated" : "created"} successfully`,
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
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {namespace ? "Edit Namespace" : "Add Namespace"}
            </DialogTitle>
            <DialogDescription>
              {namespace
                ? "Update the namespace configuration"
                : "Add a new Vault namespace to this environment"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Namespace Path</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., admin/team1 or leave empty for root"
                required
              />
              <p className="text-sm text-muted-foreground">
                The Vault namespace path (leave empty for root namespace)
              </p>
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
              {loading ? "Saving..." : namespace ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}



