import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../services/api';
import { CONFIG } from '../constants/config';
import { validateTodoText, validateTodoId, sanitizeText } from '../utils';
import { shouldRetryError, invalidateTodoQueries, updateTodoInCache } from '../utils/queryUtils';
import { VALID_TASK_TYPES, isOneTimeTask } from '../constants/taskConstants';
import type {
  CreateTodoRequest,
  UpdateTodoRequest,
  ReactivateTodoRequest,
  TaskState
} from '../services/api';

// Query keys for React Query
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
  byState: (state: TaskState) => [...todoKeys.all, 'state', state] as const,
};

// Hook to get all todos grouped by state
export const useTodos = () => {
  return useQuery({
    queryKey: todoKeys.lists(),
    queryFn: todoApi.getAllTodos,
    staleTime: CONFIG.QUERY_STALE_TIME,
    gcTime: CONFIG.QUERY_GC_TIME,
    retry: shouldRetryError,
  });
};

// Hook to get todos by state
export const useTodosByState = (state: TaskState) => {
  return useQuery({
    queryKey: todoKeys.byState(state),
    queryFn: () => todoApi.getTodosByState(state),
    staleTime: CONFIG.QUERY_STALE_TIME,
    gcTime: CONFIG.QUERY_GC_TIME,
    retry: shouldRetryError,
  });
};

// Hook to get single todo by ID
export const useTodo = (id: string) => {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoApi.getTodoById(id),
    enabled: !!id,
    staleTime: CONFIG.QUERY_STALE_TIME,
    gcTime: CONFIG.QUERY_GC_TIME,
  });
};

// Hook to create a new todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoData: CreateTodoRequest) => {
      // Validate input
      if (!validateTodoText(todoData.text)) {
        throw new Error('Invalid todo text');
      }

      if (!todoData.type || !VALID_TASK_TYPES.includes(todoData.type)) {
        throw new Error('Invalid task type');
      }

      if (isOneTimeTask(todoData.type) && !todoData.dueAt) {
        throw new Error('Due date is required for one-time tasks');
      }

      const sanitizedData = {
        ...todoData,
        text: sanitizeText(todoData.text),
      };

      return todoApi.createTodo(sanitizedData);
    },
    onSuccess: () => {
      // Use optimized cache invalidation utility
      invalidateTodoQueries(queryClient, { includeAll: true, includeLists: true });
    },
    onError: (error) => {
      console.error('Failed to create todo:', error);
    },
  });
};

// Hook to update a todo (only text for active tasks)
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTodoRequest }) => {
      if (!validateTodoId(id)) {
        throw new Error('Invalid todo ID');
      }

      if (updates.text && !validateTodoText(updates.text)) {
        throw new Error('Invalid todo text');
      }

      const sanitizedUpdates = {
        ...updates,
        text: updates.text ? sanitizeText(updates.text) : undefined,
      };

      return todoApi.updateTodo(id, sanitizedUpdates);
    },
    onSuccess: (updatedTodo) => {
      // Use optimized cache utilities
      updateTodoInCache(queryClient, updatedTodo.id, updatedTodo);
      invalidateTodoQueries(queryClient, {
        states: [updatedTodo.state],
        includeLists: true,
        includeAll: false
      });
    },
    onError: (error) => {
      console.error('Failed to update todo:', error);
    },
  });
};

// Hook to activate a pending task
export const useActivateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!validateTodoId(id)) {
        throw new Error('Invalid todo ID');
      }
      return todoApi.activateTodo(id);
    },
    onSuccess: (activatedTodo) => {
      // Use optimized cache utilities
      updateTodoInCache(queryClient, activatedTodo.id, activatedTodo);
      invalidateTodoQueries(queryClient, {
        states: ['pending', 'active'],
        includeLists: true,
        includeAll: false
      });
    },
    onError: (error) => {
      console.error('Failed to activate todo:', error);
    },
  });
};

// Hook to complete a task
export const useCompleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!validateTodoId(id)) {
        throw new Error('Invalid todo ID');
      }
      return todoApi.completeTodo(id);
    },
    onSuccess: (completedTodo) => {
      // Use optimized cache utilities
      updateTodoInCache(queryClient, completedTodo.id, completedTodo);
      invalidateTodoQueries(queryClient, {
        states: ['active', 'completed'],
        includeLists: true,
        includeAll: false
      });
    },
    onError: (error) => {
      console.error('Failed to complete todo:', error);
    },
  });
};

// Hook to mark a task as failed
export const useFailTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!validateTodoId(id)) {
        throw new Error('Invalid todo ID');
      }
      return todoApi.failTodo(id);
    },
    onSuccess: (failedTodo) => {
      // Use optimized cache utilities
      updateTodoInCache(queryClient, failedTodo.id, failedTodo);
      invalidateTodoQueries(queryClient, {
        states: ['active', 'failed'],
        includeLists: true,
        includeAll: false
      });
    },
    onError: (error) => {
      console.error('Failed to mark todo as failed:', error);
    },
  });
};

// Hook to re-activate a completed or failed task
export const useReactivateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request?: ReactivateTodoRequest }) => {
      if (!validateTodoId(id)) {
        throw new Error('Invalid todo ID');
      }
      return todoApi.reactivateTodo(id, request);
    },
    onSuccess: (reactivatedTodo) => {
      // Use optimized cache utilities
      updateTodoInCache(queryClient, reactivatedTodo.id, reactivatedTodo);
      invalidateTodoQueries(queryClient, {
        states: ['completed', 'failed', 'active'],
        includeLists: true,
        includeAll: false
      });
    },
    onError: (error) => {
      console.error('Failed to re-activate todo:', error);
    },
  });
};

// Hook to delete a todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!validateTodoId(id)) {
        throw new Error('Invalid todo ID');
      }
      return todoApi.deleteTodo(id);
    },
    onSuccess: (_, deletedId) => {
      // Use optimized cache utilities
      invalidateTodoQueries(queryClient, {
        includeAll: true,
        includeLists: true,
        specificTodoId: deletedId
      });
    },
    onError: (error) => {
      console.error('Failed to delete todo:', error);
    },
  });
};

// Hook to delete all completed todos
export const useDeleteCompletedTodos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.deleteCompletedTodos,
    onSuccess: () => {
      // Use optimized cache utilities
      invalidateTodoQueries(queryClient, {
        states: ['completed'],
        includeLists: true,
        includeAll: false
      });
    },
    onError: (error) => {
      console.error('Failed to delete completed todos:', error);
    },
  });
};

// Hook to delete all failed todos
export const useDeleteFailedTodos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.deleteFailedTodos,
    onSuccess: () => {
      // Use optimized cache utilities
      invalidateTodoQueries(queryClient, {
        states: ['failed'],
        includeLists: true,
        includeAll: false
      });
    },
    onError: (error) => {
      console.error('Failed to delete failed todos:', error);
    },
  });
};