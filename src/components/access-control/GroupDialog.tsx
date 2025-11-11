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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface Group {
  id: string
  name: string
  description?: string
}

interface GroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null
}

export function GroupDialog({ open, onOpenChange, group }: GroupDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
      })
    }
  }, [group, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = group ? `/api/groups/${group.id}` : "/api/groups"
      const method = group ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save group")
      }

      toast({
        title: "Success",
        description: `Group ${group ? "updated" : "created"} successfully`,
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
            <DialogTitle>{group ? "Edit Group" : "Add Group"}</DialogTitle>
            <DialogDescription>
              {group
                ? "Update the group details"
                : "Create a new user group"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., developers, admins"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description of this group"
                rows={3}
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
              {loading ? "Saving..." : group ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}



