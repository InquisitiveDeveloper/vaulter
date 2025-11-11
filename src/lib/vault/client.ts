import { VaultConfig, VaultSecret } from "./types"
import { getVaultToken, verifyToken } from "./auth"
import {
  readSecret,
  writeSecret,
  deleteSecret,
  listSecrets,
  getSecretMetadata,
  destroySecretVersions,
  getKV2Paths,
} from "./kv"

// Token cache to avoid re-authenticating for every request
interface TokenCache {
  token: string
  expiresAt: number
}

const tokenCache = new Map<string, TokenCache>()

/**
 * Get cache key for a Vault configuration
 */
function getCacheKey(config: VaultConfig): string {
  return `${config.address}:${config.authType}:${config.userId || config.roleId || "token"}:${config.namespace || "default"}`
}

/**
 * Get a valid Vault token, using cache if available
 */
async function getToken(config: VaultConfig): Promise<string> {
  const cacheKey = getCacheKey(config)
  const cached = tokenCache.get(cacheKey)

  // Check if we have a valid cached token
  if (cached && cached.expiresAt > Date.now()) {
    // Verify token is still valid
    const isValid = await verifyToken(config.address, cached.token, config.namespace)
    if (isValid) {
      return cached.token
    }
    // Token is invalid, remove from cache
    tokenCache.delete(cacheKey)
  }

  // Get new token
  const token = await getVaultToken(config)

  // Cache the token (default TTL: 1 hour, or use config value)
  const ttl = (config.tokenTTL || 3600) * 1000
  tokenCache.set(cacheKey, {
    token,
    expiresAt: Date.now() + ttl - 60000, // Subtract 1 minute for safety margin
  })

  return token
}

/**
 * Vault client class with token management
 */
export class VaultClient {
  private config: VaultConfig

  constructor(config: VaultConfig) {
    this.config = config
  }

  /**
   * Test connection to Vault
   */
  async testConnection(): Promise<boolean> {
    try {
      const token = await getToken(this.config)
      return await verifyToken(this.config.address, token, this.config.namespace)
    } catch (error) {
      console.error("Vault connection test failed:", error)
      return false
    }
  }

  /**
   * Read a secret
   */
  async readSecret(
    mountPoint: string,
    secretPath: string,
    version?: number
  ): Promise<VaultSecret | null> {
    const token = await getToken(this.config)
    const { dataPath } = getKV2Paths(mountPoint, secretPath)
    return readSecret(
      this.config.address,
      token,
      dataPath,
      this.config.namespace,
      version
    )
  }

  /**
   * Write a secret
   */
  async writeSecret(
    mountPoint: string,
    secretPath: string,
    data: VaultSecret,
    cas?: number
  ): Promise<{ version: number }> {
    const token = await getToken(this.config)
    const { dataPath } = getKV2Paths(mountPoint, secretPath)
    return writeSecret(
      this.config.address,
      token,
      dataPath,
      data,
      this.config.namespace,
      cas
    )
  }

  /**
   * Delete a secret (soft delete)
   */
  async deleteSecret(mountPoint: string, secretPath: string): Promise<void> {
    const token = await getToken(this.config)
    const { dataPath } = getKV2Paths(mountPoint, secretPath)
    return deleteSecret(
      this.config.address,
      token,
      dataPath,
      this.config.namespace
    )
  }

  /**
   * List secrets at a path
   */
  async listSecrets(mountPoint: string, path?: string): Promise<string[]> {
    const token = await getToken(this.config)
    const listPath = path ? `${mountPoint}/metadata/${path}` : `${mountPoint}/metadata`
    return listSecrets(
      this.config.address,
      token,
      listPath,
      this.config.namespace
    )
  }

  /**
   * Get secret metadata including version history
   */
  async getMetadata(mountPoint: string, secretPath: string) {
    const token = await getToken(this.config)
    const { metadataPath } = getKV2Paths(mountPoint, secretPath)
    return getSecretMetadata(
      this.config.address,
      token,
      metadataPath,
      this.config.namespace
    )
  }

  /**
   * Permanently destroy secret versions
   */
  async destroyVersions(
    mountPoint: string,
    secretPath: string,
    versions: number[]
  ): Promise<void> {
    const token = await getToken(this.config)
    const { destroyPath } = getKV2Paths(mountPoint, secretPath)
    return destroySecretVersions(
      this.config.address,
      token,
      destroyPath,
      versions,
      this.config.namespace
    )
  }
}

/**
 * Create a Vault client from database environment configuration
 */
export async function createVaultClientFromEnv(env: {
  vaultAddress: string
  vaultAuthType: string
  vaultUserId?: string | null
  vaultPassword?: string | null
  vaultTokenTTL?: number | null
  namespace?: string
}): Promise<VaultClient> {
  const config: VaultConfig = {
    address: env.vaultAddress,
    authType: env.vaultAuthType as "userpass" | "approle" | "token",
    userId: env.vaultUserId || undefined,
    password: env.vaultPassword || undefined,
    namespace: env.namespace,
    tokenTTL: env.vaultTokenTTL || undefined,
  }

  return new VaultClient(config)
}

/**
 * Clear token cache (useful for logout or when credentials change)
 */
export function clearTokenCache(config?: VaultConfig) {
  if (config) {
    tokenCache.delete(getCacheKey(config))
  } else {
    tokenCache.clear()
  }
}



