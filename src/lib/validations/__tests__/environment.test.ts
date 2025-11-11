import { describe, expect, test } from '@jest/globals'
import { environmentSchema, namespaceSchema } from '../environment'

describe('Environment Validation', () => {
  describe('environmentSchema', () => {
    test('should validate a valid environment with userpass auth', () => {
      const validEnv = {
        name: 'production',
        description: 'Production environment',
        vaultAddress: 'https://vault.example.com',
        vaultAuthType: 'userpass' as const,
        vaultUserId: 'admin',
        vaultPassword: 'secure-password',
        vaultTokenTTL: 3600,
      }

      const result = environmentSchema.safeParse(validEnv)
      expect(result.success).toBe(true)
    })

    test('should validate environment with token auth', () => {
      const validEnv = {
        name: 'development',
        vaultAddress: 'http://localhost:8200',
        vaultAuthType: 'token' as const,
      }

      const result = environmentSchema.safeParse(validEnv)
      expect(result.success).toBe(true)
    })

    test('should validate environment with approle auth', () => {
      const validEnv = {
        name: 'staging',
        vaultAddress: 'https://vault-staging.example.com',
        vaultAuthType: 'approle' as const,
      }

      const result = environmentSchema.safeParse(validEnv)
      expect(result.success).toBe(true)
    })

    test('should reject empty name', () => {
      const invalidEnv = {
        name: '',
        vaultAddress: 'https://vault.example.com',
        vaultAuthType: 'token' as const,
      }

      const result = environmentSchema.safeParse(invalidEnv)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name is required')
      }
    })

    test('should reject name longer than 100 characters', () => {
      const invalidEnv = {
        name: 'a'.repeat(101),
        vaultAddress: 'https://vault.example.com',
        vaultAuthType: 'token' as const,
      }

      const result = environmentSchema.safeParse(invalidEnv)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 100 characters')
      }
    })

    test('should reject name with invalid characters', () => {
      const invalidNames = ['prod env', 'prod@env', 'prod.env', 'prod$env']

      invalidNames.forEach((name) => {
        const result = environmentSchema.safeParse({
          name,
          vaultAddress: 'https://vault.example.com',
          vaultAuthType: 'token' as const,
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toContain(
            'can only contain letters, numbers, hyphens, and underscores'
          )
        }
      })
    })

    test('should accept name with valid characters', () => {
      const validNames = ['production', 'prod-env', 'prod_env', 'Prod2024']

      validNames.forEach((name) => {
        const result = environmentSchema.safeParse({
          name,
          vaultAddress: 'https://vault.example.com',
          vaultAuthType: 'token' as const,
        })
        expect(result.success).toBe(true)
      })
    })

    test('should reject invalid vault address URL', () => {
      const invalidAddresses = [
        'not-a-url',
        'vault.example.com',
        'ftp://vault.example.com',
      ]

      invalidAddresses.forEach((vaultAddress) => {
        const result = environmentSchema.safeParse({
          name: 'production',
          vaultAddress,
          vaultAuthType: 'token' as const,
        })
        expect(result.success).toBe(false)
      })
    })

    test('should accept valid vault addresses', () => {
      const validAddresses = [
        'http://localhost:8200',
        'https://vault.example.com',
        'https://vault.example.com:8200',
        'https://127.0.0.1:8200',
      ]

      validAddresses.forEach((vaultAddress) => {
        const result = environmentSchema.safeParse({
          name: 'production',
          vaultAddress,
          vaultAuthType: 'token' as const,
        })
        expect(result.success).toBe(true)
      })
    })

    test('should reject invalid auth type', () => {
      const invalidEnv = {
        name: 'production',
        vaultAddress: 'https://vault.example.com',
        vaultAuthType: 'invalid-auth',
      }

      const result = environmentSchema.safeParse(invalidEnv)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid auth type')
      }
    })

    test('should reject description longer than 500 characters', () => {
      const invalidEnv = {
        name: 'production',
        description: 'a'.repeat(501),
        vaultAddress: 'https://vault.example.com',
        vaultAuthType: 'token' as const,
      }

      const result = environmentSchema.safeParse(invalidEnv)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 500 characters')
      }
    })

    test('should reject negative TTL', () => {
      const invalidEnv = {
        name: 'production',
        vaultAddress: 'https://vault.example.com',
        vaultAuthType: 'token' as const,
        vaultTokenTTL: -100,
      }

      const result = environmentSchema.safeParse(invalidEnv)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('TTL must be positive')
      }
    })

    test('should accept TTL as string and convert to number', () => {
      const validEnv = {
        name: 'production',
        vaultAddress: 'https://vault.example.com',
        vaultAuthType: 'token' as const,
        vaultTokenTTL: '3600',
      }

      const result = environmentSchema.safeParse(validEnv)
      expect(result.success).toBe(true)
    })
  })

  describe('namespaceSchema', () => {
    test('should validate a valid namespace', () => {
      const validNamespace = {
        name: 'production/team-a',
        environmentId: 'cjld2cjxh0000qzrmn831i7rn',
      }

      const result = namespaceSchema.safeParse(validNamespace)
      expect(result.success).toBe(true)
    })

    test('should reject empty namespace name', () => {
      const invalidNamespace = {
        name: '',
        environmentId: 'cjld2cjxh0000qzrmn831i7rn',
      }

      const result = namespaceSchema.safeParse(invalidNamespace)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Namespace name is required')
      }
    })

    test('should reject namespace name longer than 200 characters', () => {
      const invalidNamespace = {
        name: 'a'.repeat(201),
        environmentId: 'cjld2cjxh0000qzrmn831i7rn',
      }

      const result = namespaceSchema.safeParse(invalidNamespace)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 200 characters')
      }
    })

    test('should reject invalid environment ID', () => {
      const invalidNamespace = {
        name: 'production',
        environmentId: 'invalid-id',
      }

      const result = namespaceSchema.safeParse(invalidNamespace)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid environment ID')
      }
    })
  })
})

