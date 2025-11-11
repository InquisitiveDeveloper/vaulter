import * as crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const ITERATIONS = 100000

/**
 * Get encryption key from environment variable
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set")
  }
  if (key.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters long")
  }
  return key
}

/**
 * Derive key from password using PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256")
}

/**
 * Encrypt a string value
 */
export function encrypt(text: string): string {
  try {
    const masterKey = getEncryptionKey()
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)
    
    // Derive encryption key from master key
    const key = deriveKey(masterKey, salt)
    
    // Create cipher and encrypt
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    
    // Get authentication tag
    const tag = cipher.getAuthTag()
    
    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, "hex"),
    ])
    
    // Return as base64
    return combined.toString("base64")
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

/**
 * Decrypt a string value
 */
export function decrypt(encryptedData: string): string {
  try {
    const masterKey = getEncryptionKey()
    
    // Decode from base64
    const combined = Buffer.from(encryptedData, "base64")
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH)
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const tag = combined.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    )
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
    
    // Derive decryption key
    const key = deriveKey(masterKey, salt)
    
    // Create decipher and decrypt
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8")
    decrypted += decipher.final("utf8")
    
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt data")
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require("bcryptjs")
  return await bcrypt.hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = require("bcryptjs")
  return await bcrypt.compare(password, hash)
}



