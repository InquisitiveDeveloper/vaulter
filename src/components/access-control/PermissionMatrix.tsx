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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { TextAnimate } from "@/components/ui/text-animate"
import { WarpBackground } from "@/components/ui/warp-background"
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { Eye, EyeOff, Lock, Unlock, Shield, CheckCircle, XCircle } from "lucide-react"
import { useRef } from "react"
import { quickSuccess } from "@/lib/success"

interface Group {
  id: string
  name: string
}

interface Environment {
  id: string
  name: string
}

interface Permission {
  id: string
  groupId: string
  environmentId: string | null
  canViewSecrets: boolean
  canEditSecrets: boolean
  canDeleteSecrets: boolean
  canAddApps: boolean
  canManageLocks: boolean
  canManageAccess: boolean
  canManageEnvs: boolean
}

type PermissionKey = Exclude<keyof Permission, 'id' | 'groupId' | 'environmentId'>

const permissionLabels: Record<PermissionKey, string> = {
  canViewSecrets: "View Secrets",
  canEditSecrets: "Edit Secrets",
  canDeleteSecrets: "Delete Secrets",
  canAddApps: "Add Applications",
  canManageLocks: "Manage Locks",
  canManageAccess: "Manage Access",
  canManageEnvs: "Manage Environments",
}

export function PermissionMatrix() {
  const [groups, setGroups] = useState<Group[]>([])
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedEnv, setSelectedEnv] = useState<string>("global")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchPermissions()
  }, [selectedEnv])

  const fetchData = async () => {
    try {
      const [groupsRes, envsRes] = await Promise.all([
        fetch("/api/groups"),
        fetch("/api/environments"),
      ])

      if (!groupsRes.ok || !envsRes.ok) throw new Error("Failed to fetch data")

      const groupsData = await groupsRes.json()
      const envsData = await envsRes.json()

      setGroups(groupsData)
      setEnvironments(envsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const envId = selectedEnv === "global" ? null : selectedEnv
      const params = new URLSearchParams()
      if (envId) params.set("environmentId", envId)

      const response = await fetch(`/api/permissions?${params}`)
      if (!response.ok) throw new Error("Failed to fetch permissions")

      const data = await response.json()
      setPermissions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      })
    }
  }

  const getPermission = (groupId: string): Permission | undefined => {
    return permissions.find(
      (p) =>
        p.groupId === groupId &&
        (selectedEnv === "global"
          ? p.environmentId === null
          : p.environmentId === selectedEnv)
    )
  }

  const togglePermission = async (
    groupId: string,
    permissionKey: PermissionKey,
    currentValue: boolean
  ) => {
    try {
      const envId = selectedEnv === "global" ? null : selectedEnv
      const newValue = !currentValue

      // Get current permission or create new one
      const currentPermission = getPermission(groupId)
      const permissionData = {
        groupId,
        environmentId: envId,
        canViewSecrets: currentPermission?.canViewSecrets || false,
        canEditSecrets: currentPermission?.canEditSecrets || false,
        canDeleteSecrets: currentPermission?.canDeleteSecrets || false,
        canAddApps: currentPermission?.canAddApps || false,
        canManageLocks: currentPermission?.canManageLocks || false,
        canManageAccess: currentPermission?.canManageAccess || false,
        canManageEnvs: currentPermission?.canManageEnvs || false,
        [permissionKey]: newValue,
      }

      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissionData),
      })

      if (!response.ok) throw new Error("Failed to update permission")

      quickSuccess.permissionsUpdated()
      fetchPermissions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update permission",
        variant: "destructive",
      })
    }
  }

  const containerRef = useRef<HTMLDivElement>(null)

  if (loading) {
    return (
      <div className="relative">
        <WarpBackground className="opacity-20">
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              <TextAnimate
                animation="blurIn"
                className="text-xl font-semibold text-white"
              >
                Analyzing Security Permissions...
              </TextAnimate>
            </div>
          </div>
        </WarpBackground>
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <WarpBackground className="opacity-30"><div /></WarpBackground>
      <InteractiveGridPattern
        className="absolute inset-0 opacity-20"
        width={50}
        height={50}
        squares={[15, 15]}
      />

      <div className="relative z-10">
        <NeonGradientCard className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Permission Matrix Control
              </h3>
              <TextAnimate
                animation="fadeIn"
                delay={200}
                className="text-muted-foreground"
              >
                Configure granular access controls and security policies across your infrastructure
              </TextAnimate>
            </div>

            {/* Environment Selector */}
            <div className="flex justify-center">
              <div className="w-80">
                <Label htmlFor="env-select" className="text-white font-semibold flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-purple-400" />
                  Security Context
                </Label>
                <Select value={selectedEnv} onValueChange={setSelectedEnv}>
                  <SelectTrigger
                    id="env-select"
                    className="border-slate-700 bg-slate-900/50 text-white h-12"
                  >
                    <SelectValue placeholder="Select environment scope" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900">
                    <SelectItem value="global" className="text-white hover:bg-slate-800">
                      🌐 Global (All Environments)
                    </SelectItem>
                    {environments.map((env) => (
                      <SelectItem key={env.id} value={env.id} className="text-white hover:bg-slate-800">
                        🏗️ {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Security Groups</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create security groups first to establish permission matrices and access controls
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Permission Legend */}
                <div className="flex flex-wrap justify-center gap-4 p-4 bg-slate-900/30 rounded-lg border border-slate-800/50">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Granted</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400">Denied</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400">View Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-orange-400" />
                    <span className="text-orange-400">Lock Management</span>
                  </div>
                </div>

                {/* Permission Matrix */}
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Header Row */}
                    <div className="grid grid-cols-[200px_repeat(7,120px)] gap-2 mb-4">
                      <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                        <h4 className="font-semibold text-white text-center">Security Groups</h4>
                      </div>
                      {(Object.keys(permissionLabels) as PermissionKey[]).map((key) => (
                        <div key={key} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/50 text-center">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            {permissionLabels[key]}
                          </div>
                          {key.includes('View') && <Eye className="h-4 w-4 text-blue-400 mx-auto" />}
                          {key.includes('Edit') && <Unlock className="h-4 w-4 text-green-400 mx-auto" />}
                          {key.includes('Delete') && <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                          {key.includes('Add') && <Shield className="h-4 w-4 text-purple-400 mx-auto" />}
                          {key.includes('Manage') && <Lock className="h-4 w-4 text-orange-400 mx-auto" />}
                        </div>
                      ))}
                    </div>

                    {/* Permission Rows */}
                    {groups.map((group, groupIndex) => {
                      const permission = getPermission(group.id)
                      return (
                        <div key={group.id} className="grid grid-cols-[200px_repeat(7,120px)] gap-2 mb-3">
                          {/* Group Name */}
                          <div className="p-4 bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-lg border border-slate-700/50 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">
                                {group.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-semibold text-white">{group.name}</span>
                          </div>

                          {/* Permission Checkboxes */}
                          {(Object.keys(permissionLabels) as PermissionKey[]).map((key, permIndex) => {
                            const isGranted = permission?.[key] || false
                            return (
                              <div key={key} className="p-4 bg-slate-900/30 rounded-lg border border-slate-800/50 flex items-center justify-center">
                                <Checkbox
                                  checked={isGranted}
                                  onCheckedChange={() =>
                                    togglePermission(
                                      group.id,
                                      key,
                                      permission?.[key] || false
                                    )
                                  }
                                  className="w-6 h-6 border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                />
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Permission Summary */}
                <div className="mt-8 p-6 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-lg border border-slate-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    Security Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {permissions.filter(p => p.canViewSecrets).length}
                      </div>
                      <div className="text-sm text-muted-foreground">View Access</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {permissions.filter(p => p.canEditSecrets).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Edit Access</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {permissions.filter(p => p.canDeleteSecrets).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Delete Access</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {permissions.filter(p => p.canManageAccess).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Admin Access</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </NeonGradientCard>
      </div>
    </div>
  )
}



