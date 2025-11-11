export interface VaultConfig {
  address: string
  authType: "userpass" | "approle" | "token"
  userId?: string
  password?: string
  roleId?: string
  secretId?: string
  token?: string
  namespace?: string
  tokenTTL?: number
}

export interface VaultSecret {
  [key: string]: any
}

export interface VaultSecretMetadata {
  created_time: string
  custom_metadata: Record<string, string> | null
  deletion_time: string
  destroyed: boolean
  version: number
}

export interface VaultSecretVersion {
  data: VaultSecret
  metadata: VaultSecretMetadata
}

export interface VaultListResponse {
  keys: string[]
}

export interface VaultKVResponse {
  data: {
    data: VaultSecret
    metadata: VaultSecretMetadata
  }
}

export interface VaultKVMetadataResponse {
  data: {
    cas_required: boolean
    created_time: string
    current_version: number
    delete_version_after: string
    max_versions: number
    oldest_version: number
    updated_time: string
    versions: Record<
      string,
      {
        created_time: string
        deletion_time: string
        destroyed: boolean
      }
    >
  }
}

export interface VaultAuthResponse {
  client_token: string
  accessor: string
  policies: string[]
  token_policies: string[]
  metadata: Record<string, any>
  lease_duration: number
  renewable: boolean
  entity_id: string
  token_type: string
}

export interface VaultError extends Error {
  statusCode?: number
  response?: any
}



