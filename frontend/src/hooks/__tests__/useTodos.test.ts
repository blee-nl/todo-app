import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useTodos,
  useTodosByState,
  useTodo,
  useCreateTodo,
  useUpdateTodo,
  useActivateTodo,
  useCompleteTodo,
  useFailTodo,
  useReactivateTodo,
  useDeleteTodo,
  useDeleteCompletedTodos,
  useDeleteFailedTodos,
  todoKeys,
} from '../useTodos';
import { TaskState, TaskType } from '../../constants/taskConstants';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, ReactivateTodoRequest } from '../../services/api';
import { todoApi } from '../../services/api';

// Mock dependencies
vi.mock('../../services/api', () => ({
  todoApi: {
    getAllTodos: vi.fn(),
    getTodosByState: vi.fn(),
    getTodoById: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    activateTodo: vi.fn(),
    completeTodo: vi.fn(),
    failTodo: vi.fn(),
    reactivateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    deleteCompletedTodos: vi.fn(),
    deleteFailedTodos: vi.fn(),
  },
}));

vi.mock('../../constants/config', () => ({
  CONFIG: {
    QUERY_STALE_TIME: 5 * 60 * 1000,
    QUERY_GC_TIME: 10 * 60 * 1000,
  },
}));

vi.mock('../../utils', () => ({
  validateTodoText: vi.fn(),
  validateTodoId: vi.fn(),
  sanitizeText: vi.fn(),
}));

vi.mock('../../utils/queryUtils', () => ({
  shouldRetryError: vi.fn(),
  invalidateTodoQueries: vi.fn(),
  updateTodoInCache: vi.fn(),
}));

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Create test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useTodos hooks', () => {
  let wrapper: ReturnType<typeof createWrapper>;
  let utils: any;
  let queryUtils: any;

  const createMockTodo = (overrides: Partial<Todo> = {}): Todo => ({
    id: 'todo-1',
    text: 'Test todo',
    type: TaskType.ONE_TIME,
    state: TaskState.PENDING,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    dueAt: '2024-01-16T12:00:00Z',
    ...overrides,
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    wrapper = createWrapper();

    // Import mocked modules to access their methods
    utils = await import('../../utils');
    queryUtils = await import('../../utils/queryUtils');

    // Setup default mocks
    vi.mocked(utils.validateTodoText).mockReturnValue(true);
    vi.mocked(utils.validateTodoId).mockReturnValue(true);
    vi.mocked(utils.sanitizeText).mockImplementation((text: string) => text.trim());
    vi.mocked(queryUtils.shouldRetryError).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('todoKeys', () => {
    it('generates correct query keys', () => {
      expect(todoKeys.all).toEqual(['todos']);
      expect(todoKeys.lists()).toEqual(['todos', 'list']);
      expect(todoKeys.list('filter')).toEqual(['todos', 'list', { filters: 'filter' }]);
      expect(todoKeys.details()).toEqual(['todos', 'detail']);
      expect(todoKeys.detail('todo-1')).toEqual(['todos', 'detail', 'todo-1']);
      expect(todoKeys.byState(TaskState.PENDING)).toEqual(['todos', 'state', TaskState.PENDING]);
    });
  });

  describe('useTodos', () => {
    it('fetches all todos successfully', async () => {
      const mockGroupedTodos = {
        pending: [createMockTodo({ state: TaskState.PENDING })],
        active: [createMockTodo({ id: 'todo-2', state: TaskState.ACTIVE })],
        completed: [],
        failed: [],
      };

      todoApi.getAllTodos.mockResolvedValue(mockGroupedTodos);

      const { result } = renderHook(() => useTodos(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockGroupedTodos);
      expect(result.current.error).toBeNull();
      expect(todoApi.getAllTodos).toHaveBeenCalledTimes(1);
    });

    it('handles fetch error correctly', async () => {
      const mockError = new Error('Failed to fetch todos');
      todoApi.getAllTodos.mockRejectedValue(mockError);

      const { result } = renderHook(() => useTodos(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toEqual(mockError);
    });

    it('uses correct query configuration', () => {
      todoApi.getAllTodos.mockResolvedValue({});

      renderHook(() => useTodos(), { wrapper });

      expect(todoApi.getAllTodos).toHaveBeenCalledTimes(1);
    });
  });

  describe('useTodosByState', () => {
    it('fetches todos by state successfully', async () => {
      const mockTodos = [
        createMockTodo({ state: TaskState.PENDING }),
        createMockTodo({ id: 'todo-2', state: TaskState.PENDING }),
      ];

      todoApi.getTodosByState.mockResolvedValue(mockTodos);

      const { result } = renderHook(() => useTodosByState(TaskState.PENDING), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockTodos);
      expect(todoApi.getTodosByState).toHaveBeenCalledWith(TaskState.PENDING);
    });

    it('handles different states correctly', async () => {
      const states = [TaskState.PENDING, TaskState.ACTIVE, TaskState.COMPLETED, TaskState.FAILED];

      for (const state of states) {
        const mockTodos = [createMockTodo({ state })];
        todoApi.getTodosByState.mockResolvedValue(mockTodos);

        const { result } = renderHook(() => useTodosByState(state), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(todoApi.getTodosByState).toHaveBeenCalledWith(state);
      }
    });
  });

  describe('useTodo', () => {
    it('fetches single todo successfully', async () => {
      const mockTodo = createMockTodo();
      todoApi.getTodoById.mockResolvedValue(mockTodo);

      const { result } = renderHook(() => useTodo('todo-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockTodo);
      expect(todoApi.getTodoById).toHaveBeenCalledWith('todo-1');
    });

    it('does not fetch when id is empty', () => {
      renderHook(() => useTodo(''), { wrapper });

      expect(todoApi.getTodoById).not.toHaveBeenCalled();
    });

    it('handles fetch error correctly', async () => {
      const mockError = new Error('Todo not found');
      todoApi.getTodoById.mockRejectedValue(mockError);

      const { result } = renderHook(() => useTodo('todo-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useCreateTodo', () => {
    it('creates todo successfully with valid data', async () => {
      const newTodo = createMockTodo({ text: 'New todo' });
      todoApi.createTodo.mockResolvedValue(newTodo);

      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      const createRequest: CreateTodoRequest = {
        text: 'New todo',
        type: TaskType.ONE_TIME,
        dueAt: '2024-01-20T12:00:00Z',
      };

      await act(async () => {
        await result.current.mutateAsync(createRequest);
      });

      expect(vi.mocked(utils.sanitizeText)).toHaveBeenCalledWith('New todo');
      expect(todoApi.createTodo).toHaveBeenCalledWith({
        ...createRequest,
        text: 'New todo', // sanitized text
      });
      expect(vi.mocked(queryUtils.invalidateTodoQueries)).toHaveBeenCalledWith(
        expect.any(Object),
        { includeAll: true, includeLists: true }
      );
    });

    it('validates todo text', async () => {
      vi.mocked(utils.validateTodoText).mockReturnValue(false);

      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            text: '',
            type: TaskType.ONE_TIME,
            dueAt: '2024-01-20T12:00:00Z',
          });
        })
      ).rejects.toThrow('Invalid todo text');

      expect(todoApi.createTodo).not.toHaveBeenCalled();
    });

    it('validates task type', async () => {
      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            text: 'Valid text',
            type: 'invalid-type' as any,
            dueAt: '2024-01-20T12:00:00Z',
          });
        })
      ).rejects.toThrow('Invalid task type');
    });

    it('requires due date for one-time tasks', async () => {
      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            text: 'Valid text',
            type: TaskType.ONE_TIME,
            // dueAt missing
          });
        })
      ).rejects.toThrow('Due date is required for one-time tasks');
    });

    it('allows daily tasks without due date', async () => {
      const newTodo = createMockTodo({ type: TaskType.DAILY });
      todoApi.createTodo.mockResolvedValue(newTodo);

      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          text: 'Daily task',
          type: TaskType.DAILY,
          // dueAt not required for daily tasks
        });
      });

      expect(todoApi.createTodo).toHaveBeenCalled();
    });

    it('handles API errors and logs them', async () => {
      const apiError = new Error('API Error');
      todoApi.createTodo.mockRejectedValue(apiError);

      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      // Use mutate instead of mutateAsync to allow onError callback to fire
      act(() => {
        result.current.mutate({
          text: 'Valid text',
          type: TaskType.ONE_TIME,
          dueAt: '2024-01-20T12:00:00Z',
        });
      });

      // Wait for mutation to complete and onError to be called
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith('Failed to create todo:', apiError);
      });
    });
  });

  describe('useUpdateTodo', () => {
    it('updates todo successfully', async () => {
      const updatedTodo = createMockTodo({ text: 'Updated text' });
      todoApi.updateTodo.mockResolvedValue(updatedTodo);

      const { result } = renderHook(() => useUpdateTodo(), { wrapper });

      const updates: UpdateTodoRequest = {
        text: 'Updated text',
      };

      await act(async () => {
        await result.current.mutateAsync({ id: 'todo-1', updates });
      });

      expect(vi.mocked(utils.sanitizeText)).toHaveBeenCalledWith('Updated text');
      expect(todoApi.updateTodo).toHaveBeenCalledWith('todo-1', {
        text: 'Updated text',
      });
      expect(vi.mocked(queryUtils.updateTodoInCache)).toHaveBeenCalledWith(
        expect.any(Object),
        'todo-1',
        updatedTodo
      );
    });

    it('validates todo ID', async () => {
      vi.mocked(utils.validateTodoId).mockReturnValue(false);

      const { result } = renderHook(() => useUpdateTodo(), { wrapper });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: 'invalid-id', updates: { text: 'New text' } });
        })
      ).rejects.toThrow('Invalid todo ID');
    });

    it('validates todo text when provided', async () => {
      vi.mocked(utils.validateTodoText).mockReturnValue(false);

      const { result } = renderHook(() => useUpdateTodo(), { wrapper });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: 'todo-1', updates: { text: 'invalid text' } });
        })
      ).rejects.toThrow('Invalid todo text');
    });

    it('handles updates without text', async () => {
      const updatedTodo = createMockTodo();
      todoApi.updateTodo.mockResolvedValue(updatedTodo);

      const { result } = renderHook(() => useUpdateTodo(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'todo-1',
          updates: { dueAt: '2024-01-20T12:00:00Z' },
        });
      });

      expect(todoApi.updateTodo).toHaveBeenCalledWith('todo-1', {
        dueAt: '2024-01-20T12:00:00Z',
        text: undefined,
      });
    });
  });

  describe('State transition hooks', () => {
    const testStateTransitionHook = async (
      hookName: string,
      hookFunction: () => any,
      apiMethodName: string,
      expectedStates: string[]
    ) => {
      const transitionedTodo = createMockTodo();
      (todoApi as any)[apiMethodName].mockResolvedValue(transitionedTodo);

      const { result } = renderHook(hookFunction, { wrapper });

      await act(async () => {
        await result.current.mutateAsync('todo-1');
      });

      expect(vi.mocked(utils.validateTodoId)).toHaveBeenCalledWith('todo-1');
      expect((todoApi as any)[apiMethodName]).toHaveBeenCalledWith('todo-1');
      expect(vi.mocked(queryUtils.updateTodoInCache)).toHaveBeenCalledWith(
        expect.any(Object),
        'todo-1',
        transitionedTodo
      );
      expect(vi.mocked(queryUtils.invalidateTodoQueries)).toHaveBeenCalledWith(
        expect.any(Object),
        {
          states: expectedStates,
          includeLists: true,
          includeAll: false,
        }
      );
    };

    it('activates todo successfully', async () => {
      await testStateTransitionHook(
        'useActivateTodo',
        () => useActivateTodo(),
        'activateTodo',
        ['pending', 'active']
      );
    });

    it('completes todo successfully', async () => {
      await testStateTransitionHook(
        'useCompleteTodo',
        () => useCompleteTodo(),
        'completeTodo',
        ['active', 'completed']
      );
    });

    it('fails todo successfully', async () => {
      await testStateTransitionHook(
        'useFailTodo',
        () => useFailTodo(),
        'failTodo',
        ['active', 'failed']
      );
    });

    it('validates todo ID for state transitions', async () => {
      vi.mocked(utils.validateTodoId).mockReturnValue(false);

      const { result } = renderHook(() => useActivateTodo(), { wrapper });

      await expect(
        act(async () => {
          await result.current.mutateAsync('invalid-id');
        })
      ).rejects.toThrow('Invalid todo ID');
    });

    it('handles state transition errors', async () => {
      const apiError = new Error('Activation failed');
      todoApi.activateTodo.mockRejectedValue(apiError);

      const { result } = renderHook(() => useActivateTodo(), { wrapper });

      // Use mutate instead of mutateAsync to allow onError callback to fire
      act(() => {
        result.current.mutate('todo-1');
      });

      // Wait for mutation to complete and onError to be called
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith('Failed to activate todo:', apiError);
      });
    });
  });

  describe('useReactivateTodo', () => {
    it('reactivates todo without request data', async () => {
      const reactivatedTodo = createMockTodo({ state: TaskState.ACTIVE });
      todoApi.reactivateTodo.mockResolvedValue(reactivatedTodo);

      const { result } = renderHook(() => useReactivateTodo(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ id: 'todo-1' });
      });

      expect(todoApi.reactivateTodo).toHaveBeenCalledWith('todo-1', undefined);
      expect(vi.mocked(queryUtils.invalidateTodoQueries)).toHaveBeenCalledWith(
        expect.any(Object),
        {
          states: ['completed', 'failed', 'active'],
          includeLists: true,
          includeAll: false,
        }
      );
    });

    it('reactivates todo with request data', async () => {
      const reactivatedTodo = createMockTodo({ state: TaskState.ACTIVE });
      todoApi.reactivateTodo.mockResolvedValue(reactivatedTodo);

      const { result } = renderHook(() => useReactivateTodo(), { wrapper });

      const request: ReactivateTodoRequest = {
        newDueAt: '2024-01-20T12:00:00Z',
        notification: {
          enabled: true,
          reminderMinutes: 30,
        },
      };

      await act(async () => {
        await result.current.mutateAsync({ id: 'todo-1', request });
      });

      expect(todoApi.reactivateTodo).toHaveBeenCalledWith('todo-1', request);
    });

    it('validates todo ID for reactivation', async () => {
      vi.mocked(utils.validateTodoId).mockReturnValue(false);

      const { result } = renderHook(() => useReactivateTodo(), { wrapper });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: 'invalid-id' });
        })
      ).rejects.toThrow('Invalid todo ID');
    });
  });

  describe('useDeleteTodo', () => {
    it('deletes todo successfully', async () => {
      todoApi.deleteTodo.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useDeleteTodo(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync('todo-1');
      });

      expect(todoApi.deleteTodo).toHaveBeenCalledWith('todo-1');
      expect(vi.mocked(queryUtils.invalidateTodoQueries)).toHaveBeenCalledWith(
        expect.any(Object),
        {
          includeAll: true,
          includeLists: true,
          specificTodoId: 'todo-1',
        }
      );
    });

    it('validates todo ID for deletion', async () => {
      vi.mocked(utils.validateTodoId).mockReturnValue(false);

      const { result } = renderHook(() => useDeleteTodo(), { wrapper });

      await expect(
        act(async () => {
          await result.current.mutateAsync('invalid-id');
        })
      ).rejects.toThrow('Invalid todo ID');
    });
  });

  describe('Bulk delete hooks', () => {
    it('deletes all completed todos successfully', async () => {
      todoApi.deleteCompletedTodos.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useDeleteCompletedTodos(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(todoApi.deleteCompletedTodos).toHaveBeenCalledTimes(1);
      expect(vi.mocked(queryUtils.invalidateTodoQueries)).toHaveBeenCalledWith(
        expect.any(Object),
        {
          states: ['completed'],
          includeLists: true,
          includeAll: false,
        }
      );
    });

    it('deletes all failed todos successfully', async () => {
      todoApi.deleteFailedTodos.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useDeleteFailedTodos(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(todoApi.deleteFailedTodos).toHaveBeenCalledTimes(1);
      expect(vi.mocked(queryUtils.invalidateTodoQueries)).toHaveBeenCalledWith(
        expect.any(Object),
        {
          states: ['failed'],
          includeLists: true,
          includeAll: false,
        }
      );
    });

    it('handles bulk delete errors', async () => {
      const apiError = new Error('Bulk delete failed');
      todoApi.deleteCompletedTodos.mockRejectedValue(apiError);

      const { result } = renderHook(() => useDeleteCompletedTodos(), { wrapper });

      // Use mutate instead of mutateAsync to allow onError callback to fire
      act(() => {
        result.current.mutate();
      });

      // Wait for mutation to complete and onError to be called
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith('Failed to delete completed todos:', apiError);
      });
    });
  });

  describe('Loading states', () => {
    it('tracks loading states correctly for queries', () => {
      todoApi.getAllTodos.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useTodos(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('tracks loading states correctly for mutations', () => {
      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      expect(result.current.isPending).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('handles query errors gracefully', async () => {
      const queryError = new Error('Query failed');
      todoApi.getAllTodos.mockRejectedValue(queryError);

      const { result } = renderHook(() => useTodos(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(queryError);
    });

    it('logs mutation errors to console', async () => {
      const mutationError = new Error('Mutation failed');
      todoApi.createTodo.mockRejectedValue(mutationError);

      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      // Use mutate instead of mutateAsync to allow onError callback to fire
      act(() => {
        result.current.mutate({
          text: 'Test',
          type: TaskType.ONE_TIME,
          dueAt: '2024-01-20T12:00:00Z',
        });
      });

      // Wait for mutation to complete and onError to be called
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith('Failed to create todo:', mutationError);
      });
    });
  });

  describe('Cache optimization', () => {
    it('uses optimized cache utilities for mutations', async () => {
      const newTodo = createMockTodo();
      todoApi.createTodo.mockResolvedValue(newTodo);

      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          text: 'Test',
          type: TaskType.ONE_TIME,
          dueAt: '2024-01-20T12:00:00Z',
        });
      });

      expect(vi.mocked(queryUtils.invalidateTodoQueries)).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          includeAll: true,
          includeLists: true,
        })
      );
    });

    it('updates individual todos in cache for state transitions', async () => {
      const activatedTodo = createMockTodo({ state: TaskState.ACTIVE });
      todoApi.activateTodo.mockResolvedValue(activatedTodo);

      const { result } = renderHook(() => useActivateTodo(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync('todo-1');
      });

      expect(vi.mocked(queryUtils.updateTodoInCache)).toHaveBeenCalledWith(
        expect.any(Object),
        'todo-1',
        activatedTodo
      );
    });
  });
});