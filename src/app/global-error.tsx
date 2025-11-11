'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Automatically handle ChunkLoadError by reloading the page
    const isChunkLoadError =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('ChunkLoadError')

    if (isChunkLoadError) {
      console.warn('ChunkLoadError detected in global error handler - reloading page...')
      // Clear any cached chunks by adding a timestamp to force fresh load
      const timestamp = Date.now()
      window.location.href = `${window.location.pathname}?chunk-retry=${timestamp}`
    }
  }, [error])

  const isChunkLoadError =
    error.name === 'ChunkLoadError' ||
    error.message?.includes('Loading chunk') ||
    error.message?.includes('Failed to fetch dynamically imported module') ||
    error.message?.includes('ChunkLoadError')

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="text-slate-400 mb-4">{error.message}</p>
          {isChunkLoadError ? (
            <div className="text-center space-y-4">
              <p className="text-yellow-400 mb-4">
                Chunk loading error detected. Reloading page automatically...
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700 transition-colors"
              >
                Reload Now
              </button>
            </div>
          ) : (
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700 transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </body>
    </html>
  )
}

