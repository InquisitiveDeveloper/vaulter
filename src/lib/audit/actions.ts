// Audit action constants

// Authentication actions
export const AUTH_LOGIN = "AUTH_LOGIN"
export const AUTH_LOGOUT = "AUTH_LOGOUT"
export const AUTH_FAILED = "AUTH_FAILED"

// Environment actions
export const ENVIRONMENT_CREATE = "ENVIRONMENT_CREATE"
export const ENVIRONMENT_UPDATE = "ENVIRONMENT_UPDATE"
export const ENVIRONMENT_DELETE = "ENVIRONMENT_DELETE"
export const ENVIRONMENT_TEST_CONNECTION = "ENVIRONMENT_TEST_CONNECTION"

// Namespace actions
export const NAMESPACE_CREATE = "NAMESPACE_CREATE"
export const NAMESPACE_UPDATE = "NAMESPACE_UPDATE"
export const NAMESPACE_DELETE = "NAMESPACE_DELETE"

// Application actions
export const APPLICATION_CREATE = "APPLICATION_CREATE"
export const APPLICATION_UPDATE = "APPLICATION_UPDATE"
export const APPLICATION_DELETE = "APPLICATION_DELETE"

// Secret actions
export const SECRET_CREATE = "SECRET_CREATE"
export const SECRET_READ = "SECRET_READ"
export const SECRET_UPDATE = "SECRET_UPDATE"
export const SECRET_DELETE = "SECRET_DELETE"
export const SECRET_LOCK = "SECRET_LOCK"
export const SECRET_UNLOCK = "SECRET_UNLOCK"
export const SECRET_VIEW_VERSION = "SECRET_VIEW_VERSION"

// Bulk secret actions
export const SECRET_COMPARE = "SECRET_COMPARE"
export const SECRET_COPY = "SECRET_COPY"
export const SECRET_BULK_COPY = "SECRET_BULK_COPY"
export const SECRET_IMPORT = "SECRET_IMPORT"
export const SECRET_EXPORT = "SECRET_EXPORT"

// Group actions
export const GROUP_CREATE = "GROUP_CREATE"
export const GROUP_UPDATE = "GROUP_UPDATE"
export const GROUP_DELETE = "GROUP_DELETE"
export const GROUP_ADD_USER = "GROUP_ADD_USER"
export const GROUP_REMOVE_USER = "GROUP_REMOVE_USER"

// Permission actions
export const PERMISSION_GRANT = "PERMISSION_GRANT"
export const PERMISSION_REVOKE = "PERMISSION_REVOKE"
export const PERMISSION_UPDATE = "PERMISSION_UPDATE"

// Resource types
export const RESOURCE_ENVIRONMENT = "Environment"
export const RESOURCE_NAMESPACE = "Namespace"
export const RESOURCE_APPLICATION = "Application"
export const RESOURCE_SECRET = "Secret"
export const RESOURCE_GROUP = "Group"
export const RESOURCE_PERMISSION = "Permission"
export const RESOURCE_USER = "User"



