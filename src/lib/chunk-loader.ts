/**
 * Utility for handling dynamic imports with automatic retry on ChunkLoadError
 * 
 * This helps prevent ChunkLoadError issues during deployments by:
 * 1. Detecting chunk load failures
 * 2. Automatically reloading the page to fetch the latest chunks
 * 
 * Based on community best practices from:
 * - https://stackoverflow.com/questions/67652612
 * - https://dev.to/ianwalter/fixing-chunkloaderror-3791
 */

interface ImportRetryOptions {
  maxRetries?: number
  retryDelay?: number
  shouldReload?: boolean
}

/**
 * Wraps a dynamic import with automatic retry logic for ChunkLoadError
 * 
 * @param importFn - Function that returns a dynamic import promise
 * @param options - Configuration options for retry behavior
 * @returns Promise that resolves to the imported module
 * 
 * @example
 * ```tsx
 * const Component = lazy(() => 
 *   retryDynamicImport(() => import('./MyComponent'))
 * )
 * ```
 */
export async function retryDynamicImport<T>(
  importFn: () => Promise<T>,
  options: ImportRetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 1,
    retryDelay = 1000,
    shouldReload = true
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await importFn()
    } catch (error) {
      lastError = error as Error
      const isChunkLoadError =
        error instanceof Error &&
        (error.name === 'ChunkLoadError' ||
         error.message?.includes('Loading chunk') ||
         error.message?.includes('Failed to fetch'))

      if (isChunkLoadError) {
        console.warn(
          `ChunkLoadError detected on attempt ${attempt + 1}/${maxRetries + 1}`,
          error
        )

        // On final retry, reload the page to get fresh chunks
        if (attempt === maxRetries && shouldReload) {
          console.warn('Max retries reached - reloading page to fetch latest chunks...')
          if (typeof window !== 'undefined') {
            // Force cache-busting reload by adding timestamp parameter
            const url = new URL(window.location.href)
            url.searchParams.set('chunk-reload', Date.now().toString())
            // Allow for testing by using a global reload function if available
            if ((window as any).__testReload) {
              (window as any).__testReload()
            } else {
              window.location.href = url.toString()
            }
          }
          // Wait indefinitely as page will reload
          await new Promise(() => {})
        }

        // Wait before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      } else {
        // Not a chunk load error, throw immediately
        throw error
      }
    }
  }

  // This should never be reached due to the reload, but TypeScript needs it
  throw lastError || new Error('Import failed')
}

/**
 * Detects if the current error is a ChunkLoadError
 */
export function isChunkLoadError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'ChunkLoadError' ||
     error.message?.includes('Loading chunk') ||
     error.message?.includes('Failed to fetch dynamically imported module'))
  )
}





