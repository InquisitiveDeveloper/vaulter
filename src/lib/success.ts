/**
 * Global success notification system for the Vault Secret Management UI
 * Triggers confetti animations and toast notifications for successful operations
 */

import { toast } from "@/components/ui/use-toast"

export interface SuccessConfig {
  title: string
  description?: string
  showConfetti?: boolean
  confettiDuration?: number
}

export function showSuccess(config: SuccessConfig) {
  // Show toast notification
  toast({
    title: config.title,
    description: config.description,
    duration: 5000,
  })

  // Trigger global confetti animation if requested
  if (config.showConfetti !== false) {
    const event = new CustomEvent('vault-success', {
      detail: { duration: config.confettiDuration || 3000 }
    })
    window.dispatchEvent(event)
  }
}

// Predefined success messages for common operations
export const SuccessMessages = {
  // Authentication
  LOGIN: {
    title: "Secure Login Successful",
    description: "Welcome back to your secure vault management system",
    showConfetti: true,
  },

  // Environments
  ENVIRONMENT_CREATED: {
    title: "Environment Added",
    description: "New Vault environment configured successfully",
    showConfetti: true,
  },

  ENVIRONMENT_TESTED: {
    title: "Connection Verified",
    description: "Vault environment connection test passed",
    showConfetti: false,
  },

  // Secrets
  SECRET_CREATED: {
    title: "Secret Stored Securely",
    description: "Your secret has been encrypted and stored in Vault",
    showConfetti: true,
  },

  SECRET_UPDATED: {
    title: "Secret Updated",
    description: "Secret modifications have been saved securely",
    showConfetti: false,
  },

  SECRET_DELETED: {
    title: "Secret Removed",
    description: "Secret has been permanently deleted from Vault",
    showConfetti: false,
  },

  // Groups & Permissions
  GROUP_CREATED: {
    title: "Security Group Created",
    description: "New user group established with access controls",
    showConfetti: true,
  },

  PERMISSIONS_UPDATED: {
    title: "Access Controls Updated",
    description: "Security permissions have been modified successfully",
    showConfetti: false,
  },

  // Applications
  APPLICATION_CREATED: {
    title: "Application Registered",
    description: "New application added to the vault system",
    showConfetti: true,
  },

  // Audit & Compliance
  AUDIT_EXPORTED: {
    title: "Security Report Generated",
    description: "Comprehensive audit log export completed",
    showConfetti: false,
  },

  // General
  OPERATION_SUCCESSFUL: {
    title: "Operation Completed",
    description: "Your request has been processed successfully",
    showConfetti: false,
  },
} as const

// Quick success helpers
export const quickSuccess = {
  login: () => showSuccess(SuccessMessages.LOGIN),
  secretCreated: () => showSuccess(SuccessMessages.SECRET_CREATED),
  secretUpdated: () => showSuccess(SuccessMessages.SECRET_UPDATED),
  secretDeleted: () => showSuccess(SuccessMessages.SECRET_DELETED),
  environmentAdded: () => showSuccess(SuccessMessages.ENVIRONMENT_CREATED),
  connectionTested: () => showSuccess(SuccessMessages.ENVIRONMENT_TESTED),
  groupCreated: () => showSuccess(SuccessMessages.GROUP_CREATED),
  permissionsUpdated: () => showSuccess(SuccessMessages.PERMISSIONS_UPDATED),
  applicationCreated: () => showSuccess(SuccessMessages.APPLICATION_CREATED),
  auditExported: () => showSuccess(SuccessMessages.AUDIT_EXPORTED),
}
