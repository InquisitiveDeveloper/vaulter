'use client'

import { useEffect } from 'react'

/**
 * Client-side component that handles ChunkLoadError at the earliest possible moment
 * This catches errors that occur before React ErrorBoundary can handle them
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    // Handle global errors for chunk loading failures
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message || ''
      const isChunkLoadError =
        error &&
        (error.toString().includes('ChunkLoadError') ||
          error.toString().includes('Loading chunk') ||
          error.toString().includes('Failed to fetch dynamically imported module'))

      if (isChunkLoadError) {
        console.warn('ChunkLoadError detected in error handler - reloading page...')
        event.preventDefault()
        const url = new URL(window.location.href)
        url.searchParams.set('chunk-retry', Date.now().toString())
        window.location.href = url.toString()
      }
    }

    // Handle unhandled promise rejections for chunk loading
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason || ''
      const isChunkLoadError =
        error &&
        (error.toString().includes('ChunkLoadError') ||
          error.toString().includes('Loading chunk') ||
          error.toString().includes('Failed to fetch dynamically imported module'))

      if (isChunkLoadError) {
        console.warn('ChunkLoadError in promise rejection - reloading page...')
        event.preventDefault()
        const url = new URL(window.location.href)
        url.searchParams.set('chunk-retry', Date.now().toString())
        window.location.href = url.toString()
      }
    }

    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
