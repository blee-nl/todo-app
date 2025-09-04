import { describe, it, expect } from 'vitest'
import { validateTodoText, validateTodoId, sanitizeText } from '../validation'

describe('validation', () => {
  describe('validateTodoText', () => {
    it('should return valid for normal text', () => {
      const result = validateTodoText('Valid todo text')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return invalid for empty text', () => {
      const result = validateTodoText('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Todo text cannot be empty')
    })

    it('should return invalid for whitespace only text', () => {
      const result = validateTodoText('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Todo text cannot be empty')
    })

    it('should return invalid for text exceeding 500 characters', () => {
      const longText = 'a'.repeat(501)
      const result = validateTodoText(longText)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Todo text cannot exceed 500 characters')
    })

    it('should return valid for text with exactly 500 characters', () => {
      const text = 'a'.repeat(500)
      const result = validateTodoText(text)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('validateTodoId', () => {
    it('should return valid for valid ID', () => {
      const result = validateTodoId('valid-id-123')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return invalid for empty ID', () => {
      const result = validateTodoId('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Todo ID cannot be empty')
    })

    it('should return invalid for null ID', () => {
      const result = validateTodoId(null as any)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid todo ID')
    })

    it('should return invalid for undefined ID', () => {
      const result = validateTodoId(undefined as any)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid todo ID')
    })

    it('should return invalid for non-string ID', () => {
      const result = validateTodoId(123 as any)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid todo ID')
    })
  })

  describe('sanitizeText', () => {
    it('should trim whitespace', () => {
      const result = sanitizeText('  hello world  ')
      expect(result).toBe('hello world')
    })

    it('should replace multiple spaces with single space', () => {
      const result = sanitizeText('hello    world')
      expect(result).toBe('hello world')
    })

    it('should limit text to 500 characters', () => {
      const longText = 'a'.repeat(600)
      const result = sanitizeText(longText)
      expect(result).toHaveLength(500)
    })

    it('should handle mixed whitespace', () => {
      const result = sanitizeText('  hello   \n  world  ')
      expect(result).toBe('hello world')
    })
  })
})
