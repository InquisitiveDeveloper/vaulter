"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Eye } from "lucide-react"

interface Version {
  version: number
  created_time: string
  deletion_time: string
  destroyed: boolean
}

interface VersionHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  environmentId: string
  namespaceName: string
  applicationId: string
  secretKey: string
}

export function VersionHistory({
  open,
  onOpenChange,
  environmentId,
  namespaceName,
  applicationId,
  secretKey,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [currentVersion, setCurrentVersion] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchVersions()
    }
  }, [open])

  const fetchVersions = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/secrets/${encodeURIComponent(secretKey)}/versions?environmentId=${environmentId}&namespaceName=${namespaceName}&applicationId=${applicationId}`
      )

      if (!response.ok) throw new Error("Failed to fetch versions")

      const data = await response.json()
      setVersions(data.versions || [])
      setCurrentVersion(data.current_version || 0)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load version history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const viewVersion = (version: number) => {
    // This would open the secret dialog in view mode with the specific version
    // For now, we'll just show a toast
    toast({
      title: "Version Viewer",
      description: `Viewing version ${version} of ${secretKey}`,
    })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "PPpp")
    } catch (error) {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            Version history for secret: <span className="font-mono">{secretKey}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Loading version history...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No version history available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.version}>
                    <TableCell className="font-medium">
                      {version.version}
                      {version.version === currentVersion && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          Current
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(version.created_time)}
                    </TableCell>
                    <TableCell>
                      {version.destroyed ? (
                        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
                          Destroyed
                        </span>
                      ) : version.deletion_time ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
                          Deleted
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!version.destroyed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewVersion(version.version)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}



