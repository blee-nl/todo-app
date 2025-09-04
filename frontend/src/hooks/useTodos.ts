import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../services/api';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../services/api';

// Query keys for React Query
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};

// Hook to get all todos
export const useTodos = () => {
  return useQuery({
    queryKey: todoKeys.lists(),
    queryFn: todoApi.getAllTodos,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
};

// Hook to get todos by completion status
export const useTodosByStatus = (completed?: boolean) => {
  return useQuery({
    queryKey: todoKeys.list(completed?.toString() || 'all'),
    queryFn: () => todoApi.getTodosByStatus(completed),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook to get single todo by ID
export const useTodo = (id: string) => {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoApi.getTodoById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook to create a new todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todo: CreateTodoRequest) => todoApi.createTodo(todo),
    onSuccess: (newTodo) => {
      // Invalidate and refetch todos list
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      
      // Add the new todo to the cache
      queryClient.setQueryData(todoKeys.lists(), (oldTodos: Todo[] | undefined) => {
        if (!oldTodos) return [newTodo];
        return [newTodo, ...oldTodos];
      });
    },
    onError: (error) => {
      console.error('Failed to create todo:', error);
    },
  });
};

// Hook to update a todo
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTodoRequest }) =>
      todoApi.updateTodo(id, updates),
    onSuccess: (updatedTodo) => {
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo);
      
      // Update todos list cache
      queryClient.setQueryData(todoKeys.lists(), (oldTodos: Todo[] | undefined) => {
        if (!oldTodos) return [updatedTodo];
        return oldTodos.map(todo => 
          todo.id === updatedTodo.id ? updatedTodo : todo
        );
      });
      
      // Invalidate status-based queries
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update todo:', error);
    },
  });
};

// Hook to toggle todo completion
export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoApi.toggleTodo(id),
    onSuccess: (updatedTodo) => {
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo);
      
      // Update todos list cache
      queryClient.setQueryData(todoKeys.lists(), (oldTodos: Todo[] | undefined) => {
        if (!oldTodos) return [updatedTodo];
        return oldTodos.map(todo => 
          todo.id === updatedTodo.id ? updatedTodo : todo
        );
      });
      
      // Invalidate status-based queries
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to toggle todo:', error);
    },
  });
};

// Hook to delete a todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: (deletedTodo) => {
      // Remove the todo from cache
      queryClient.removeQueries({ queryKey: todoKeys.detail(deletedTodo.id) });
      
      // Update todos list cache
      queryClient.setQueryData(todoKeys.lists(), (oldTodos: Todo[] | undefined) => {
        if (!oldTodos) return [];
        return oldTodos.filter(todo => todo.id !== deletedTodo.id);
      });
      
      // Invalidate status-based queries
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
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
    mutationFn: () => todoApi.deleteCompletedTodos(),
    onSuccess: (result) => {
      // Invalidate all todo queries
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      
      console.log(`Deleted ${result.deletedCount} completed todos`);
    },
    onError: (error) => {
      console.error('Failed to delete completed todos:', error);
    },
  });
};

// Hook to get active todos (not completed)
export const useActiveTodos = () => {
  return useTodosByStatus(false);
};

// Hook to get completed todos
export const useCompletedTodos = () => {
  return useTodosByStatus(true);
};
