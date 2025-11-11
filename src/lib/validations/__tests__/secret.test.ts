import { describe, expect, test } from '@jest/globals'
import { secretSchema, lockSecretSchema } from '../secret'

describe('Secret Validation', () => {
  describe('secretSchema', () => {
    test('should validate a valid secret', () => {
      const validSecret = {
        environmentId: 'cjld2cjxh0000qzrmn831i7rn',
        namespaceName: 'production',
        applicationId: 'cjld2cjxh0001qzrmn831i7ro',
        secretKey: 'DATABASE_URL',
        data: {
          username: 'admin',
          password: 'secure123'
        }
      }

      const result = secretSchema.safeParse(validSecret)
      expect(result.success).toBe(true)
    })

    test('should reject invalid environment ID', () => {
      const invalidSecret = {
        environmentId: 'invalid-id',
        namespaceName: 'production',
        applicationId: 'cjld2cjxh0001qzrmn831i7ro',
        secretKey: 'DATABASE_URL',
        data: {}
      }

      const result = secretSchema.safeParse(invalidSecret)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid environment ID')
      }
    })

    test('should reject invalid application ID', () => {
      const invalidSecret = {
        environmentId: 'cjld2cjxh0000qzrmn831i7rn',
        namespaceName: 'production',
        applicationId: 'invalid-id',
        secretKey: 'DATABASE_URL',
        data: {}
      }

      const result = secretSchema.safeParse(invalidSecret)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid application ID')
      }
    })

    test('should reject empty secret key', () => {
      const invalidSecret = {
        environmentId: 'cjld2cjxh0000qzrmn831i7rn',
        namespaceName: 'production',
        applicationId: 'cjld2cjxh0001qzrmn831i7ro',
        secretKey: '',
        data: {}
      }

      const result = secretSchema.safeParse(invalidSecret)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Secret key is required')
      }
    })

    test('should accept empty namespaceName', () => {
      const validSecret = {
        environmentId: 'cjld2cjxh0000qzrmn831i7rn',
        namespaceName: '',
        applicationId: 'cjld2cjxh0001qzrmn831i7ro',
        secretKey: 'API_KEY',
        data: { key: 'value' }
      }

      const result = secretSchema.safeParse(validSecret)
      expect(result.success).toBe(true)
    })

    test('should accept any data structure', () => {
      const secretWithComplexData = {
        environmentId: 'cjld2cjxh0000qzrmn831i7rn',
        namespaceName: 'production',
        applicationId: 'cjld2cjxh0001qzrmn831i7ro',
        secretKey: 'CONFIG',
        data: {
          string: 'value',
          number: 123,
          boolean: true,
          nested: {
            deep: {
              value: 'test'
            }
          },
          array: [1, 2, 3]
        }
      }

      const result = secretSchema.safeParse(secretWithComplexData)
      expect(result.success).toBe(true)
    })

    test('should reject missing required fields', () => {
      const invalidSecret = {
        environmentId: 'cjld2cjxh0000qzrmn831i7rn',
        // missing namespaceName, applicationId, secretKey, data
      }

      const result = secretSchema.safeParse(invalidSecret)
      expect(result.success).toBe(false)
    })
  })

  describe('lockSecretSchema', () => {
    test('should validate a valid lock secret request', () => {
      const validLock = {
        applicationId: 'cjld2cjxh0000qzrmn831i7rn',
        environmentId: 'cjld2cjxh0001qzrmn831i7ro',
        namespaceName: 'production',
        secretKey: 'DATABASE_URL'
      }

      const result = lockSecretSchema.safeParse(validLock)
      expect(result.success).toBe(true)
    })

    test('should reject invalid CUID', () => {
      const invalidLock = {
        applicationId: 'invalid-cuid',
        environmentId: 'cjld2cjxh0001qzrmn831i7ro',
        namespaceName: 'production',
        secretKey: 'DATABASE_URL'
      }

      const result = lockSecretSchema.safeParse(invalidLock)
      expect(result.success).toBe(false)
    })

    test('should reject empty secret key', () => {
      const invalidLock = {
        applicationId: 'cjld2cjxh0000qzrmn831i7rn',
        environmentId: 'cjld2cjxh0001qzrmn831i7ro',
        namespaceName: 'production',
        secretKey: ''
      }

      const result = lockSecretSchema.safeParse(invalidLock)
      expect(result.success).toBe(false)
    })

    test('should accept empty namespace name', () => {
      const validLock = {
        applicationId: 'cjld2cjxh0000qzrmn831i7rn',
        environmentId: 'cjld2cjxh0001qzrmn831i7ro',
        namespaceName: '',
        secretKey: 'API_KEY'
      }

      const result = lockSecretSchema.safeParse(validLock)
      expect(result.success).toBe(true)
    })

    test('should reject missing required fields', () => {
      const invalidLock = {
        applicationId: 'cjld2cjxh0000qzrmn831i7rn',
        // missing other fields
      }

      const result = lockSecretSchema.safeParse(invalidLock)
      expect(result.success).toBe(false)
    })
  })
})

