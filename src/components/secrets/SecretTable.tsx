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
import { Plus, Trash2, Edit, Lock, Unlock, Eye, EyeOff, History, Shield, Key, AlertTriangle } from "lucide-react"
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
import { SecretDialog } from "./SecretDialog"
import { VersionHistory } from "./VersionHistory"
import { MagicCard } from "@/components/ui/magic-card"
import { BorderBeam } from "@/components/ui/border-beam"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/ui/terminal"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { TextAnimate } from "@/components/ui/text-animate"

interface SecretTableProps {
  environmentId: string
  namespaceName: string
  applicationId: string
}

export function SecretTable({
  environmentId,
  namespaceName,
  applicationId,
}: SecretTableProps) {
  const [secrets, setSecrets] = useState<string[]>([])
  const [lockedKeys, setLockedKeys] = useState<Set<string>>(new Set())
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSecret, setEditingSecret] = useState<string | null>(null)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [versionHistoryKey, setVersionHistoryKey] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSecrets()
  }, [environmentId, namespaceName, applicationId])

  const fetchSecrets = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/secrets?environmentId=${environmentId}&namespaceName=${namespaceName}&applicationId=${applicationId}`
      )
      if (!response.ok) throw new Error("Failed to fetch secrets")
      const data = await response.json()
      setSecrets(data.keys || [])
      setLockedKeys(new Set(data.lockedKeys || []))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load secrets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleLock = async (secretKey: string, isCurrentlyLocked: boolean) => {
    try {
      const url = `/api/secrets/${encodeURIComponent(secretKey)}/lock`
      const method = isCurrentlyLocked ? "DELETE" : "POST"
      const body = isCurrentlyLocked
        ? null
        : JSON.stringify({
            applicationId,
            environmentId,
            namespaceName,
          })

      const response = await fetch(
        isCurrentlyLocked
          ? `${url}?applicationId=${applicationId}&environmentId=${environmentId}&namespaceName=${namespaceName}`
          : url,
        {
          method,
          headers: body ? { "Content-Type": "application/json" } : {},
          body,
        }
      )

      if (!response.ok) throw new Error("Failed to toggle lock")

      // Update local state
      const newLockedKeys = new Set(lockedKeys)
      if (isCurrentlyLocked) {
        newLockedKeys.delete(secretKey)
      } else {
        newLockedKeys.add(secretKey)
        // Remove from revealed when locking
        const newRevealedKeys = new Set(revealedKeys)
        newRevealedKeys.delete(secretKey)
        setRevealedKeys(newRevealedKeys)
      }
      setLockedKeys(newLockedKeys)

      toast({
        title: "Success",
        description: `Secret ${isCurrentlyLocked ? "unlocked" : "locked"} successfully`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle lock",
        variant: "destructive",
      })
    }
  }

  const toggleReveal = (secretKey: string) => {
    const newRevealedKeys = new Set(revealedKeys)
    if (newRevealedKeys.has(secretKey)) {
      newRevealedKeys.delete(secretKey)
    } else {
      newRevealedKeys.add(secretKey)
    }
    setRevealedKeys(newRevealedKeys)
  }

  const deleteSecret = async (secretKey: string) => {
    try {
      const response = await fetch(
        `/api/secrets/${encodeURIComponent(secretKey)}?environmentId=${environmentId}&namespaceName=${namespaceName}&applicationId=${applicationId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Secret deleted successfully",
      })

      fetchSecrets()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete secret",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = (success?: boolean) => {
    setDialogOpen(false)
    setEditingSecret(null)
    if (success) {
      fetchSecrets()
    }
  }

  const handleEdit = (secretKey: string) => {
    setEditingSecret(secretKey)
    setDialogOpen(true)
  }

  const handleVersionHistory = (secretKey: string) => {
    setVersionHistoryKey(secretKey)
    setVersionHistoryOpen(true)
  }

  if (loading) {
    return (
      <div className="relative">
        <FlickeringGrid className="opacity-20" />
        <div className="relative z-10">
          <NeonGradientCard>
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
              <TextAnimate
                animation="blurIn"
                className="text-xl font-semibold text-white"
              >
                Decrypting Secrets...
              </TextAnimate>
            </div>
          </NeonGradientCard>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative">
        <FlickeringGrid className="opacity-20" />

        {/* Header Section */}
        <div className="relative z-10 mb-6">
          <NeonGradientCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-green-500 bg-clip-text text-transparent">
                    Secure Secret Vault
                  </h3>
                  <p className="text-muted-foreground">
                    {secrets.length} encrypted secret{secrets.length !== 1 ? "s" : ""} under protection
                  </p>
                </div>
                <ShimmerButton onClick={() => setDialogOpen(true)} className="px-6 py-3">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Encrypted Secret
                </ShimmerButton>
              </div>
            </div>
          </NeonGradientCard>
        </div>

        {/* Secrets Display */}
        {secrets.length === 0 ? (
          <div className="relative z-10">
            <NeonGradientCard>
              <div className="p-12 text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Secure Vault Empty</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    No secrets are currently stored in this secure environment. Add your first encrypted secret to begin.
                  </p>
                  <ShimmerButton onClick={() => setDialogOpen(true)} className="px-8 py-4">
                    <Key className="mr-2 h-4 w-4" />
                    Initialize First Secret
                  </ShimmerButton>
                </div>
              </div>
            </NeonGradientCard>
          </div>
        ) : (
          <div className="relative z-10 space-y-4">
            {/* Terminal-style Secret Display */}
            <Terminal>
              <TypingAnimation>Initializing secure terminal...</TypingAnimation>
              <AnimatedSpan delay={100}>Loading {secrets.length} encrypted secrets...</AnimatedSpan>
              <AnimatedSpan delay={200}>Security protocols active ✓</AnimatedSpan>
              <AnimatedSpan delay={300}>Access control verified ✓</AnimatedSpan>
            </Terminal>

            {/* Secrets Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {secrets.map((secretKey, index) => {
                const isLocked = lockedKeys.has(secretKey)
                const isRevealed = revealedKeys.has(secretKey)

                return (
                  <MagicCard
                    key={secretKey}
                    className="relative p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    gradientColor="#262626"
                    gradientSize={200}
                    gradientOpacity={0.8}
                  >
                    {/* Security Border Beam for Locked Secrets */}
                    {isLocked && (
                      <BorderBeam
                        size={60}
                        duration={8}
                        colorFrom="#f59e0b"
                        colorTo="#f59e0b"
                        className="opacity-60"
                      />
                    )}

                    <div className="space-y-4">
                      {/* Secret Key Display */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isLocked
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}>
                          {isLocked ? (
                            <Lock className="h-4 w-4 text-white" />
                          ) : (
                            <Key className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-mono font-semibold truncate">
                            {secretKey}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {isLocked && !isRevealed ? '•••••••• (encrypted)' : 'visible'}
                          </p>
                        </div>
                      </div>

                      {/* Security Status */}
                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                            <Lock className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs font-medium text-yellow-400">Encrypted</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                            <Unlock className="h-3 w-3 text-green-400" />
                            <span className="text-xs font-medium text-green-400">Decrypted</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {isLocked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleReveal(secretKey)}
                            className="flex-1"
                          >
                            {isRevealed ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Reveal
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleLock(secretKey, isLocked)}
                          className="flex-1"
                        >
                          {isLocked ? (
                            <>
                              <Unlock className="h-3 w-3 mr-1" />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Lock
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVersionHistory(secretKey)}
                        >
                          <History className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Edit and Delete Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(secretKey)}
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
                                Delete Encrypted Secret
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-red-300">
                                Are you sure you want to permanently delete the secret &quot;{secretKey}&quot;?
                                This action cannot be undone and will remove all versions of this secret.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSecret(secretKey)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Secret
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </MagicCard>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <SecretDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        environmentId={environmentId}
        namespaceName={namespaceName}
        applicationId={applicationId}
        secretKey={editingSecret}
      />

      {versionHistoryKey && (
        <VersionHistory
          open={versionHistoryOpen}
          onOpenChange={() => setVersionHistoryOpen(false)}
          environmentId={environmentId}
          namespaceName={namespaceName}
          applicationId={applicationId}
          secretKey={versionHistoryKey}
        />
      )}
    </>
  )
}



