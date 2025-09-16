import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTaskManagement } from '../useTaskManagement';
import { TaskState, TaskType } from '../../../../constants/taskConstants';
import type { Task } from '../../../../domain/entities/Task';

// Mock the useTaskService hook
vi.mock('../../../tasks/hooks/useTaskService', () => {
  const mockTaskService = {
    tasks: [],
    isLoading: false,
    error: null,
    createTask: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
    updateTask: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
    deleteTask: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
    activateTask: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
    completeTask: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
    failTask: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
    reactivateTask: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
    deleteCompletedTasks: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
    deleteFailedTasks: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
  };

  return {
    useTaskService: () => mockTaskService,
  };
});

// Mock TaskDomainService
vi.mock('../../../../domain/services/TaskDomainService', () => ({
  TaskDomainService: {
    getTaskPriority: vi.fn((task: any) => task.id === 'task-1' ? 1 : 2),
    isOverdue: vi.fn((task: any) => task.id === 'overdue-task'),
    canBeActivated: vi.fn(() => true),
    canBeCompleted: vi.fn(() => true),
    canBeFailed: vi.fn(() => true),
    canBeReactivated: vi.fn(() => true),
    canBeEdited: vi.fn(() => true),
    getTaskDisplayBadges: vi.fn(() => []),
    validateTaskText: vi.fn(() => ({ isValid: true })),
    validateDueDate: vi.fn(() => ({ isValid: true })),
  },
}));

// Mock NotificationScheduler
vi.mock('../../../../services/notificationScheduler', () => ({
  NotificationScheduler: {
    initialize: vi.fn(),
    clearAll: vi.fn(),
    scheduleTaskNotifications: vi.fn(),
    scheduleTaskNotification: vi.fn(),
    updateTaskNotification: vi.fn(),
    clearTaskNotification: vi.fn(),
    handleTaskStateChange: vi.fn(),
  },
}));

// Import the mocked modules
import { useTaskService } from '../../../tasks/hooks/useTaskService';
import { TaskDomainService } from '../../../../domain/services/TaskDomainService';
import { NotificationScheduler } from '../../../../services/notificationScheduler';

describe('useTaskManagement', () => {
  // Get the mocked instances
  const mockTaskService = useTaskService() as any;
  const mockTaskDomainService = TaskDomainService as any;
  const mockNotificationScheduler = NotificationScheduler as any;

  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    text: 'Test task',
    type: TaskType.ONE_TIME,
    state: TaskState.PENDING,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    dueAt: '2024-01-16T12:00:00Z',
    notification: {
      enabled: true,
      reminderMinutes: 15,
    },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock task service
    mockTaskService.tasks = [];
    mockTaskService.isLoading = false;
    mockTaskService.error = null;

    // Reset all isPending states
    Object.keys(mockTaskService).forEach(key => {
      if (mockTaskService[key as keyof typeof mockTaskService]?.isPending !== undefined) {
        (mockTaskService[key as keyof typeof mockTaskService] as any).isPending = false;
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization and Cleanup', () => {
    it('initializes notification scheduler on mount', () => {
      renderHook(() => useTaskManagement());

      expect(mockNotificationScheduler.initialize).toHaveBeenCalledTimes(1);
    });

    it('schedules notifications for existing tasks', () => {
      const tasks = [createMockTask({ id: 'task-1' }), createMockTask({ id: 'task-2' })];
      mockTaskService.tasks = tasks;

      renderHook(() => useTaskManagement());

      expect(mockNotificationScheduler.scheduleTaskNotifications).toHaveBeenCalledWith(tasks);
    });

    it('cleans up notifications on unmount', () => {
      const { unmount } = renderHook(() => useTaskManagement());

      unmount();

      expect(mockNotificationScheduler.clearAll).toHaveBeenCalledTimes(1);
    });

    it('does not schedule notifications when there are no tasks', () => {
      mockTaskService.tasks = [];

      renderHook(() => useTaskManagement());

      expect(mockNotificationScheduler.scheduleTaskNotifications).not.toHaveBeenCalled();
    });

    it('reschedules notifications when tasks change', () => {
      mockTaskService.tasks = [createMockTask({ id: 'task-1' })];

      const { rerender } = renderHook(() => useTaskManagement());

      // Change tasks
      mockTaskService.tasks = [
        createMockTask({ id: 'task-1' }),
        createMockTask({ id: 'task-2' }),
      ];
      rerender();

      expect(mockNotificationScheduler.scheduleTaskNotifications).toHaveBeenCalledTimes(2);
    });
  });

  describe('Task Grouping by State', () => {
    it('groups tasks by state correctly', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'pending-1', state: TaskState.PENDING }),
        createMockTask({ id: 'pending-2', state: TaskState.PENDING }),
        createMockTask({ id: 'active-1', state: TaskState.ACTIVE }),
        createMockTask({ id: 'completed-1', state: TaskState.COMPLETED }),
        createMockTask({ id: 'failed-1', state: TaskState.FAILED }),
      ];

      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.tasksByState.pending).toHaveLength(2);
      expect(result.current.tasksByState.active).toHaveLength(1);
      expect(result.current.tasksByState.completed).toHaveLength(1);
      expect(result.current.tasksByState.failed).toHaveLength(1);

      expect(result.current.tasksByState.pending[0].id).toBe('pending-1');
      expect(result.current.tasksByState.active[0].id).toBe('active-1');
      expect(result.current.tasksByState.completed[0].id).toBe('completed-1');
      expect(result.current.tasksByState.failed[0].id).toBe('failed-1');
    });

    it('sorts tasks by priority within each state', () => {
      // Setup mock to return different priorities for different tasks
      mockTaskDomainService.getTaskPriority
        .mockImplementation((task: Task) => {
          if (task.id === 'high-priority') return 1;
          if (task.id === 'medium-priority') return 2;
          if (task.id === 'low-priority') return 3;
          return 0;
        });

      mockTaskService.tasks = [
        createMockTask({ id: 'low-priority', state: TaskState.PENDING }),
        createMockTask({ id: 'high-priority', state: TaskState.PENDING }),
        createMockTask({ id: 'medium-priority', state: TaskState.PENDING }),
      ];

      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.tasksByState.pending[0].id).toBe('high-priority');
      expect(result.current.tasksByState.pending[1].id).toBe('medium-priority');
      expect(result.current.tasksByState.pending[2].id).toBe('low-priority');
    });

    it('handles empty task arrays correctly', () => {
      mockTaskService.tasks = [];

      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.tasksByState.pending).toHaveLength(0);
      expect(result.current.tasksByState.active).toHaveLength(0);
      expect(result.current.tasksByState.completed).toHaveLength(0);
      expect(result.current.tasksByState.failed).toHaveLength(0);
    });

    it('updates groups when tasks change', () => {
      mockTaskService.tasks = [createMockTask({ id: 'task-1', state: TaskState.PENDING })];

      const { result, rerender } = renderHook(() => useTaskManagement());

      expect(result.current.tasksByState.pending).toHaveLength(1);
      expect(result.current.tasksByState.active).toHaveLength(0);

      // Change task state
      mockTaskService.tasks = [createMockTask({ id: 'task-1', state: TaskState.ACTIVE })];
      rerender();

      expect(result.current.tasksByState.pending).toHaveLength(0);
      expect(result.current.tasksByState.active).toHaveLength(1);
    });
  });

  describe('Statistics Calculation', () => {
    beforeEach(() => {
      // Mock current date to January 15, 2024
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    it('calculates basic statistics correctly', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'pending-1', state: TaskState.PENDING }),
        createMockTask({ id: 'active-1', state: TaskState.ACTIVE }),
        createMockTask({ id: 'active-2', state: TaskState.ACTIVE }),
        createMockTask({ id: 'completed-1', state: TaskState.COMPLETED }),
        createMockTask({ id: 'failed-1', state: TaskState.FAILED }),
      ];

      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.statistics).toEqual({
        total: 5,
        pending: 1,
        active: 2,
        completed: 1,
        failed: 1,
        overdue: 0,
        dueToday: 0,
      });
    });

    it('calculates overdue tasks correctly', () => {
      mockTaskDomainService.isOverdue.mockImplementation((task: Task) =>
        task.id === 'overdue-1' || task.id === 'overdue-2'
      );

      mockTaskService.tasks = [
        createMockTask({ id: 'overdue-1', state: TaskState.ACTIVE }),
        createMockTask({ id: 'overdue-2', state: TaskState.PENDING }),
        createMockTask({ id: 'normal-1', state: TaskState.ACTIVE }),
      ];

      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.statistics.overdue).toBe(2);
    });

    it('calculates due today tasks correctly', () => {
      const today = new Date('2024-01-15T12:00:00Z');
      const tomorrow = new Date('2024-01-16T12:00:00Z');

      mockTaskService.tasks = [
        createMockTask({ id: 'due-today-1', dueAt: today.toISOString() }),
        createMockTask({ id: 'due-today-2', dueAt: '2024-01-15T20:00:00Z' }),
        createMockTask({ id: 'due-tomorrow', dueAt: tomorrow.toISOString() }),
        createMockTask({ id: 'no-due-date', dueAt: undefined }),
      ];

      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.statistics.dueToday).toBe(2);
    });

    it('handles tasks without due dates in today calculation', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'no-due-1', dueAt: undefined }),
        createMockTask({ id: 'no-due-2', dueAt: null as any }),
      ];

      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.statistics.dueToday).toBe(0);
    });

    it('updates statistics when tasks change', () => {
      mockTaskService.tasks = [createMockTask({ state: TaskState.PENDING })];

      const { result, rerender } = renderHook(() => useTaskManagement());

      expect(result.current.statistics.total).toBe(1);
      expect(result.current.statistics.pending).toBe(1);

      // Add more tasks
      mockTaskService.tasks = [
        createMockTask({ id: 'task-1', state: TaskState.PENDING }),
        createMockTask({ id: 'task-2', state: TaskState.ACTIVE }),
      ];
      rerender();

      expect(result.current.statistics.total).toBe(2);
      expect(result.current.statistics.pending).toBe(1);
      expect(result.current.statistics.active).toBe(1);
    });
  });

  describe('Task Actions', () => {
    describe('createTask', () => {
      it('creates task and schedules notification on success', async () => {
        const mockTask = createMockTask({ id: 'new-task' });
        const mockResult = { success: true, task: mockTask };
        mockTaskService.createTask.mutateAsync.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useTaskManagement());

        const createRequest = { text: 'New task', type: TaskType.ONE_TIME };
        await act(async () => {
          await result.current.actions.createTask(createRequest);
        });

        expect(mockTaskService.createTask.mutateAsync).toHaveBeenCalledWith(createRequest);
        expect(mockNotificationScheduler.scheduleTaskNotification).toHaveBeenCalledWith(mockTask);
      });

      it('does not schedule notification on failure', async () => {
        const mockResult = { success: false, error: 'Creation failed' };
        mockTaskService.createTask.mutateAsync.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useTaskManagement());

        await act(async () => {
          await result.current.actions.createTask({ text: 'New task', type: TaskType.ONE_TIME });
        });

        expect(mockNotificationScheduler.scheduleTaskNotification).not.toHaveBeenCalled();
      });
    });

    describe('updateTask', () => {
      it('updates task and notification on success', async () => {
        const mockTask = createMockTask({ id: 'updated-task' });
        const mockResult = { success: true, task: mockTask };
        mockTaskService.updateTask.mutateAsync.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useTaskManagement());

        const updateRequest = { text: 'Updated task' };
        await act(async () => {
          await result.current.actions.updateTask('task-id', updateRequest);
        });

        expect(mockTaskService.updateTask.mutateAsync).toHaveBeenCalledWith({
          id: 'task-id',
          request: updateRequest,
        });
        expect(mockNotificationScheduler.updateTaskNotification).toHaveBeenCalledWith(mockTask);
      });
    });

    describe('deleteTask', () => {
      it('clears notification before deleting task', async () => {
        const mockResult = { success: true };
        mockTaskService.deleteTask.mutateAsync.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useTaskManagement());

        await act(async () => {
          await result.current.actions.deleteTask('task-id');
        });

        expect(mockNotificationScheduler.clearTaskNotification).toHaveBeenCalledWith('task-id');
        expect(mockTaskService.deleteTask.mutateAsync).toHaveBeenCalledWith('task-id');
      });
    });

    describe('state change actions', () => {
      const testStateChangeAction = async (
        actionName: 'activateTask' | 'completeTask' | 'failTask',
        serviceMethod: string
      ) => {
        const mockTask = createMockTask({ id: 'changed-task' });
        const mockResult = { success: true, task: mockTask };
        (mockTaskService as any)[serviceMethod].mutateAsync.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useTaskManagement());

        await act(async () => {
          await (result.current.actions as any)[actionName]('task-id');
        });

        expect((mockTaskService as any)[serviceMethod].mutateAsync).toHaveBeenCalledWith('task-id');
        expect(mockNotificationScheduler.handleTaskStateChange).toHaveBeenCalledWith(mockTask);
      };

      it('handles activate task with notification update', async () => {
        await testStateChangeAction('activateTask', 'activateTask');
      });

      it('handles complete task with notification update', async () => {
        await testStateChangeAction('completeTask', 'completeTask');
      });

      it('handles fail task with notification update', async () => {
        await testStateChangeAction('failTask', 'failTask');
      });
    });

    describe('reactivateTask', () => {
      it('reactivates task with optional request and updates notification', async () => {
        const mockTask = createMockTask({ id: 'reactivated-task' });
        const mockResult = { success: true, task: mockTask };
        mockTaskService.reactivateTask.mutateAsync.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useTaskManagement());

        const reactivateRequest = { newDueAt: '2024-01-20T12:00:00Z' };
        await act(async () => {
          await result.current.actions.reactivateTask('task-id', reactivateRequest);
        });

        expect(mockTaskService.reactivateTask.mutateAsync).toHaveBeenCalledWith({
          id: 'task-id',
          request: reactivateRequest,
        });
        expect(mockNotificationScheduler.handleTaskStateChange).toHaveBeenCalledWith(mockTask);
      });

      it('reactivates task without request', async () => {
        const mockTask = createMockTask({ id: 'reactivated-task' });
        const mockResult = { success: true, task: mockTask };
        mockTaskService.reactivateTask.mutateAsync.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useTaskManagement());

        await act(async () => {
          await result.current.actions.reactivateTask('task-id');
        });

        expect(mockTaskService.reactivateTask.mutateAsync).toHaveBeenCalledWith({
          id: 'task-id',
          request: undefined,
        });
      });
    });

    describe('bulk delete actions', () => {
      it('clears notifications for completed tasks before deleting all', async () => {
        mockTaskService.tasks = [
          createMockTask({ id: 'completed-1', state: TaskState.COMPLETED }),
          createMockTask({ id: 'completed-2', state: TaskState.COMPLETED }),
          createMockTask({ id: 'active-1', state: TaskState.ACTIVE }),
        ];

        const mockResult = { success: true };
        mockTaskService.deleteCompletedTasks.mutateAsync.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useTaskManagement());

        await act(async () => {
          await result.current.actions.deleteAllCompleted();
        });

        expect(mockNotificationScheduler.clearTaskNotification).toHaveBeenCalledTimes(2);
        expect(mockNotificationScheduler.clearTaskNotification).toHaveBeenCalledWith('completed-1');
        expect(mockNotificationScheduler.clearTaskNotification).toHaveBeenCalledWith('completed-2');
        expect(mockTaskService.deleteCompletedTasks.mutateAsync).toHaveBeenCalled();
      });

      it('clears notifications for failed tasks before deleting all', async () => {
        mockTaskService.tasks = [
          createMockTask({ id: 'failed-1', state: TaskState.FAILED }),
          createMockTask({ id: 'failed-2', state: TaskState.FAILED }),
          createMockTask({ id: 'active-1', state: TaskState.ACTIVE }),
        ];

        const mockResult = { success: true };
        mockTaskService.deleteFailedTasks.mutateAsync.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useTaskManagement());

        await act(async () => {
          await result.current.actions.deleteAllFailed();
        });

        expect(mockNotificationScheduler.clearTaskNotification).toHaveBeenCalledTimes(2);
        expect(mockNotificationScheduler.clearTaskNotification).toHaveBeenCalledWith('failed-1');
        expect(mockNotificationScheduler.clearTaskNotification).toHaveBeenCalledWith('failed-2');
        expect(mockTaskService.deleteFailedTasks.mutateAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Domain Helpers', () => {
    it('exposes all domain service methods', () => {
      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.domain.isTaskOverdue).toBe(mockTaskDomainService.isOverdue);
      expect(result.current.domain.canTaskBeActivated).toBe(mockTaskDomainService.canBeActivated);
      expect(result.current.domain.canTaskBeCompleted).toBe(mockTaskDomainService.canBeCompleted);
      expect(result.current.domain.canTaskBeFailed).toBe(mockTaskDomainService.canBeFailed);
      expect(result.current.domain.canTaskBeReactivated).toBe(mockTaskDomainService.canBeReactivated);
      expect(result.current.domain.canTaskBeEdited).toBe(mockTaskDomainService.canBeEdited);
      expect(result.current.domain.getTaskBadges).toBe(mockTaskDomainService.getTaskDisplayBadges);
      expect(result.current.domain.validateTaskText).toBe(mockTaskDomainService.validateTaskText);
      expect(result.current.domain.validateDueDate).toBe(mockTaskDomainService.validateDueDate);
    });
  });

  describe('Loading States', () => {
    it('exposes general loading state from task service', () => {
      mockTaskService.isLoading = true;

      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.isLoading).toBe(true);
    });

    it('exposes error state from task service', () => {
      const mockError = new Error('Task service error');
      mockTaskService.error = mockError;

      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.error).toBe(mockError);
    });

    it('exposes all operation-specific loading states', () => {
      // Set all pending states to true
      mockTaskService.createTask.isPending = true;
      mockTaskService.updateTask.isPending = true;
      mockTaskService.deleteTask.isPending = true;
      mockTaskService.activateTask.isPending = true;
      mockTaskService.completeTask.isPending = true;
      mockTaskService.failTask.isPending = true;
      mockTaskService.reactivateTask.isPending = true;
      mockTaskService.deleteCompletedTasks.isPending = true;
      mockTaskService.deleteFailedTasks.isPending = true;

      const { result } = renderHook(() => useTaskManagement());

      expect(result.current.isCreating).toBe(true);
      expect(result.current.isUpdating).toBe(true);
      expect(result.current.isDeleting).toBe(true);
      expect(result.current.isActivating).toBe(true);
      expect(result.current.isCompleting).toBe(true);
      expect(result.current.isFailing).toBe(true);
      expect(result.current.isReactivating).toBe(true);
      expect(result.current.isDeletingCompleted).toBe(true);
      expect(result.current.isDeletingFailed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('propagates errors from task service actions', async () => {
      const mockError = new Error('Service error');
      mockTaskService.createTask.mutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() => useTaskManagement());

      await expect(
        act(async () => {
          await result.current.actions.createTask({ text: 'Test', type: TaskType.ONE_TIME });
        })
      ).rejects.toThrow('Service error');
    });

    it('handles notification scheduler errors gracefully', async () => {
      const mockTask = createMockTask({ id: 'new-task' });
      const mockResult = { success: true, task: mockTask };
      mockTaskService.createTask.mutateAsync.mockResolvedValue(mockResult);
      mockNotificationScheduler.scheduleTaskNotification.mockImplementation(() => {
        throw new Error('Notification error');
      });

      const { result } = renderHook(() => useTaskManagement());

      // Should not throw even if notification scheduling fails
      await act(async () => {
        await result.current.actions.createTask({ text: 'Test', type: TaskType.ONE_TIME });
      });

      expect(mockTaskService.createTask.mutateAsync).toHaveBeenCalled();
    });
  });

  describe('Performance and Memoization', () => {
    it('does not recalculate tasksByState when tasks reference is the same', () => {
      const tasks = [createMockTask({ id: 'task-1', state: TaskState.PENDING })];
      mockTaskService.tasks = tasks;

      const { result, rerender } = renderHook(() => useTaskManagement());

      const firstTasksByState = result.current.tasksByState;

      // Rerender with same tasks reference
      rerender();

      const secondTasksByState = result.current.tasksByState;

      expect(firstTasksByState).toBe(secondTasksByState);
    });

    it('recalculates tasksByState when tasks change', () => {
      mockTaskService.tasks = [createMockTask({ id: 'task-1', state: TaskState.PENDING })];

      const { result, rerender } = renderHook(() => useTaskManagement());

      const firstTasksByState = result.current.tasksByState;

      // Change tasks
      mockTaskService.tasks = [createMockTask({ id: 'task-2', state: TaskState.ACTIVE })];
      rerender();

      const secondTasksByState = result.current.tasksByState;

      expect(firstTasksByState).not.toBe(secondTasksByState);
    });

    it('memoizes statistics correctly', () => {
      const tasks = [createMockTask({ id: 'task-1', state: TaskState.PENDING })];
      mockTaskService.tasks = tasks;

      const { result, rerender } = renderHook(() => useTaskManagement());

      const firstStatistics = result.current.statistics;

      // Rerender with same tasks and tasksByState
      rerender();

      const secondStatistics = result.current.statistics;

      expect(firstStatistics).toBe(secondStatistics);
    });
  });
});