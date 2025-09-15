import { QueryClient } from '@tanstack/react-query';
import type { TaskState, Todo } from '../services/api';
import { todoKeys } from '../hooks/useTodos';

/**
 * Utility functions for React Query optimization
 */

/**
 * Determines if a query should be retried based on error type and failure count
 * Extracted from duplicate retry logic across multiple hooks
 */
export const shouldRetryError = (failureCount: number, error: unknown): boolean => {
  // Don't retry on 4xx errors (client errors)
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: number }).status;
    if (status && status >= 400 && status < 500) {
      return false;
    }
  }

  // Retry up to 3 times for other errors (5xx, network errors, etc.)
  return failureCount < 3;
};

/**
 * Cache invalidation utility for todo mutations
 * Reduces duplicate invalidation logic across hooks
 */
export const invalidateTodoQueries = (
  queryClient: QueryClient,
  options: {
    states?: TaskState[];
    includeAll?: boolean;
    includeLists?: boolean;
    specificTodoId?: string;
  } = {}
) => {
  const { states = [], includeAll = true, includeLists = true, specificTodoId } = options;

  // Invalidate all todos if requested
  if (includeAll) {
    queryClient.invalidateQueries({ queryKey: todoKeys.all });
  }

  // Invalidate todo lists if requested
  if (includeLists) {
    queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
  }

  // Invalidate specific states
  states.forEach(state => {
    queryClient.invalidateQueries({ queryKey: todoKeys.byState(state) });
  });

  // Remove specific todo if requested
  if (specificTodoId) {
    queryClient.removeQueries({ queryKey: todoKeys.detail(specificTodoId) });
  }
};

/**
 * Update specific todo in cache after successful mutation
 */
export const updateTodoInCache = (
  queryClient: QueryClient,
  todoId: string,
  updatedTodo: Todo
) => {
  queryClient.setQueryData(todoKeys.detail(todoId), updatedTodo);
};

/**
 * Common mutation options factory
 */
export const createMutationOptions = <T>(
  onSuccessCallback?: (data: T) => void,
  onErrorCallback?: (error: unknown) => void
) => ({
  onSuccess: (data: T) => {
    onSuccessCallback?.(data);
  },
  onError: (error: unknown) => {
    console.error('Mutation failed:', error);
    onErrorCallback?.(error);
  },
});