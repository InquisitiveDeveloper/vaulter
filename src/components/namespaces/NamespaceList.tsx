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
import { Plus, Trash2, Edit } from "lucide-react"
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
import { NamespaceDialog } from "./NamespaceDialog"

interface Namespace {
  id: string
  name: string
  environmentId: string
}

interface NamespaceListProps {
  environmentId: string
}

export function NamespaceList({ environmentId }: NamespaceListProps) {
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNamespace, setEditingNamespace] = useState<Namespace | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchNamespaces()
  }, [environmentId])

  const fetchNamespaces = async () => {
    try {
      const response = await fetch(`/api/namespaces?environmentId=${environmentId}`)
      if (!response.ok) throw new Error("Failed to fetch namespaces")
      const data = await response.json()
      setNamespaces(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load namespaces",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteNamespace = async (id: string) => {
    try {
      const response = await fetch(`/api/namespaces/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Namespace deleted successfully",
      })

      fetchNamespaces()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete namespace",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = (success?: boolean) => {
    setDialogOpen(false)
    setEditingNamespace(null)
    if (success) {
      fetchNamespaces()
    }
  }

  const handleEdit = (namespace: Namespace) => {
    setEditingNamespace(namespace)
    setDialogOpen(true)
  }

  if (loading) {
    return <div>Loading namespaces...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Namespaces</CardTitle>
              <CardDescription>
                Manage Vault namespaces for this environment
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Namespace
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {namespaces.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No namespaces configured</p>
              <p className="text-sm">Add a namespace to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namespace</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {namespaces.map((ns) => (
                  <TableRow key={ns.id}>
                    <TableCell className="font-medium">{ns.name || "(root)"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(ns)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Namespace</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{ns.name || "(root)"}&quot;?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteNamespace(ns.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NamespaceDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        environmentId={environmentId}
        namespace={editingNamespace}
      />
    </div>
  )
}



