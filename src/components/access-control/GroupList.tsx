"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Edit, Users, Shield, UserCheck, AlertTriangle } from "lucide-react"
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
import { GroupDialog } from "./GroupDialog"
import { MagicCard } from "@/components/ui/magic-card"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { TextAnimate } from "@/components/ui/text-animate"
import { CoolMode } from "@/components/ui/cool-mode"
import { quickSuccess } from "@/lib/success"

interface Group {
  id: string
  name: string
  description?: string
  _count?: {
    users: number
    permissions: number
  }
}

interface GroupListProps {
  onUpdate?: () => void
}

export function GroupList({ onUpdate }: GroupListProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups")
      if (!response.ok) throw new Error("Failed to fetch groups")
      const data = await response.json()
      setGroups(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      quickSuccess.permissionsUpdated() // Using permissions updated as generic success
      fetchGroups()
      onUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = (success?: boolean) => {
    setDialogOpen(false)
    setEditingGroup(null)
    if (success) {
      fetchGroups()
      onUpdate?.()
    }
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <TextAnimate
            animation="blurIn"
            className="text-xl font-semibold text-white"
          >
            Loading Security Groups...
          </TextAnimate>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Group Button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              User Groups Management
            </h3>
            <p className="text-muted-foreground">
              Configure security groups and manage team access controls
            </p>
          </div>
          <CoolMode>
            <ShimmerButton onClick={() => setDialogOpen(true)} className="px-6 py-3">
              <Plus className="mr-2 h-4 w-4" />
              Create Security Group
            </ShimmerButton>
          </CoolMode>
        </div>

        {groups.length === 0 ? (
          <MagicCard
            className="p-12 text-center"
            gradientColor="#262626"
            gradientSize={200}
            gradientOpacity={0.8}
          >
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">No Security Groups</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first security group to establish role-based access control and manage user permissions
                </p>
                <CoolMode>
                  <ShimmerButton onClick={() => setDialogOpen(true)} className="px-8 py-4">
                    <Shield className="mr-2 h-4 w-4" />
                    Initialize Security Groups
                  </ShimmerButton>
                </CoolMode>
              </div>
            </div>
          </MagicCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group, index) => (
              <MagicCard
                key={group.id}
                className="relative p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                gradientColor="#262626"
                gradientSize={200}
                gradientOpacity={0.8}
              >
                <div className="space-y-4">
                  {/* Group Header */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-white truncate">
                        {group.name}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {group.description || "No description"}
                      </p>
                    </div>
                  </div>

                  {/* Group Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                      <UserCheck className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">
                        {group._count?.users || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                      <Shield className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">
                        {group._count?.permissions || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Permissions</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(group)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-red-500/20 bg-slate-900">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Security Group
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-red-300">
                            Are you sure you want to permanently delete the security group &quot;{group.name}&quot;?
                            This will remove all associated permissions and may affect user access.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteGroup(group.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Group
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

      <GroupDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        group={editingGroup}
      />
    </>
  )
}



