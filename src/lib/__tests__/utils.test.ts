import { describe, expect, test } from '@jest/globals'
import { cn } from '../utils'

describe('Utils Module', () => {
  describe('cn function', () => {
    test('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    test('should handle conditional classes', () => {
      const result = cn('class1', false && 'class2', true && 'class3')
      expect(result).toBe('class1 class3')
    })

    test('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    test('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    test('should handle objects with boolean values', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true
      })
      expect(result).toContain('class1')
      expect(result).toContain('class3')
      expect(result).not.toContain('class2')
    })

    test('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    test('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })

    test('should handle complex Tailwind merge scenarios', () => {
      const result = cn(
        'bg-red-500 text-white',
        'bg-blue-500',
        'hover:bg-green-500'
      )
      expect(result).toContain('text-white')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('hover:bg-green-500')
      expect(result).not.toContain('bg-red-500')
    })
  })
})

