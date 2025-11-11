import {
  VaultSecret,
  VaultKVResponse,
  VaultKVMetadataResponse,
  VaultListResponse,
  VaultError,
} from "./types"

/**
 * Read a secret from KV V2 engine
 */
export async function readSecret(
  address: string,
  token: string,
  path: string,
  namespace?: string,
  version?: number
): Promise<VaultSecret | null> {
  const versionParam = version ? `?version=${version}` : ""
  const url = `${address}/v1/${path}${versionParam}`
  const headers: Record<string, string> = {
    "X-Vault-Token": token,
  }

  if (namespace) {
    headers["X-Vault-Namespace"] = namespace
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0] || "Failed to read secret")
    }

    const data: VaultKVResponse = await response.json()
    return data.data.data
  } catch (error) {
    const vaultError = error as VaultError
    vaultError.message = `Failed to read secret: ${vaultError.message}`
    throw vaultError
  }
}

/**
 * Write a secret to KV V2 engine
 */
export async function writeSecret(
  address: string,
  token: string,
  path: string,
  data: VaultSecret,
  namespace?: string,
  cas?: number
): Promise<{ version: number }> {
  const url = `${address}/v1/${path}`
  const headers: Record<string, string> = {
    "X-Vault-Token": token,
    "Content-Type": "application/json",
  }

  if (namespace) {
    headers["X-Vault-Namespace"] = namespace
  }

  const payload: any = { data }
  if (cas !== undefined) {
    payload.options = { cas }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0] || "Failed to write secret")
    }

    const result = await response.json()
    return { version: result.data.version }
  } catch (error) {
    const vaultError = error as VaultError
    vaultError.message = `Failed to write secret: ${vaultError.message}`
    throw vaultError
  }
}

/**
 * Delete latest version of a secret from KV V2 engine
 */
export async function deleteSecret(
  address: string,
  token: string,
  path: string,
  namespace?: string
): Promise<void> {
  const url = `${address}/v1/${path}`
  const headers: Record<string, string> = {
    "X-Vault-Token": token,
  }

  if (namespace) {
    headers["X-Vault-Namespace"] = namespace
  }

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0] || "Failed to delete secret")
    }
  } catch (error) {
    const vaultError = error as VaultError
    vaultError.message = `Failed to delete secret: ${vaultError.message}`
    throw vaultError
  }
}

/**
 * List secrets at a path in KV V2 engine
 */
export async function listSecrets(
  address: string,
  token: string,
  path: string,
  namespace?: string
): Promise<string[]> {
  const url = `${address}/v1/${path}?list=true`
  const headers: Record<string, string> = {
    "X-Vault-Token": token,
  }

  if (namespace) {
    headers["X-Vault-Namespace"] = namespace
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    if (response.status === 404) {
      return []
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0] || "Failed to list secrets")
    }

    const data: VaultListResponse = await response.json()
    return data.keys || []
  } catch (error) {
    const vaultError = error as VaultError
    vaultError.message = `Failed to list secrets: ${vaultError.message}`
    throw vaultError
  }
}

/**
 * Get metadata for a secret (including version history)
 */
export async function getSecretMetadata(
  address: string,
  token: string,
  metadataPath: string,
  namespace?: string
): Promise<VaultKVMetadataResponse["data"] | null> {
  const url = `${address}/v1/${metadataPath}`
  const headers: Record<string, string> = {
    "X-Vault-Token": token,
  }

  if (namespace) {
    headers["X-Vault-Namespace"] = namespace
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0] || "Failed to get metadata")
    }

    const result: VaultKVMetadataResponse = await response.json()
    return result.data
  } catch (error) {
    const vaultError = error as VaultError
    vaultError.message = `Failed to get secret metadata: ${vaultError.message}`
    throw vaultError
  }
}

/**
 * Destroy specific versions of a secret (permanently delete)
 */
export async function destroySecretVersions(
  address: string,
  token: string,
  destroyPath: string,
  versions: number[],
  namespace?: string
): Promise<void> {
  const url = `${address}/v1/${destroyPath}`
  const headers: Record<string, string> = {
    "X-Vault-Token": token,
    "Content-Type": "application/json",
  }

  if (namespace) {
    headers["X-Vault-Namespace"] = namespace
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ versions }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0] || "Failed to destroy secret versions")
    }
  } catch (error) {
    const vaultError = error as VaultError
    vaultError.message = `Failed to destroy secret versions: ${vaultError.message}`
    throw vaultError
  }
}

/**
 * Helper to construct KV V2 paths
 */
export function getKV2Paths(basePath: string, secretKey: string) {
  // basePath should be like "secret" (mount point)
  // secretKey should be like "my-app/config" (path within the mount)
  
  return {
    dataPath: `${basePath}/data/${secretKey}`,
    metadataPath: `${basePath}/metadata/${secretKey}`,
    destroyPath: `${basePath}/destroy/${secretKey}`,
  }
}



