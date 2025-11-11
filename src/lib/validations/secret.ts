import { z } from "zod"

export const secretSchema = z.object({
  environmentId: z.string().cuid("Invalid environment ID"),
  namespaceName: z.string(),
  applicationId: z.string().cuid("Invalid application ID"),
  secretKey: z.string().min(1, "Secret key is required"),
  data: z.record(z.string(), z.any()),
})

export const lockSecretSchema = z.object({
  applicationId: z.string().cuid(),
  environmentId: z.string().cuid(),
  namespaceName: z.string(),
  secretKey: z.string().min(1),
})

export type SecretInput = z.infer<typeof secretSchema>
export type LockSecretInput = z.infer<typeof lockSecretSchema>



