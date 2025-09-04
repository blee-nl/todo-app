import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLoadingState } from '../useLoadingState'

describe('useLoadingState', () => {
  it('should initialize with loading false', () => {
    const { result } = renderHook(() => useLoadingState())
    
    expect(result.current.isLoading).toBe(false)
  })

  it('should start loading', () => {
    const { result } = renderHook(() => useLoadingState())
    
    act(() => {
      result.current.startLoading()
    })
    
    expect(result.current.isLoading).toBe(true)
  })

  it('should stop loading', () => {
    const { result } = renderHook(() => useLoadingState())
    
    act(() => {
      result.current.startLoading()
    })
    
    expect(result.current.isLoading).toBe(true)
    
    act(() => {
      result.current.stopLoading()
    })
    
    expect(result.current.isLoading).toBe(false)
  })

  it('should execute async function with loading state', async () => {
    const { result } = renderHook(() => useLoadingState())
    const asyncFn = vi.fn().mockResolvedValue('success')
    
    let promise: Promise<string>
    act(() => {
      promise = result.current.withLoading(asyncFn)
    })
    
    expect(result.current.isLoading).toBe(true)
    
    await act(async () => {
      await promise!
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(asyncFn).toHaveBeenCalled()
  })

  it('should handle async function errors and still stop loading', async () => {
    const { result } = renderHook(() => useLoadingState())
    const asyncFn = vi.fn().mockRejectedValue(new Error('Test error'))
    
    let promise: Promise<never>
    act(() => {
      promise = result.current.withLoading(asyncFn)
    })
    
    expect(result.current.isLoading).toBe(true)
    
    await act(async () => {
      try {
        await promise!
      } catch (error) {
        // Expected error
      }
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(asyncFn).toHaveBeenCalled()
  })

  it('should return result from async function', async () => {
    const { result } = renderHook(() => useLoadingState())
    const asyncFn = vi.fn().mockResolvedValue('test result')
    
    let promise: Promise<string>
    act(() => {
      promise = result.current.withLoading(asyncFn)
    })
    
    const asyncResult = await act(async () => {
      return await promise!
    })
    
    expect(asyncResult).toBe('test result')
  })
})
