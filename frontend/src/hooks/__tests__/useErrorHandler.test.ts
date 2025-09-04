import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useErrorHandler } from '../useErrorHandler'

describe('useErrorHandler', () => {
  it('should initialize with no error', () => {
    const { result } = renderHook(() => useErrorHandler())
    
    expect(result.current.currentError).toBeNull()
  })

  it('should handle error and set current error', () => {
    const { result } = renderHook(() => useErrorHandler())
    const testError = new Error('Test error')
    
    act(() => {
      result.current.handleError(testError)
    })
    
    expect(result.current.currentError).toEqual({
      message: 'Test error',
      code: undefined,
      status: undefined,
    })
  })

  it('should call custom onError callback', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useErrorHandler({ onError }))
    const testError = new Error('Test error')
    
    act(() => {
      result.current.handleError(testError)
    })
    
    expect(onError).toHaveBeenCalledWith({
      message: 'Test error',
      code: undefined,
      status: undefined,
    })
  })

  it('should clear error', () => {
    const { result } = renderHook(() => useErrorHandler())
    const testError = new Error('Test error')
    
    act(() => {
      result.current.handleError(testError)
    })
    
    expect(result.current.currentError).not.toBeNull()
    
    act(() => {
      result.current.clearError()
    })
    
    expect(result.current.currentError).toBeNull()
  })

  it('should retry operation and clear error', () => {
    const { result } = renderHook(() => useErrorHandler())
    const testError = new Error('Test error')
    const retryFn = vi.fn()
    
    act(() => {
      result.current.handleError(testError)
    })
    
    expect(result.current.currentError).not.toBeNull()
    
    act(() => {
      result.current.retryOperation(retryFn)
    })
    
    expect(result.current.currentError).toBeNull()
    expect(retryFn).toHaveBeenCalled()
  })

  it('should handle axios error with status', () => {
    const { result } = renderHook(() => useErrorHandler())
    const axiosError = {
      response: { status: 404 },
      message: 'Not found'
    }
    
    act(() => {
      result.current.handleError(axiosError)
    })
    
    expect(result.current.currentError).toEqual({
      message: 'Not found',
      code: '404',
      status: 404,
    })
  })
})
