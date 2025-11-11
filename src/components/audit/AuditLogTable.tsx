"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, Search, Download, Clock, User, Shield, AlertTriangle, CheckCircle, XCircle, Activity, Filter } from "lucide-react"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list"
import { WarpBackground } from "@/components/ui/warp-background"
import { TextAnimate } from "@/components/ui/text-animate"
import { ShimmerButton } from "@/components/ui/shimmer-button"

interface AuditLog {
  id: string
  timestamp: string
  userEmail: string | null
  action: string
  resourceType: string | null
  success: boolean
  details: string | null
  clientIp: string | null
}

export function AuditLogTable() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    action: "",
    resourceType: "",
    startDate: "",
    endDate: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchLogs()
  }, [page, filters])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })

      if (filters.action) params.set("action", filters.action)
      if (filters.resourceType) params.set("resourceType", filters.resourceType)
      if (filters.startDate) params.set("startDate", filters.startDate)
      if (filters.endDate) params.set("endDate", filters.endDate)

      const response = await fetch(`/api/audit-logs?${params}`)
      if (!response.ok) throw new Error("Failed to fetch audit logs")

      const data = await response.json()
      setLogs(data.logs)
      setTotal(data.pagination.total)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "PPpp")
    } catch (error) {
      return timestamp
    }
  }

  const handleExport = () => {
    toast({
      title: "Security Report Export",
      description: "Generating comprehensive security audit report...",
    })
  }

  const getActionIcon = (action: string) => {
    if (action.includes('CREATE') || action.includes('create')) return CheckCircle
    if (action.includes('DELETE') || action.includes('delete')) return XCircle
    if (action.includes('UPDATE') || action.includes('update')) return Activity
    return Shield
  }

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('create')) return 'text-green-400'
    if (action.includes('DELETE') || action.includes('delete')) return 'text-red-400'
    if (action.includes('UPDATE') || action.includes('update')) return 'text-blue-400'
    return 'text-purple-400'
  }

  if (loading) {
    return (
      <div className="relative">
        <WarpBackground className="opacity-20">
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto"></div>
              <TextAnimate
                animation="blurIn"
                className="text-xl font-semibold text-white"
              >
                Scanning Security Events...
              </TextAnimate>
            </div>
          </div>
        </WarpBackground>
      </div>
    )
  }

  return (
    <div className="relative">
      <WarpBackground className="opacity-30"><div /></WarpBackground>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <NeonGradientCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Security Event Timeline
              </h3>
              <p className="text-muted-foreground">
                {total.toLocaleString()} security events monitored • Real-time compliance tracking
              </p>
            </div>
            <ShimmerButton onClick={handleExport} className="px-6 py-3">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </ShimmerButton>
          </div>
        </NeonGradientCard>

        {/* Filters */}
        <NeonGradientCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-amber-400" />
              <h4 className="text-lg font-semibold text-white">Security Filters</h4>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="action" className="text-white font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  Action Type
                </Label>
                <Input
                  id="action"
                  placeholder="Filter by security action..."
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  className="border-slate-700 bg-slate-900/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceType" className="text-white font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-400" />
                  Resource Type
                </Label>
                <Input
                  id="resourceType"
                  placeholder="Filter by resource..."
                  value={filters.resourceType}
                  onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                  className="border-slate-700 bg-slate-900/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-white font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="border-slate-700 bg-slate-900/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-white font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="border-slate-700 bg-slate-900/50 text-white"
                />
              </div>
            </div>
          </div>
        </NeonGradientCard>

        {/* Timeline Visualization */}
        {logs.length === 0 ? (
          <NeonGradientCard className="p-12">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Security Vault Clean</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  No security events detected in the specified time range. All systems operating normally with full compliance.
                </p>
              </div>
            </div>
          </NeonGradientCard>
        ) : (
          <div className="space-y-6">
            {/* Timeline Header */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-amber-400">{logs.length}</span> events displayed •
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total.toLocaleString()} total events
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm text-white px-3 py-1 bg-slate-900/50 rounded">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-slate-700 hover:bg-slate-800"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500"></div>

              <AnimatedList>
                {logs.map((log, index) => {
                  const ActionIcon = getActionIcon(log.action)
                  const actionColor = getActionColor(log.action)

                  return (
                    <AnimatedListItem key={log.id}>
                      <div className="relative flex items-start gap-6 p-6 bg-slate-900/20 border border-slate-800/50 rounded-lg backdrop-blur-sm hover:bg-slate-900/40 transition-colors">
                        {/* Timeline Dot */}
                        <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                          log.success
                            ? 'bg-green-500 border-green-500'
                            : 'bg-red-500 border-red-500'
                        }`}>
                          {log.success ? (
                            <CheckCircle className="h-3 w-3 text-white" />
                          ) : (
                            <XCircle className="h-3 w-3 text-white" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              log.success
                                ? 'bg-green-500/20 border border-green-500/30'
                                : 'bg-red-500/20 border border-red-500/30'
                            }`}>
                              <ActionIcon className={`h-4 w-4 ${actionColor}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold font-mono">
                                {log.action}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {formatTimestamp(log.timestamp)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-400" />
                              <span className="text-muted-foreground">User:</span>
                              <span className="text-white font-medium">
                                {log.userEmail || "System"}
                              </span>
                            </div>

                            {log.resourceType && (
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-purple-400" />
                                <span className="text-muted-foreground">Resource:</span>
                                <span className="text-white font-medium">
                                  {log.resourceType}
                                </span>
                              </div>
                            )}

                            {log.clientIp && (
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-400" />
                                <span className="text-muted-foreground">IP:</span>
                                <span className="text-white font-mono">
                                  {log.clientIp}
                                </span>
                              </div>
                            )}
                          </div>

                          {log.details && (
                            <div className="mt-3 p-3 bg-slate-900/50 rounded border border-slate-800/50">
                              <p className="text-sm text-muted-foreground">
                                {log.details}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </AnimatedListItem>
                  )
                })}
              </AnimatedList>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



