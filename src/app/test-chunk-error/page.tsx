'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// Component that throws ChunkLoadError
function ChunkErrorComponent() {
  const error = new Error('Loading chunk failed')
  error.name = 'ChunkLoadError'
  throw error
}

// Component that throws regular error
function RegularErrorComponent() {
  throw new Error('This is a regular error')
}

export default function TestChunkErrorPage() {
  const [errorType, setErrorType] = useState<'none' | 'chunk' | 'regular' | 'dynamic'>('none')
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check URL parameters for auto-triggering errors
    const errorParam = searchParams.get('error')
    console.log('useEffect triggered, errorParam:', errorParam)
    if (errorParam === 'chunk') {
      console.log('Setting error type to chunk')
      setErrorType('chunk')
    } else if (errorParam === 'regular') {
      console.log('Setting error type to regular')
      setErrorType('regular')
    }
  }, [searchParams])

  const triggerDynamicImportError = async () => {
    try {
      // Try to dynamically import a module that doesn't exist at runtime
      await import('./non-existent-chunk-' + Date.now())
      console.log('Import succeeded')
    } catch (error) {
      console.log('Dynamic import error:', error)
      // Re-throw to trigger error boundary
      throw error
    }
  }

  // Render error components based on errorType
  if (errorType === 'chunk') {
    return <ChunkErrorComponent />
  }

  if (errorType === 'regular') {
    return <RegularErrorComponent />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          ChunkLoadError Test Page
        </h1>

        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/test-chunk-error?error=chunk'}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Trigger ChunkLoadError (ErrorBoundary)
          </button>

          <button
            onClick={() => window.location.href = '/test-chunk-error?error=regular'}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Trigger Regular Error (ErrorBoundary)
          </button>

          <button
            onClick={async () => {
              try {
                await triggerDynamicImportError()
              } catch (error) {
                // Error will be handled by error boundary
                console.log('Dynamic import error caught:', error)
              }
            }}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Trigger Dynamic Import Error
          </button>

          <button
            onClick={() => {
              setErrorType('none')
              window.location.reload()
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Reset & Reload Page
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test Instructions:</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click buttons to trigger different error types</li>
            <li>• ChunkLoadError should auto-reload the page</li>
            <li>• Regular errors show the error boundary UI</li>
            <li>• Dynamic import errors are handled by ChunkErrorHandler</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
