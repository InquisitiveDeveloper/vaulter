import { z } from "zod"

export const environmentSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "Name can only contain letters, numbers, hyphens, and underscores"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  vaultAddress: z
    .string()
    .url("Must be a valid URL")
    .regex(/^https?:\/\//, "Must start with http:// or https://"),
  vaultAuthType: z.enum(["userpass", "approle", "token"], {
    errorMap: () => ({ message: "Invalid auth type" }),
  }),
  vaultUserId: z
    .string()
    .min(1, "User ID is required for userpass authentication")
    .optional(),
  vaultPassword: z
    .string()
    .min(1, "Password is required for userpass authentication")
    .optional(),
  vaultTokenTTL: z
    .number()
    .int()
    .positive("TTL must be positive")
    .optional()
    .or(z.string().transform((val) => (val ? parseInt(val, 10) : undefined)))
    .optional(),
})

export const updateEnvironmentSchema = environmentSchema.partial().extend({
  id: z.string().cuid(),
})

export const namespaceSchema = z.object({
  name: z
    .string()
    .min(1, "Namespace name is required")
    .max(200, "Namespace name must be less than 200 characters"),
  environmentId: z.string().cuid("Invalid environment ID"),
})

export const updateNamespaceSchema = namespaceSchema.partial().extend({
  id: z.string().cuid(),
})

export type EnvironmentInput = z.infer<typeof environmentSchema>
export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>
export type NamespaceInput = z.infer<typeof namespaceSchema>
export type UpdateNamespaceInput = z.infer<typeof updateNamespaceSchema>



