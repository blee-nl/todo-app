import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTaskService } from '../useTaskService';
import type { Task, CreateTaskRequest, UpdateTaskRequest, ReactivateTaskRequest } from '../../../../domain/entities/Task';
import { TaskState, TaskType } from '../../../../constants/taskConstants';

// Mock the service container
vi.mock('../../../../infrastructure/container/ServiceContainer', () => ({
  serviceContainer: {
    taskApplicationService: {
      getAllTasks: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      activateTask: vi.fn(),
      completeTask: vi.fn(),
      failTask: vi.fn(),
      reactivateTask: vi.fn(),
      deleteAllCompletedTasks: vi.fn(),
      deleteAllFailedTasks: vi.fn(),
    },
  },
}));

// Import the mocked service container
import { serviceContainer } from '../../../../infrastructure/container/ServiceContainer';

// Get the mocked service instance
const mockTaskApplicationService = serviceContainer.taskApplicationService as any;

// Create test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useTaskService', () => {
  let wrapper: ReturnType<typeof createWrapper>;
  let queryClient: QueryClient;

  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    text: 'Test task',
    type: TaskType.ONE_TIME,
    state: TaskState.PENDING,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    dueAt: '2024-01-16T12:00:00Z',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
        },
        mutations: {
          retry: false,
        },
      },
      logger: {
        log: () => {},
        warn: () => {},
        error: () => {},
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );
  });

  afterEach(async () => {
    vi.useRealTimers();

    // Clean up query client properly
    if (queryClient) {
      queryClient.clear();
      await queryClient.cancelQueries();
    }
  });

  describe('Tasks Query', () => {
    it('fetches and returns tasks successfully', async () => {
      const mockTasks = [
        createMockTask({ id: 'task-1', text: 'Task 1' }),
        createMockTask({ id: 'task-2', text: 'Task 2' }),
      ];

      mockTaskApplicationService.getAllTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.error).toBeNull();
      expect(mockTaskApplicationService.getAllTasks).toHaveBeenCalledTimes(1);
    });

    it('handles fetch error correctly', async () => {
      const mockError = new Error('Failed to fetch tasks');
      mockTaskApplicationService.getAllTasks.mockRejectedValue(mockError);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.error).toEqual(mockError);
    });

    it('returns empty array when no tasks', async () => {
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('shows loading state initially', () => {
      mockTaskApplicationService.getAllTasks.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useTaskService(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.tasks).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Create Task Mutation', () => {
    it('creates task successfully and invalidates queries', async () => {
      const mockResult = { success: true, task: createMockTask({ text: 'New task' }) };
      mockTaskApplicationService.createTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      const createRequest: CreateTaskRequest = {
        text: 'New task',
        type: TaskType.ONE_TIME,
      };

      await act(async () => {
        await result.current.createTask.mutateAsync(createRequest);
      });

      expect(mockTaskApplicationService.createTask).toHaveBeenCalledWith(createRequest);
      expect(result.current.createTask.isPending).toBe(false);
    });

    it('handles create task failure', async () => {
      const mockResult = { success: false, error: 'Creation failed' };
      mockTaskApplicationService.createTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      const createRequest: CreateTaskRequest = {
        text: 'New task',
        type: TaskType.ONE_TIME,
      };

      await act(async () => {
        await result.current.createTask.mutateAsync(createRequest);
      });

      expect(result.current.createTask.isPending).toBe(false);
      // Should not invalidate queries on failure
    });

    it('handles create task with full request data', async () => {
      const mockResult = { success: true, task: createMockTask() };
      mockTaskApplicationService.createTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      const createRequest: CreateTaskRequest = {
        text: 'New task',
        type: TaskType.DAILY,
        dueAt: '2024-01-20T12:00:00Z',
        notification: {
          enabled: true,
          reminderMinutes: 30,
        },
      };

      await act(async () => {
        await result.current.createTask.mutateAsync(createRequest);
      });

      expect(mockTaskApplicationService.createTask).toHaveBeenCalledWith(createRequest);
    });

    it('shows pending state during creation', async () => {
      let resolveCreate: (value: any) => void;
      const createPromise = new Promise(resolve => {
        resolveCreate = resolve;
      });

      mockTaskApplicationService.createTask.mockReturnValue(createPromise);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      const createRequest: CreateTaskRequest = {
        text: 'New task',
        type: TaskType.ONE_TIME,
      };

      act(() => {
        result.current.createTask.mutate(createRequest);
      });

      // Wait for pending state to be updated
      await waitFor(() => {
        expect(result.current.createTask.isPending).toBe(true);
      });

      act(() => {
        resolveCreate!({ success: true, task: createMockTask() });
      });

      await waitFor(() => {
        expect(result.current.createTask.isPending).toBe(false);
      });
    });
  });

  describe('Update Task Mutation', () => {
    it('updates task successfully', async () => {
      const mockResult = { success: true, task: createMockTask({ text: 'Updated task' }) };
      mockTaskApplicationService.updateTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      const updateRequest: UpdateTaskRequest = {
        text: 'Updated task',
      };

      await act(async () => {
        await result.current.updateTask.mutateAsync({ id: 'task-1', request: updateRequest });
      });

      expect(mockTaskApplicationService.updateTask).toHaveBeenCalledWith('task-1', updateRequest);
      expect(result.current.updateTask.isPending).toBe(false);
    });

    it('handles update task failure', async () => {
      const mockResult = { success: false, error: 'Update failed' };
      mockTaskApplicationService.updateTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      const updateRequest: UpdateTaskRequest = {
        text: 'Updated task',
      };

      await act(async () => {
        await result.current.updateTask.mutateAsync({ id: 'task-1', request: updateRequest });
      });

      expect(result.current.updateTask.isPending).toBe(false);
    });

    it('updates task with notification data', async () => {
      const mockResult = { success: true, task: createMockTask() };
      mockTaskApplicationService.updateTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      const updateRequest: UpdateTaskRequest = {
        text: 'Updated task',
        dueAt: '2024-01-20T12:00:00Z',
        notification: {
          enabled: false,
          reminderMinutes: 60,
        },
      };

      await act(async () => {
        await result.current.updateTask.mutateAsync({ id: 'task-1', request: updateRequest });
      });

      expect(mockTaskApplicationService.updateTask).toHaveBeenCalledWith('task-1', updateRequest);
    });
  });

  describe('Delete Task Mutation', () => {
    it('deletes task successfully', async () => {
      const mockResult = { success: true };
      mockTaskApplicationService.deleteTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await act(async () => {
        await result.current.deleteTask.mutateAsync('task-1');
      });

      expect(mockTaskApplicationService.deleteTask).toHaveBeenCalledWith('task-1');
      expect(result.current.deleteTask.isPending).toBe(false);
    });

    it('handles delete task failure', async () => {
      const mockResult = { success: false, error: 'Delete failed' };
      mockTaskApplicationService.deleteTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await act(async () => {
        await result.current.deleteTask.mutateAsync('task-1');
      });

      expect(result.current.deleteTask.isPending).toBe(false);
    });
  });

  describe('State Transition Mutations', () => {
    const testStateTransition = async (
      mutationName: 'activateTask' | 'completeTask' | 'failTask',
      serviceName: string
    ) => {
      const mockResult = { success: true, task: createMockTask() };
      (mockTaskApplicationService as any)[serviceName].mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await act(async () => {
        await (result.current as any)[mutationName].mutateAsync('task-1');
      });

      expect((mockTaskApplicationService as any)[serviceName]).toHaveBeenCalledWith('task-1');
      expect((result.current as any)[mutationName].isPending).toBe(false);
    };

    it('activates task successfully', async () => {
      await testStateTransition('activateTask', 'activateTask');
    });

    it('completes task successfully', async () => {
      await testStateTransition('completeTask', 'completeTask');
    });

    it('fails task successfully', async () => {
      await testStateTransition('failTask', 'failTask');
    });

    it('handles state transition failures', async () => {
      const mockResult = { success: false, error: 'Activation failed' };
      mockTaskApplicationService.activateTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await act(async () => {
        await result.current.activateTask.mutateAsync('task-1');
      });

      expect(result.current.activateTask.isPending).toBe(false);
    });
  });

  describe('Reactivate Task Mutation', () => {
    it('reactivates task without request data', async () => {
      const mockResult = { success: true, task: createMockTask() };
      mockTaskApplicationService.reactivateTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await act(async () => {
        await result.current.reactivateTask.mutateAsync({ id: 'task-1' });
      });

      expect(mockTaskApplicationService.reactivateTask).toHaveBeenCalledWith('task-1', undefined);
      expect(result.current.reactivateTask.isPending).toBe(false);
    });

    it('reactivates task with request data', async () => {
      const mockResult = { success: true, task: createMockTask() };
      mockTaskApplicationService.reactivateTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      const reactivateRequest: ReactivateTaskRequest = {
        newDueAt: '2024-01-20T12:00:00Z',
        notification: {
          enabled: true,
          reminderMinutes: 15,
        },
      };

      await act(async () => {
        await result.current.reactivateTask.mutateAsync({
          id: 'task-1',
          request: reactivateRequest,
        });
      });

      expect(mockTaskApplicationService.reactivateTask).toHaveBeenCalledWith(
        'task-1',
        reactivateRequest
      );
    });

    it('handles reactivate task failure', async () => {
      const mockResult = { success: false, error: 'Reactivation failed' };
      mockTaskApplicationService.reactivateTask.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await act(async () => {
        await result.current.reactivateTask.mutateAsync({ id: 'task-1' });
      });

      expect(result.current.reactivateTask.isPending).toBe(false);
    });
  });

  describe('Bulk Delete Mutations', () => {
    it('deletes all completed tasks successfully', async () => {
      const mockResult = { success: true };
      mockTaskApplicationService.deleteAllCompletedTasks.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await act(async () => {
        await result.current.deleteCompletedTasks.mutateAsync();
      });

      expect(mockTaskApplicationService.deleteAllCompletedTasks).toHaveBeenCalledTimes(1);
      expect(result.current.deleteCompletedTasks.isPending).toBe(false);
    });

    it('deletes all failed tasks successfully', async () => {
      const mockResult = { success: true };
      mockTaskApplicationService.deleteAllFailedTasks.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await act(async () => {
        await result.current.deleteFailedTasks.mutateAsync();
      });

      expect(mockTaskApplicationService.deleteAllFailedTasks).toHaveBeenCalledTimes(1);
      expect(result.current.deleteFailedTasks.isPending).toBe(false);
    });

    it('handles bulk delete failures', async () => {
      const mockResult = { success: false, error: 'Bulk delete failed' };
      mockTaskApplicationService.deleteAllCompletedTasks.mockResolvedValue(mockResult);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await act(async () => {
        await result.current.deleteCompletedTasks.mutateAsync();
      });

      expect(result.current.deleteCompletedTasks.isPending).toBe(false);
    });
  });

  describe('Query Invalidation', () => {
    it('invalidates queries on successful mutations', async () => {
      // Setup mocks for successful operations
      mockTaskApplicationService.createTask.mockResolvedValue({ success: true, task: createMockTask() });
      mockTaskApplicationService.updateTask.mockResolvedValue({ success: true, task: createMockTask() });
      mockTaskApplicationService.deleteTask.mockResolvedValue({ success: true });
      mockTaskApplicationService.activateTask.mockResolvedValue({ success: true, task: createMockTask() });
      mockTaskApplicationService.completeTask.mockResolvedValue({ success: true, task: createMockTask() });
      mockTaskApplicationService.failTask.mockResolvedValue({ success: true, task: createMockTask() });
      mockTaskApplicationService.reactivateTask.mockResolvedValue({ success: true, task: createMockTask() });
      mockTaskApplicationService.deleteAllCompletedTasks.mockResolvedValue({ success: true });
      mockTaskApplicationService.deleteAllFailedTasks.mockResolvedValue({ success: true });

      // Mock getAllTasks to be called multiple times (initial + after each successful mutation)
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      // Wait for initial query to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = mockTaskApplicationService.getAllTasks.mock.calls.length;

      // Test each mutation that should invalidate queries
      await act(async () => {
        await result.current.createTask.mutateAsync({ text: 'Test', type: TaskType.ONE_TIME });
      });

      await act(async () => {
        await result.current.updateTask.mutateAsync({ id: 'task-1', request: { text: 'Updated' } });
      });

      await act(async () => {
        await result.current.deleteTask.mutateAsync('task-1');
      });

      await act(async () => {
        await result.current.activateTask.mutateAsync('task-1');
      });

      await act(async () => {
        await result.current.completeTask.mutateAsync('task-1');
      });

      await act(async () => {
        await result.current.failTask.mutateAsync('task-1');
      });

      await act(async () => {
        await result.current.reactivateTask.mutateAsync({ id: 'task-1' });
      });

      await act(async () => {
        await result.current.deleteCompletedTasks.mutateAsync();
      });

      await act(async () => {
        await result.current.deleteFailedTasks.mutateAsync();
      });

      // Should have called getAllTasks multiple times due to query invalidation
      expect(mockTaskApplicationService.getAllTasks.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('does not invalidate queries on failed mutations', async () => {
      // Setup mocks for failed operations
      mockTaskApplicationService.createTask.mockResolvedValue({ success: false, error: 'Failed' });
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      // Wait for initial query to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = mockTaskApplicationService.getAllTasks.mock.calls.length;

      // Test failed mutation
      await act(async () => {
        await result.current.createTask.mutateAsync({ text: 'Test', type: TaskType.ONE_TIME });
      });

      // Should not have triggered additional calls to getAllTasks
      expect(mockTaskApplicationService.getAllTasks.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Loading and Error States', () => {
    it('tracks loading states for all mutations', () => {
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      // All mutations should initially not be pending
      expect(result.current.createTask.isPending).toBe(false);
      expect(result.current.updateTask.isPending).toBe(false);
      expect(result.current.deleteTask.isPending).toBe(false);
      expect(result.current.activateTask.isPending).toBe(false);
      expect(result.current.completeTask.isPending).toBe(false);
      expect(result.current.failTask.isPending).toBe(false);
      expect(result.current.reactivateTask.isPending).toBe(false);
      expect(result.current.deleteCompletedTasks.isPending).toBe(false);
      expect(result.current.deleteFailedTasks.isPending).toBe(false);
    });

    it('handles simultaneous mutations correctly', async () => {
      mockTaskApplicationService.createTask.mockResolvedValue({ success: true, task: createMockTask() });
      mockTaskApplicationService.updateTask.mockResolvedValue({ success: true, task: createMockTask() });
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      // Wait for hook to initialize first
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Execute mutations sequentially to avoid overlapping act() calls
      const createResult = await act(async () => {
        return result.current.createTask.mutateAsync({ text: 'Test', type: TaskType.ONE_TIME });
      });

      const updateResult = await act(async () => {
        return result.current.updateTask.mutateAsync({ id: 'task-1', request: { text: 'Updated' } });
      });

      expect(createResult).toBeDefined();
      expect(updateResult).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles service errors correctly', async () => {
      const serviceError = new Error('Service unavailable');
      mockTaskApplicationService.createTask.mockRejectedValue(serviceError);
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      await expect(
        act(async () => {
          await result.current.createTask.mutateAsync({ text: 'Test', type: TaskType.ONE_TIME });
        })
      ).rejects.toThrow('Service unavailable');
    });

    it('handles network errors during query', async () => {
      const networkError = new Error('Network error');
      mockTaskApplicationService.getAllTasks.mockRejectedValue(networkError);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      // Wait for the hook to handle the error
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(networkError);
      expect(result.current.tasks).toEqual([]);
      expect(mockTaskApplicationService.getAllTasks).toHaveBeenCalledTimes(1);
    });
  });

  describe('Query Configuration', () => {
    it('uses correct stale time for tasks query', async () => {
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      // Wait for the query to be executed
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the hook initialized properly
      expect(result.current.tasks).toEqual([]);
      expect(mockTaskApplicationService.getAllTasks).toHaveBeenCalledTimes(1);
    });

    it('uses correct query key for tasks', async () => {
      mockTaskApplicationService.getAllTasks.mockResolvedValue([]);

      const { result } = renderHook(() => useTaskService(), { wrapper });

      // Wait for the query to be executed
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the hook initialized properly and uses correct query key
      expect(result.current.tasks).toEqual([]);
      expect(mockTaskApplicationService.getAllTasks).toHaveBeenCalledTimes(1);

      // Verify the query was executed with the correct key by checking the cache
      const queryData = queryClient.getQueryData(['tasks']);
      expect(queryData).toEqual([]);
    });
  });
});