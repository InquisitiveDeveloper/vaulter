"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { Plus, FolderOpen, Trash2, Edit } from "lucide-react"
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

interface Application {
  id: string
  name: string
  vaultBasePath: string
  description?: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications")
      if (!response.ok) throw new Error("Failed to fetch applications")
      const data = await response.json()
      setApplications(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteApplication = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Application deleted successfully",
      })

      fetchApplications()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Manage application secret paths in Vault
          </p>
        </div>
        <Link href="/dashboard/applications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Applications</CardTitle>
            <CardDescription>
              Get started by adding your first application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/applications/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Applications</CardTitle>
            <CardDescription>
              {applications.length} application{applications.length !== 1 ? "s" : ""}{" "}
              configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Vault Path</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        {app.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {app.vaultBasePath}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/applications/${app.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Application
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{app.name}&quot;? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteApplication(app.id)}
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}



