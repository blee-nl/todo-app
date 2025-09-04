import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import type { ReactNode } from 'react'
import { mockTodos } from '../../test/utils'

// Mock the API
vi.mock('../../services/api', () => ({
  todoApi: {
    getAllTodos: vi.fn().mockResolvedValue(mockTodos),
    getTodosByStatus: vi.fn().mockImplementation((completed) => {
      if (completed === true) return Promise.resolve([mockTodos[1]])
      if (completed === false) return Promise.resolve([mockTodos[0]])
      return Promise.resolve(mockTodos)
    }),
    getTodoById: vi.fn().mockImplementation((id) => {
      const todo = mockTodos.find(t => t.id === id)
      if (!todo) throw new Error('Todo not found')
      return Promise.resolve(todo)
    }),
    createTodo: vi.fn().mockResolvedValue({
      id: '3',
      text: 'New todo',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    updateTodo: vi.fn().mockResolvedValue({
      ...mockTodos[0],
      text: 'Updated text',
      updatedAt: new Date().toISOString(),
    }),
    toggleTodo: vi.fn().mockResolvedValue({
      ...mockTodos[0],
      completed: true,
      updatedAt: new Date().toISOString(),
    }),
    deleteTodo: vi.fn().mockResolvedValue({ id: '1' }),
    deleteCompletedTodos: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  }
}))

// Import the hooks after mocking
import { useTodos, useTodosByStatus, useTodo, useCreateTodo, useUpdateTodo, useToggleTodo, useDeleteTodo, useDeleteCompletedTodos } from '../useTodos'

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useTodos hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useTodos', () => {
    it('should fetch all todos', async () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockTodos)
      expect(result.current.error).toBeNull()
    })
  })

  describe('useTodosByStatus', () => {
    it('should fetch active todos', async () => {
      const { result } = renderHook(() => useTodosByStatus(false), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual([mockTodos[0]])
    })

    it('should fetch completed todos', async () => {
      const { result } = renderHook(() => useTodosByStatus(true), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual([mockTodos[1]])
    })

    it('should fetch all todos when no status provided', async () => {
      const { result } = renderHook(() => useTodosByStatus(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockTodos)
    })
  })

  describe('useTodo', () => {
    it('should fetch single todo by ID', async () => {
      const { result } = renderHook(() => useTodo('1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockTodos[0])
    })

    it('should not fetch when ID is invalid', () => {
      const { result } = renderHook(() => useTodo(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('useCreateTodo', () => {
    it('should create new todo', async () => {
      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      })

      const newTodo = await result.current.mutateAsync({ text: 'New todo' })
      
      expect(newTodo.text).toBe('New todo')
      expect(newTodo.id).toBe('3')
    })

    it('should validate todo text before creating', async () => {
      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      })

      await expect(
        result.current.mutateAsync({ text: '' })
      ).rejects.toThrow('Todo text cannot be empty')
    })

    it('should validate todo text length', async () => {
      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      })

      const longText = 'a'.repeat(501)
      await expect(
        result.current.mutateAsync({ text: longText })
      ).rejects.toThrow('Todo text cannot exceed 500 characters')
    })
  })

  describe('useUpdateTodo', () => {
    it('should update todo', async () => {
      const { result } = renderHook(() => useUpdateTodo(), {
        wrapper: createWrapper(),
      })

      const updatedTodo = await result.current.mutateAsync({
        id: '1',
        updates: { text: 'Updated text' }
      })
      
      expect(updatedTodo.text).toBe('Updated text')
    })
  })

  describe('useToggleTodo', () => {
    it('should toggle todo completion', async () => {
      const { result } = renderHook(() => useToggleTodo(), {
        wrapper: createWrapper(),
      })

      const toggledTodo = await result.current.mutateAsync('1')
      
      expect(toggledTodo.completed).toBe(true)
    })
  })

  describe('useDeleteTodo', () => {
    it('should delete todo', async () => {
      const { result } = renderHook(() => useDeleteTodo(), {
        wrapper: createWrapper(),
      })

      const result_data = await result.current.mutateAsync('1')
      
      expect(result_data.id).toBe('1')
    })
  })

  describe('useDeleteCompletedTodos', () => {
    it('should delete all completed todos', async () => {
      const { result } = renderHook(() => useDeleteCompletedTodos(), {
        wrapper: createWrapper(),
      })

      // Wait for the hook to be ready
      await waitFor(() => {
        expect(result.current.isIdle).toBe(true)
      })

      // Call the mutation
      let result_data: { deletedCount: number } | undefined
      await act(async () => {
        result_data = await result.current.mutateAsync()
      })
      
      expect(result_data?.deletedCount).toBe(1)
    })
  })
})
