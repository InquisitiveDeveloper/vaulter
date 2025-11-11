import { VaultConfig, VaultAuthResponse, VaultError } from "./types"

/**
 * Authenticate with Vault using userpass method
 */
export async function authenticateUserpass(
  config: VaultConfig
): Promise<VaultAuthResponse> {
  if (!config.userId || !config.password) {
    throw new Error("User ID and password are required for userpass authentication")
  }

  const url = `${config.address}/v1/auth/userpass/login/${config.userId}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (config.namespace) {
    headers["X-Vault-Namespace"] = config.namespace
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ password: config.password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0] || "Authentication failed")
    }

    const data = await response.json()
    return data.auth
  } catch (error) {
    const vaultError = error as VaultError
    vaultError.message = `Vault authentication failed: ${vaultError.message}`
    throw vaultError
  }
}

/**
 * Authenticate with Vault using AppRole method
 */
export async function authenticateAppRole(
  config: VaultConfig
): Promise<VaultAuthResponse> {
  if (!config.roleId || !config.secretId) {
    throw new Error("Role ID and Secret ID are required for approle authentication")
  }

  const url = `${config.address}/v1/auth/approle/login`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (config.namespace) {
    headers["X-Vault-Namespace"] = config.namespace
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        role_id: config.roleId,
        secret_id: config.secretId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0] || "Authentication failed")
    }

    const data = await response.json()
    return data.auth
  } catch (error) {
    const vaultError = error as VaultError
    vaultError.message = `Vault authentication failed: ${vaultError.message}`
    throw vaultError
  }
}

/**
 * Get Vault token based on auth type
 */
export async function getVaultToken(config: VaultConfig): Promise<string> {
  switch (config.authType) {
    case "userpass":
      const userpassAuth = await authenticateUserpass(config)
      return userpassAuth.client_token

    case "approle":
      const approleAuth = await authenticateAppRole(config)
      return approleAuth.client_token

    case "token":
      if (!config.token) {
        throw new Error("Token is required for token authentication")
      }
      return config.token

    default:
      throw new Error(`Unsupported auth type: ${config.authType}`)
  }
}

/**
 * Verify Vault token is valid
 */
export async function verifyToken(
  address: string,
  token: string,
  namespace?: string
): Promise<boolean> {
  const url = `${address}/v1/auth/token/lookup-self`
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

    return response.ok
  } catch (error) {
    return false
  }
}



