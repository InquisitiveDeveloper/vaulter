import { describe, expect, test, beforeAll } from '@jest/globals'
import { encrypt, decrypt, hashPassword, verifyPassword } from '../crypto'

describe('Crypto Module', () => {
  beforeAll(() => {
    // Set encryption key for tests
    process.env.ENCRYPTION_KEY = 'test-encryption-key-that-is-at-least-32-characters-long'
  })

  describe('encrypt and decrypt', () => {
    test('should encrypt and decrypt a simple string', () => {
      const plainText = 'Hello, World!'
      const encrypted = encrypt(plainText)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plainText)
      expect(encrypted).not.toBe(plainText)
    })

    test('should encrypt and decrypt complex data', () => {
      const plainText = JSON.stringify({
        username: 'admin',
        password: 'super-secret-password',
        nested: { key: 'value' }
      })
      const encrypted = encrypt(plainText)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plainText)
      expect(JSON.parse(decrypted)).toEqual(JSON.parse(plainText))
    })

    test('should produce different encrypted values for same input', () => {
      const plainText = 'test-data'
      const encrypted1 = encrypt(plainText)
      const encrypted2 = encrypt(plainText)

      expect(encrypted1).not.toBe(encrypted2)
      expect(decrypt(encrypted1)).toBe(plainText)
      expect(decrypt(encrypted2)).toBe(plainText)
    })

    test('should handle empty strings', () => {
      const plainText = ''
      const encrypted = encrypt(plainText)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plainText)
    })

    test('should handle special characters', () => {
      const plainText = '!@#$%^&*()_+{}|:"<>?`~[];,./\\'
      const encrypted = encrypt(plainText)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plainText)
    })

    test('should handle unicode characters', () => {
      const plainText = '你好世界 🌍 émojis & spëcial çhars'
      const encrypted = encrypt(plainText)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plainText)
    })

    test('should throw error when decrypting invalid data', () => {
      expect(() => {
        decrypt('invalid-encrypted-data')
      }).toThrow('Failed to decrypt data')
    })

    test('should throw error when ENCRYPTION_KEY is not set', () => {
      const originalKey = process.env.ENCRYPTION_KEY
      delete process.env.ENCRYPTION_KEY

      expect(() => {
        encrypt('test')
      }).toThrow('Failed to encrypt data')

      process.env.ENCRYPTION_KEY = originalKey
    })

    test('should throw error when ENCRYPTION_KEY is too short', () => {
      const originalKey = process.env.ENCRYPTION_KEY
      process.env.ENCRYPTION_KEY = 'short-key'

      expect(() => {
        encrypt('test')
      }).toThrow('Failed to encrypt data')

      process.env.ENCRYPTION_KEY = originalKey
    })
  })

  describe('hashPassword and verifyPassword', () => {
    test('should hash a password', async () => {
      const password = 'MySecurePassword123!'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50) // bcrypt hashes are long
    })

    test('should verify correct password', async () => {
      const password = 'MySecurePassword123!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)

      expect(isValid).toBe(true)
    })

    test('should reject incorrect password', async () => {
      const password = 'MySecurePassword123!'
      const wrongPassword = 'WrongPassword456!'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hash)

      expect(isValid).toBe(false)
    })

    test('should produce different hashes for same password', async () => {
      const password = 'MySecurePassword123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
      expect(await verifyPassword(password, hash1)).toBe(true)
      expect(await verifyPassword(password, hash2)).toBe(true)
    })

    test('should handle empty password', async () => {
      const password = ''
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)

      expect(isValid).toBe(true)
    })

    test('should handle special characters in password', async () => {
      const password = '!@#$%^&*()_+{}|:"<>?`~[];,./\\'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)

      expect(isValid).toBe(true)
    })
  })
})

