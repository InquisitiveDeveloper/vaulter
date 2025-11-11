/**
 * Test suite for ChunkLoadError handling utilities
 */

import { retryDynamicImport, isChunkLoadError } from '../chunk-loader'

// Mock window.__testReload for testing
const mockReload = jest.fn()
beforeEach(() => {
  mockReload.mockClear()
  ;(window as any).__testReload = mockReload
})

afterEach(() => {
  delete (window as any).__testReload
})

describe('ChunkLoadError Utilities', () => {
  describe('isChunkLoadError', () => {
    it('should detect ChunkLoadError by name', () => {
      const error = new Error('Chunk failed to load')
      error.name = 'ChunkLoadError'

      expect(isChunkLoadError(error)).toBe(true)
    })

    it('should detect ChunkLoadError by message content', () => {
      const error = new Error('Loading chunk 123 failed')
      expect(isChunkLoadError(error)).toBe(true)
    })

    it('should detect Failed to fetch dynamically imported module', () => {
      const error = new Error('Failed to fetch dynamically imported module')
      expect(isChunkLoadError(error)).toBe(true)
    })

    it('should return false for non-chunk errors', () => {
      const error = new Error('Some other error')
      expect(isChunkLoadError(error)).toBe(false)
    })

    it('should return false for non-Error objects', () => {
      expect(isChunkLoadError('string error')).toBe(false)
      expect(isChunkLoadError(null)).toBe(false)
      expect(isChunkLoadError(undefined)).toBe(false)
    })
  })

  describe('retryDynamicImport', () => {
    let mockImportFn: jest.Mock
    let mockModule: { default: string }

    beforeEach(() => {
      mockModule = { default: 'mocked module' }
      mockImportFn = jest.fn()
      jest.clearAllMocks()
    })

    it('should successfully import on first attempt', async () => {
      mockImportFn.mockResolvedValue(mockModule)

      const result = await retryDynamicImport(mockImportFn)

      expect(result).toBe(mockModule)
      expect(mockImportFn).toHaveBeenCalledTimes(1)
    })

    it('should retry on ChunkLoadError and succeed', async () => {
      const chunkError = new Error('Loading chunk failed')
      chunkError.name = 'ChunkLoadError'

      mockImportFn
        .mockRejectedValueOnce(chunkError)
        .mockResolvedValueOnce(mockModule)

      const result = await retryDynamicImport(mockImportFn, { maxRetries: 1, retryDelay: 10 })

      expect(result).toBe(mockModule)
      expect(mockImportFn).toHaveBeenCalledTimes(2)
    })

    it('should reload page after max retries on ChunkLoadError', async () => {
      const chunkError = new Error('Loading chunk failed')
      chunkError.name = 'ChunkLoadError'

      mockImportFn.mockRejectedValue(chunkError)

      // This will hang because of the infinite promise after reload
      const promise = retryDynamicImport(mockImportFn, { maxRetries: 1, retryDelay: 10 })

      // Wait a bit for the function to execute
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockReload).toHaveBeenCalled()
      expect(mockImportFn).toHaveBeenCalledTimes(2)

      // Clean up the hanging promise
      promise.catch(() => {}) // Suppress unhandled rejection
    })

    it('should not retry on non-ChunkLoadError', async () => {
      const otherError = new Error('Some other error')
      mockImportFn.mockRejectedValue(otherError)

      await expect(retryDynamicImport(mockImportFn)).rejects.toThrow(otherError)
      expect(mockImportFn).toHaveBeenCalledTimes(1)
    })

    it('should respect custom retry options', async () => {
      const chunkError = new Error('Loading chunk failed')
      chunkError.name = 'ChunkLoadError'

      mockImportFn
        .mockRejectedValueOnce(chunkError)
        .mockRejectedValueOnce(chunkError)
        .mockResolvedValueOnce(mockModule)

      const result = await retryDynamicImport(mockImportFn, {
        maxRetries: 2,
        retryDelay: 10,
        shouldReload: false
      })

      expect(result).toBe(mockModule)
      expect(mockImportFn).toHaveBeenCalledTimes(3)
      expect(mockReload).not.toHaveBeenCalled()
    })

    it('should use default options when not provided', async () => {
      const chunkError = new Error('Loading chunk failed')
      chunkError.name = 'ChunkLoadError'

      mockImportFn.mockRejectedValue(chunkError)

      const promise = retryDynamicImport(mockImportFn)

      // Wait for the retry delay (1000ms default) plus some buffer
      await new Promise(resolve => setTimeout(resolve, 1100))

      expect(mockReload).toHaveBeenCalled()
      expect(mockImportFn).toHaveBeenCalledTimes(2) // 1 initial + 1 retry

      promise.catch(() => {}) // Suppress unhandled rejection
    })
  })
})
