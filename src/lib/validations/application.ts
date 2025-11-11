import { z } from "zod"

export const applicationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Name can only contain letters, numbers, hyphens, and underscores"
    ),
  vaultBasePath: z
    .string()
    .min(1, "Vault base path is required")
    .max(500, "Path must be less than 500 characters")
    .regex(
      /^[a-zA-Z0-9/_-]+$/,
      "Path can only contain letters, numbers, slashes, hyphens, and underscores"
    ),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
})

export const updateApplicationSchema = applicationSchema.partial().extend({
  id: z.string().cuid(),
})

export type ApplicationInput = z.infer<typeof applicationSchema>
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>



