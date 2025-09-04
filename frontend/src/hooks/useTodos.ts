import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../services/api';
import { CONFIG } from '../constants/config';
import { validateTodoText, validateTodoId, sanitizeText } from '../utils';
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
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};

// Hook to get todos by state
export const useTodosByState = (state: TaskState) => {
  return useQuery({
    queryKey: todoKeys.byState(state),
    queryFn: () => todoApi.getTodosByState(state),
    staleTime: CONFIG.QUERY_STALE_TIME,
    gcTime: CONFIG.QUERY_GC_TIME,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
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

      if (!todoData.type || !['one-time', 'daily'].includes(todoData.type)) {
        throw new Error('Invalid task type');
      }

      if (todoData.type === 'one-time' && !todoData.dueAt) {
        throw new Error('Due date is required for one-time tasks');
      }

      const sanitizedData = {
        ...todoData,
        text: sanitizeText(todoData.text),
      };

      return todoApi.createTodo(sanitizedData);
    },
    onSuccess: () => {
      // Invalidate and refetch todos
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
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
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo);
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState(updatedTodo.state) });
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
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(activatedTodo.id), activatedTodo);
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('pending') });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('active') });
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
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(completedTodo.id), completedTodo);
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('active') });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('completed') });
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
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(failedTodo.id), failedTodo);
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('active') });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('failed') });
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
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(reactivatedTodo.id), reactivatedTodo);
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('completed') });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('failed') });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('active') });
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
      // Remove the todo from cache
      queryClient.removeQueries({ queryKey: todoKeys.detail(deletedId) });
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
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
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('completed') });
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
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.byState('failed') });
    },
    onError: (error) => {
      console.error('Failed to delete failed todos:', error);
    },
  });
};