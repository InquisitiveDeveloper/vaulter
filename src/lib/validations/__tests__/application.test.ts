import { describe, expect, test } from '@jest/globals'
import { applicationSchema, updateApplicationSchema } from '../application'

describe('Application Validation', () => {
  describe('applicationSchema', () => {
    test('should validate a valid application', () => {
      const validApp = {
        name: 'my-app',
        vaultBasePath: 'secret/apps/my-app',
        description: 'My application secrets',
      }

      const result = applicationSchema.safeParse(validApp)
      expect(result.success).toBe(true)
    })

    test('should validate application without description', () => {
      const validApp = {
        name: 'my-app',
        vaultBasePath: 'secret/apps/my-app',
      }

      const result = applicationSchema.safeParse(validApp)
      expect(result.success).toBe(true)
    })

    test('should reject empty name', () => {
      const invalidApp = {
        name: '',
        vaultBasePath: 'secret/apps/my-app',
      }

      const result = applicationSchema.safeParse(invalidApp)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name is required')
      }
    })

    test('should reject name longer than 100 characters', () => {
      const invalidApp = {
        name: 'a'.repeat(101),
        vaultBasePath: 'secret/apps/my-app',
      }

      const result = applicationSchema.safeParse(invalidApp)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 100 characters')
      }
    })

    test('should reject name with invalid characters', () => {
      const invalidApps = [
        { name: 'my app', vaultBasePath: 'secret/apps/my-app' },
        { name: 'my@app', vaultBasePath: 'secret/apps/my-app' },
        { name: 'my.app', vaultBasePath: 'secret/apps/my-app' },
        { name: 'my$app', vaultBasePath: 'secret/apps/my-app' },
      ]

      invalidApps.forEach((app) => {
        const result = applicationSchema.safeParse(app)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toContain(
            'can only contain letters, numbers, hyphens, and underscores'
          )
        }
      })
    })

    test('should accept name with valid characters', () => {
      const validNames = ['my-app', 'my_app', 'MyApp123', 'app-2024_v1']

      validNames.forEach((name) => {
        const result = applicationSchema.safeParse({
          name,
          vaultBasePath: 'secret/apps/my-app',
        })
        expect(result.success).toBe(true)
      })
    })

    test('should reject empty vault base path', () => {
      const invalidApp = {
        name: 'my-app',
        vaultBasePath: '',
      }

      const result = applicationSchema.safeParse(invalidApp)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Vault base path is required')
      }
    })

    test('should reject vault path longer than 500 characters', () => {
      const invalidApp = {
        name: 'my-app',
        vaultBasePath: 'secret/' + 'a'.repeat(500),
      }

      const result = applicationSchema.safeParse(invalidApp)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 500 characters')
      }
    })

    test('should reject vault path with invalid characters', () => {
      const invalidPaths = [
        'secret/my app',
        'secret/my@app',
        'secret/my.app',
        'secret/my$app',
      ]

      invalidPaths.forEach((vaultBasePath) => {
        const result = applicationSchema.safeParse({
          name: 'my-app',
          vaultBasePath,
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.errors[0].message).toContain(
            'can only contain letters, numbers, slashes, hyphens, and underscores'
          )
        }
      })
    })

    test('should accept vault path with valid characters', () => {
      const validPaths = [
        'secret/my-app',
        'secret/my_app',
        'secret/apps/my-app/v1',
        'kv/production/app-name',
      ]

      validPaths.forEach((vaultBasePath) => {
        const result = applicationSchema.safeParse({
          name: 'my-app',
          vaultBasePath,
        })
        expect(result.success).toBe(true)
      })
    })

    test('should reject description longer than 500 characters', () => {
      const invalidApp = {
        name: 'my-app',
        vaultBasePath: 'secret/apps/my-app',
        description: 'a'.repeat(501),
      }

      const result = applicationSchema.safeParse(invalidApp)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 500 characters')
      }
    })
  })

  describe('updateApplicationSchema', () => {
    test('should validate update with id and partial fields', () => {
      const validUpdate = {
        id: 'cjld2cjxh0000qzrmn831i7rn',
        name: 'updated-app',
      }

      const result = updateApplicationSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })

    test('should require valid CUID for id', () => {
      const invalidUpdate = {
        id: 'invalid-id',
        name: 'updated-app',
      }

      const result = updateApplicationSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
    })

    test('should allow updating only description', () => {
      const validUpdate = {
        id: 'cjld2cjxh0000qzrmn831i7rn',
        description: 'Updated description',
      }

      const result = updateApplicationSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })

    test('should allow updating only vault path', () => {
      const validUpdate = {
        id: 'cjld2cjxh0000qzrmn831i7rn',
        vaultBasePath: 'secret/apps/new-path',
      }

      const result = updateApplicationSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })

    test('should require id field', () => {
      const invalidUpdate = {
        name: 'updated-app',
      }

      const result = updateApplicationSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
    })
  })
})

