import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import {
  shouldRetryError,
  invalidateTodoQueries,
  updateTodoInCache,
  createMutationOptions,
} from '../queryUtils';
import { todoKeys } from '../../hooks/useTodos';
import type { Todo } from '../../services/api';

// Mock the todoKeys
vi.mock('../../hooks/useTodos', () => ({
  todoKeys: {
    all: ['todos'],
    lists: () => ['todos', 'list'],
    byState: (state: string) => ['todos', 'state', state],
    detail: (id: string) => ['todos', 'detail', id],
  },
}));

describe('queryUtils', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('shouldRetryError', () => {
    it('should not retry on 4xx client errors', () => {
      const error400 = { status: 400 };
      const error404 = { status: 404 };
      const error422 = { status: 422 };

      expect(shouldRetryError(0, error400)).toBe(false);
      expect(shouldRetryError(1, error404)).toBe(false);
      expect(shouldRetryError(2, error422)).toBe(false);
    });

    it('should retry on 5xx server errors', () => {
      const error500 = { status: 500 };
      const error502 = { status: 502 };

      expect(shouldRetryError(0, error500)).toBe(true);
      expect(shouldRetryError(1, error502)).toBe(true);
      expect(shouldRetryError(2, error500)).toBe(true);
    });

    it('should retry on network errors (no status)', () => {
      const networkError = new Error('Network error');
      const timeoutError = { message: 'Timeout' };

      expect(shouldRetryError(0, networkError)).toBe(true);
      expect(shouldRetryError(1, timeoutError)).toBe(true);
      expect(shouldRetryError(2, networkError)).toBe(true);
    });

    it('should stop retrying after 3 attempts', () => {
      const error500 = { status: 500 };
      const networkError = new Error('Network error');

      expect(shouldRetryError(3, error500)).toBe(false);
      expect(shouldRetryError(4, networkError)).toBe(false);
      expect(shouldRetryError(10, error500)).toBe(false);
    });

    it('should handle errors without status property', () => {
      const errorWithoutStatus = { message: 'Some error' };
      const nullError = null;
      const undefinedError = undefined;

      expect(shouldRetryError(0, errorWithoutStatus)).toBe(true);
      expect(shouldRetryError(1, nullError)).toBe(true);
      expect(shouldRetryError(2, undefinedError)).toBe(true);
    });

    it('should handle edge cases for status values', () => {
      const error399 = { status: 399 }; // Just below 4xx range
      const error500 = { status: 500 }; // At 5xx range
      const errorUndefinedStatus = { status: undefined };
      const errorNullStatus = { status: null };

      expect(shouldRetryError(0, error399)).toBe(true);
      expect(shouldRetryError(0, error500)).toBe(true);
      expect(shouldRetryError(0, errorUndefinedStatus)).toBe(true);
      expect(shouldRetryError(0, errorNullStatus)).toBe(true);
    });
  });

  describe('invalidateTodoQueries', () => {
    beforeEach(() => {
      // Spy on queryClient methods
      vi.spyOn(queryClient, 'invalidateQueries');
      vi.spyOn(queryClient, 'removeQueries');
    });

    it('should invalidate all todos by default', () => {
      invalidateTodoQueries(queryClient);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos']
      });
    });

    it('should invalidate todo lists by default', () => {
      invalidateTodoQueries(queryClient);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'list']
      });
    });

    it('should not invalidate all todos when includeAll is false', () => {
      invalidateTodoQueries(queryClient, { includeAll: false });

      expect(queryClient.invalidateQueries).not.toHaveBeenCalledWith({
        queryKey: ['todos']
      });
    });

    it('should not invalidate lists when includeLists is false', () => {
      invalidateTodoQueries(queryClient, { includeLists: false });

      expect(queryClient.invalidateQueries).not.toHaveBeenCalledWith({
        queryKey: ['todos', 'list']
      });
    });

    it('should invalidate specific states', () => {
      invalidateTodoQueries(queryClient, {
        states: ['pending', 'active'],
        includeAll: false,
        includeLists: false
      });

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'state', 'pending']
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'state', 'active']
      });
    });

    it('should remove specific todo when specificTodoId is provided', () => {
      const todoId = 'todo-123';
      invalidateTodoQueries(queryClient, {
        specificTodoId: todoId,
        includeAll: false,
        includeLists: false
      });

      expect(queryClient.removeQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'detail', todoId]
      });
    });

    it('should handle complex invalidation scenarios', () => {
      invalidateTodoQueries(queryClient, {
        states: ['completed', 'failed'],
        includeAll: true,
        includeLists: true,
        specificTodoId: 'todo-456'
      });

      // Check all expected calls
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos']
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'list']
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'state', 'completed']
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'state', 'failed']
      });
      expect(queryClient.removeQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'detail', 'todo-456']
      });
    });

    it('should handle empty states array', () => {
      invalidateTodoQueries(queryClient, {
        states: [],
        includeAll: false,
        includeLists: false
      });

      // Should not call invalidateQueries for any state
      expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });

  describe('updateTodoInCache', () => {
    beforeEach(() => {
      vi.spyOn(queryClient, 'setQueryData');
    });

    it('should update todo in cache with correct query key', () => {
      const todoId = 'todo-789';
      const updatedTodo: Todo = {
        id: todoId,
        text: 'Updated todo text',
        type: 'one-time',
        state: 'active',
        dueAt: '2024-12-31T23:59:59.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      };

      updateTodoInCache(queryClient, todoId, updatedTodo);

      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ['todos', 'detail', todoId],
        updatedTodo
      );
    });

    it('should handle different todo objects', () => {
      const todoId = 'todo-abc';
      const differentTodo: Todo = {
        id: todoId,
        text: 'Different todo',
        type: 'daily',
        state: 'completed',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z'
      };

      updateTodoInCache(queryClient, todoId, differentTodo);

      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ['todos', 'detail', todoId],
        differentTodo
      );
    });
  });

  describe('createMutationOptions', () => {
    it('should create mutation options with success callback', () => {
      const onSuccess = vi.fn();
      const options = createMutationOptions(onSuccess);

      const testData = { id: '1', text: 'test' };
      options.onSuccess(testData);

      expect(onSuccess).toHaveBeenCalledWith(testData);
    });

    it('should create mutation options with error callback', () => {
      const onError = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const options = createMutationOptions(undefined, onError);

      const testError = new Error('Test error');
      options.onError(testError);

      expect(onError).toHaveBeenCalledWith(testError);
      expect(consoleSpy).toHaveBeenCalledWith('Mutation failed:', testError);

      consoleSpy.mockRestore();
    });

    it('should create mutation options with both callbacks', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const options = createMutationOptions(onSuccess, onError);

      expect(options.onSuccess).toBeDefined();
      expect(options.onError).toBeDefined();
    });

    it('should handle undefined callbacks gracefully', () => {
      const options = createMutationOptions();

      expect(() => {
        options.onSuccess('test data');
      }).not.toThrow();

      expect(() => {
        options.onError(new Error('test error'));
      }).not.toThrow();
    });

    it('should always log errors to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const options = createMutationOptions();

      const testError = new Error('Console test error');
      options.onError(testError);

      expect(consoleSpy).toHaveBeenCalledWith('Mutation failed:', testError);

      consoleSpy.mockRestore();
    });

    it('should handle different data types in success callback', () => {
      const onSuccess = vi.fn();
      const options = createMutationOptions<string>(onSuccess);

      options.onSuccess('string data');
      expect(onSuccess).toHaveBeenCalledWith('string data');

      const numberOptions = createMutationOptions<number>(onSuccess);
      numberOptions.onSuccess(42);
      expect(onSuccess).toHaveBeenCalledWith(42);
    });

    it('should handle different error types', () => {
      const onError = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const options = createMutationOptions(undefined, onError);

      // String error
      options.onError('string error');
      expect(onError).toHaveBeenCalledWith('string error');

      // Object error
      const objError = { status: 500, message: 'Server error' };
      options.onError(objError);
      expect(onError).toHaveBeenCalledWith(objError);

      // Null/undefined errors
      options.onError(null);
      expect(onError).toHaveBeenCalledWith(null);

      consoleSpy.mockRestore();
    });
  });

  describe('Integration scenarios', () => {
    it('should work together in a typical mutation flow', () => {
      // Simulate a typical mutation where we update cache and invalidate queries
      const todoId = 'integration-todo';
      const updatedTodo: Todo = {
        id: todoId,
        text: 'Integration test todo',
        type: 'one-time',
        state: 'completed',
        dueAt: '2024-12-31T23:59:59.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z'
      };

      // Spy on query client methods
      vi.spyOn(queryClient, 'setQueryData');
      vi.spyOn(queryClient, 'invalidateQueries');

      // Update cache
      updateTodoInCache(queryClient, todoId, updatedTodo);

      // Invalidate related queries
      invalidateTodoQueries(queryClient, {
        states: ['active', 'completed'],
        includeLists: true,
        includeAll: false
      });

      // Verify both operations worked
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ['todos', 'detail', todoId],
        updatedTodo
      );
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'list']
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'state', 'active']
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['todos', 'state', 'completed']
      });
    });

    it('should handle error retry logic with different error types', () => {
      // Test various error scenarios
      const scenarios = [
        { error: { status: 400 }, failureCount: 0, shouldRetry: false },
        { error: { status: 500 }, failureCount: 0, shouldRetry: true },
        { error: { status: 500 }, failureCount: 3, shouldRetry: false },
        { error: new Error('Network'), failureCount: 2, shouldRetry: true },
        { error: null, failureCount: 1, shouldRetry: true },
      ];

      scenarios.forEach(({ error, failureCount, shouldRetry }) => {
        expect(shouldRetryError(failureCount, error)).toBe(shouldRetry);
      });
    });
  });
});