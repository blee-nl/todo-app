import { describe, it, expect } from 'vitest'
import { 
  getErrorMessage, 
  getErrorCode, 
  isNetworkError, 
  isClientError, 
  isServerError, 
  createAppError 
} from '../errorUtils'

describe('errorUtils', () => {
  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message')
      expect(getErrorMessage(error)).toBe('Test error message')
    })

    it('should return string as is', () => {
      expect(getErrorMessage('String error')).toBe('String error')
    })

    it('should extract message from object with message property', () => {
      const error = { message: 'Object error message' }
      expect(getErrorMessage(error)).toBe('Object error message')
    })

    it('should return default message for unknown error types', () => {
      const error = { someProperty: 'value' }
      expect(getErrorMessage(error)).toBe('An unexpected error occurred')
    })

    it('should handle null and undefined', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred')
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred')
    })
  })

  describe('getErrorCode', () => {
    it('should extract status code from axios error', () => {
      const error = {
        response: { status: 404 }
      }
      expect(getErrorCode(error)).toBe('404')
    })

    it('should extract code from error object', () => {
      const error = { code: 'NETWORK_ERROR' }
      expect(getErrorCode(error)).toBe('NETWORK_ERROR')
    })

    it('should return undefined for errors without code', () => {
      const error = { message: 'Some error' }
      expect(getErrorCode(error)).toBeUndefined()
    })
  })

  describe('isNetworkError', () => {
    it('should return true for network error codes', () => {
      const error = { code: 'NETWORK_ERROR' }
      expect(isNetworkError(error)).toBe(true)
    })

    it('should return true for ECONNABORTED error', () => {
      const error = { code: 'ECONNABORTED' }
      expect(isNetworkError(error)).toBe(true)
    })

    it('should return true for network-related messages', () => {
      const error = { message: 'Network Error occurred' }
      expect(isNetworkError(error)).toBe(true)
    })

    it('should return true for timeout messages', () => {
      const error = { message: 'Request timeout' }
      expect(isNetworkError(error)).toBe(true)
    })

    it('should return false for other errors', () => {
      const error = { message: 'Validation error' }
      expect(isNetworkError(error)).toBe(false)
    })
  })

  describe('isClientError', () => {
    it('should return true for 4xx status codes', () => {
      const error = { response: { status: 400 } }
      expect(isClientError(error)).toBe(true)
    })

    it('should return true for 404 status code', () => {
      const error = { response: { status: 404 } }
      expect(isClientError(error)).toBe(true)
    })

    it('should return false for 3xx status codes', () => {
      const error = { response: { status: 300 } }
      expect(isClientError(error)).toBe(false)
    })

    it('should return false for 5xx status codes', () => {
      const error = { response: { status: 500 } }
      expect(isClientError(error)).toBe(false)
    })

    it('should return false for errors without response', () => {
      const error = { message: 'Some error' }
      expect(isClientError(error)).toBe(false)
    })
  })

  describe('isServerError', () => {
    it('should return true for 5xx status codes', () => {
      const error = { response: { status: 500 } }
      expect(isServerError(error)).toBe(true)
    })

    it('should return true for 503 status code', () => {
      const error = { response: { status: 503 } }
      expect(isServerError(error)).toBe(true)
    })

    it('should return false for 4xx status codes', () => {
      const error = { response: { status: 400 } }
      expect(isServerError(error)).toBe(false)
    })

    it('should return false for errors without response', () => {
      const error = { message: 'Some error' }
      expect(isServerError(error)).toBe(false)
    })
  })

  describe('createAppError', () => {
    it('should create standardized error object from Error', () => {
      const error = new Error('Test error')
      const result = createAppError(error)
      expect(result.message).toBe('Test error')
      expect(result.code).toBeUndefined()
      expect(result.status).toBeUndefined()
    })

    it('should create error object with status from axios error', () => {
      const error = {
        response: { status: 404 },
        message: 'Not found'
      }
      const result = createAppError(error)
      expect(result.message).toBe('Not found')
      expect(result.status).toBe(404)
    })

    it('should handle string errors', () => {
      const result = createAppError('String error')
      expect(result.message).toBe('String error')
    })
  })
})
