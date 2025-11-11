import { prisma } from "@/lib/prisma"

export interface AuditLogData {
  userId?: string
  userEmail?: string
  action: string
  resourceType?: string
  resourceId?: string
  targetDetails?: Record<string, any>
  success: boolean
  details?: string
  clientIp?: string
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        targetDetails: data.targetDetails ? JSON.stringify(data.targetDetails) : null,
        success: data.success,
        details: data.details,
        clientIp: data.clientIp,
      },
    })
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    console.error("Failed to create audit log:", error)
  }
}

/**
 * Helper to get client IP from request
 */
export function getClientIp(request: Request): string | undefined {
  // Try various headers in order of preference
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  return undefined
}

/**
 * Create audit log from NextAuth session and request
 */
export async function auditLog(
  request: Request,
  session: { user?: { id?: string; email?: string } } | null,
  action: string,
  resourceType?: string,
  resourceId?: string,
  targetDetails?: Record<string, any>,
  success: boolean = true,
  details?: string
): Promise<void> {
  await createAuditLog({
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    action,
    resourceType,
    resourceId,
    targetDetails,
    success,
    details,
    clientIp: getClientIp(request),
  })
}



