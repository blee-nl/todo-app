import { describe, it, expect } from 'vitest';
import type {
  Task,
  TaskTypeValue,
  TaskStateValue,
  NotificationSettings,
  CreateTaskRequest,
  UpdateTaskRequest,
  ReactivateTaskRequest
} from '../Task';
import { TaskType, TaskState } from '../../../constants/taskConstants';

describe('Task Domain Entity', () => {
  describe('Task interface', () => {
    it('should define a valid task with all required fields', () => {
      const task: Task = {
        id: 'task-1',
        text: 'Complete project',
        type: TaskType.ONE_TIME,
        state: TaskState.PENDING,
        dueAt: '2024-12-31T23:59:59.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isReactivation: false,
      };

      expect(task.id).toBe('task-1');
      expect(task.text).toBe('Complete project');
      expect(task.type).toBe(TaskType.ONE_TIME);
      expect(task.state).toBe(TaskState.PENDING);
      expect(task.dueAt).toBe('2024-12-31T23:59:59.000Z');
      expect(task.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(task.updatedAt).toBe('2024-01-01T00:00:00.000Z');
      expect(task.isReactivation).toBe(false);
    });

    it('should allow optional fields to be undefined', () => {
      const minimalTask: Task = {
        id: 'task-2',
        text: 'Daily habit',
        type: TaskType.DAILY,
        state: TaskState.PENDING,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isReactivation: false,
      };

      expect(minimalTask.dueAt).toBeUndefined();
      expect(minimalTask.notification).toBeUndefined();
      expect(minimalTask.activatedAt).toBeUndefined();
      expect(minimalTask.completedAt).toBeUndefined();
      expect(minimalTask.failedAt).toBeUndefined();
    });

    it('should support notification settings', () => {
      const taskWithNotification: Task = {
        id: 'task-3',
        text: 'Important meeting',
        type: TaskType.ONE_TIME,
        state: TaskState.PENDING,
        dueAt: '2024-12-31T14:00:00.000Z',
        notification: {
          enabled: true,
          reminderMinutes: 15,
          notifiedAt: new Date('2024-12-31T13:45:00.000Z'),
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isReactivation: false,
      };

      expect(taskWithNotification.notification?.enabled).toBe(true);
      expect(taskWithNotification.notification?.reminderMinutes).toBe(15);
      expect(taskWithNotification.notification?.notifiedAt).toEqual(
        new Date('2024-12-31T13:45:00.000Z')
      );
    });

    it('should support timestamp fields for state tracking', () => {
      const fullyTrackedTask: Task = {
        id: 'task-4',
        text: 'Tracked task',
        type: TaskType.ONE_TIME,
        state: TaskState.COMPLETED,
        dueAt: '2024-12-31T12:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        activatedAt: '2024-12-30T08:00:00.000Z',
        completedAt: '2024-12-30T11:30:00.000Z',
        updatedAt: '2024-12-30T11:30:00.000Z',
        isReactivation: false,
      };

      expect(fullyTrackedTask.activatedAt).toBe('2024-12-30T08:00:00.000Z');
      expect(fullyTrackedTask.completedAt).toBe('2024-12-30T11:30:00.000Z');
      expect(fullyTrackedTask.failedAt).toBeUndefined();
    });

    it('should support reactivation flag', () => {
      const reactivatedTask: Task = {
        id: 'task-5',
        text: 'Reactivated task',
        type: TaskType.ONE_TIME,
        state: TaskState.PENDING,
        dueAt: '2025-01-15T12:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T10:00:00.000Z',
        isReactivation: true,
      };

      expect(reactivatedTask.isReactivation).toBe(true);
    });
  });

  describe('TaskTypeValue', () => {
    it('should accept all valid task types', () => {
      const oneTimeType: TaskTypeValue = TaskType.ONE_TIME;
      const dailyType: TaskTypeValue = TaskType.DAILY;

      expect(oneTimeType).toBe('one-time');
      expect(dailyType).toBe('daily');
    });

    it('should be compatible with Task interface', () => {
      const task: Task = {
        id: 'test',
        text: 'test',
        type: TaskType.ONE_TIME as TaskTypeValue,
        state: TaskState.PENDING as TaskStateValue,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isReactivation: false,
      };

      expect(task.type).toBe(TaskType.ONE_TIME);
    });
  });

  describe('TaskStateValue', () => {
    it('should accept all valid task states', () => {
      const pendingState: TaskStateValue = TaskState.PENDING;
      const activeState: TaskStateValue = TaskState.ACTIVE;
      const completedState: TaskStateValue = TaskState.COMPLETED;
      const failedState: TaskStateValue = TaskState.FAILED;

      expect(pendingState).toBe('pending');
      expect(activeState).toBe('active');
      expect(completedState).toBe('completed');
      expect(failedState).toBe('failed');
    });

    it('should be compatible with Task interface', () => {
      const states: TaskStateValue[] = [
        TaskState.PENDING,
        TaskState.ACTIVE,
        TaskState.COMPLETED,
        TaskState.FAILED,
      ];

      states.forEach(state => {
        const task: Task = {
          id: 'test',
          text: 'test',
          type: TaskType.ONE_TIME,
          state: state,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          isReactivation: false,
        };

        expect(task.state).toBe(state);
      });
    });
  });

  describe('NotificationSettings', () => {
    it('should define notification settings with required fields', () => {
      const settings: NotificationSettings = {
        enabled: true,
        reminderMinutes: 30,
      };

      expect(settings.enabled).toBe(true);
      expect(settings.reminderMinutes).toBe(30);
      expect(settings.notifiedAt).toBeUndefined();
    });

    it('should support optional notifiedAt field', () => {
      const settingsWithNotification: NotificationSettings = {
        enabled: true,
        reminderMinutes: 15,
        notifiedAt: new Date('2024-12-31T13:45:00.000Z'),
      };

      expect(settingsWithNotification.notifiedAt).toEqual(
        new Date('2024-12-31T13:45:00.000Z')
      );
    });

    it('should allow disabled notifications', () => {
      const disabledSettings: NotificationSettings = {
        enabled: false,
        reminderMinutes: 0,
      };

      expect(disabledSettings.enabled).toBe(false);
      expect(disabledSettings.reminderMinutes).toBe(0);
    });

    it('should support various reminder times', () => {
      const reminderTimes = [5, 10, 15, 30, 60, 120];

      reminderTimes.forEach(minutes => {
        const settings: NotificationSettings = {
          enabled: true,
          reminderMinutes: minutes,
        };

        expect(settings.reminderMinutes).toBe(minutes);
      });
    });
  });

  describe('CreateTaskRequest', () => {
    it('should define minimal create request', () => {
      const request: CreateTaskRequest = {
        text: 'New task',
        type: TaskType.DAILY,
      };

      expect(request.text).toBe('New task');
      expect(request.type).toBe(TaskType.DAILY);
      expect(request.dueAt).toBeUndefined();
      expect(request.notification).toBeUndefined();
    });

    it('should support one-time task with due date', () => {
      const request: CreateTaskRequest = {
        text: 'Scheduled task',
        type: TaskType.ONE_TIME,
        dueAt: '2024-12-31T15:00:00.000Z',
      };

      expect(request.dueAt).toBe('2024-12-31T15:00:00.000Z');
    });

    it('should support notification in create request', () => {
      const request: CreateTaskRequest = {
        text: 'Task with notification',
        type: TaskType.ONE_TIME,
        dueAt: '2024-12-31T16:00:00.000Z',
        notification: {
          enabled: true,
          reminderMinutes: 20,
        },
      };

      expect(request.notification?.enabled).toBe(true);
      expect(request.notification?.reminderMinutes).toBe(20);
    });

    it('should support disabled notification in create request', () => {
      const request: CreateTaskRequest = {
        text: 'Task without notification',
        type: TaskType.ONE_TIME,
        dueAt: '2024-12-31T17:00:00.000Z',
        notification: {
          enabled: false,
          reminderMinutes: 0,
        },
      };

      expect(request.notification?.enabled).toBe(false);
    });
  });

  describe('UpdateTaskRequest', () => {
    it('should allow partial updates with all fields optional', () => {
      const request: UpdateTaskRequest = {};

      expect(request.text).toBeUndefined();
      expect(request.dueAt).toBeUndefined();
      expect(request.notification).toBeUndefined();
    });

    it('should support text updates only', () => {
      const request: UpdateTaskRequest = {
        text: 'Updated task text',
      };

      expect(request.text).toBe('Updated task text');
    });

    it('should support due date updates only', () => {
      const request: UpdateTaskRequest = {
        dueAt: '2025-01-01T12:00:00.000Z',
      };

      expect(request.dueAt).toBe('2025-01-01T12:00:00.000Z');
    });

    it('should support notification updates only', () => {
      const request: UpdateTaskRequest = {
        notification: {
          enabled: true,
          reminderMinutes: 45,
        },
      };

      expect(request.notification?.enabled).toBe(true);
      expect(request.notification?.reminderMinutes).toBe(45);
    });

    it('should support combined updates', () => {
      const request: UpdateTaskRequest = {
        text: 'Updated text',
        dueAt: '2025-01-02T14:00:00.000Z',
        notification: {
          enabled: false,
          reminderMinutes: 0,
        },
      };

      expect(request.text).toBe('Updated text');
      expect(request.dueAt).toBe('2025-01-02T14:00:00.000Z');
      expect(request.notification?.enabled).toBe(false);
    });
  });

  describe('ReactivateTaskRequest', () => {
    it('should support empty reactivation request', () => {
      const request: ReactivateTaskRequest = {};

      expect(request.newDueAt).toBeUndefined();
    });

    it('should support new due date for reactivation', () => {
      const request: ReactivateTaskRequest = {
        newDueAt: '2025-01-15T10:00:00.000Z',
      };

      expect(request.newDueAt).toBe('2025-01-15T10:00:00.000Z');
    });
  });

  describe('Type compatibility and constraints', () => {
    it('should enforce required fields in Task', () => {
      // This test validates TypeScript compilation - if this compiles, the types are correct
      const task: Task = {
        id: 'required',
        text: 'required',
        type: TaskType.ONE_TIME,
        state: TaskState.PENDING,
        createdAt: 'required',
        updatedAt: 'required',
        isReactivation: false,
      };

      expect(task).toBeDefined();
    });

    it('should maintain type safety for notification settings', () => {
      const task: Task = {
        id: 'test',
        text: 'test',
        type: TaskType.ONE_TIME,
        state: TaskState.PENDING,
        notification: {
          enabled: true,
          reminderMinutes: 15,
          // notifiedAt is optional
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isReactivation: false,
      };

      // TypeScript should allow this assignment
      const enabled: boolean = task.notification!.enabled;
      const minutes: number = task.notification!.reminderMinutes;
      const notifiedAt: Date | undefined = task.notification!.notifiedAt;

      expect(enabled).toBe(true);
      expect(minutes).toBe(15);
      expect(notifiedAt).toBeUndefined();
    });

    it('should support union types for task type and state', () => {
      const types: TaskTypeValue[] = [TaskType.ONE_TIME, TaskType.DAILY];
      const states: TaskStateValue[] = [
        TaskState.PENDING,
        TaskState.ACTIVE,
        TaskState.COMPLETED,
        TaskState.FAILED,
      ];

      types.forEach(type => {
        states.forEach(state => {
          const task: Task = {
            id: `${type}-${state}`,
            text: `${type} ${state} task`,
            type,
            state,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            isReactivation: false,
          };

          expect(task.type).toBe(type);
          expect(task.state).toBe(state);
        });
      });
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should model a complete task lifecycle', () => {
      // Created
      const created: Task = {
        id: 'lifecycle-task',
        text: 'Important project milestone',
        type: TaskType.ONE_TIME,
        state: TaskState.PENDING,
        dueAt: '2024-12-31T17:00:00.000Z',
        notification: {
          enabled: true,
          reminderMinutes: 30,
        },
        createdAt: '2024-12-01T09:00:00.000Z',
        updatedAt: '2024-12-01T09:00:00.000Z',
        isReactivation: false,
      };

      // Activated
      const activated: Task = {
        ...created,
        state: TaskState.ACTIVE,
        activatedAt: '2024-12-30T16:00:00.000Z',
        updatedAt: '2024-12-30T16:00:00.000Z',
      };

      // Completed
      const completed: Task = {
        ...activated,
        state: TaskState.COMPLETED,
        completedAt: '2024-12-30T16:45:00.000Z',
        updatedAt: '2024-12-30T16:45:00.000Z',
      };

      expect(created.state).toBe(TaskState.PENDING);
      expect(activated.state).toBe(TaskState.ACTIVE);
      expect(activated.activatedAt).toBeDefined();
      expect(completed.state).toBe(TaskState.COMPLETED);
      expect(completed.completedAt).toBeDefined();
    });

    it('should model daily habit tasks', () => {
      const dailyHabit: Task = {
        id: 'daily-exercise',
        text: 'Morning workout',
        type: TaskType.DAILY,
        state: TaskState.PENDING,
        // No dueAt for daily tasks
        notification: {
          enabled: true,
          reminderMinutes: 0, // Immediate notification
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isReactivation: false,
      };

      expect(dailyHabit.type).toBe(TaskType.DAILY);
      expect(dailyHabit.dueAt).toBeUndefined();
      expect(dailyHabit.notification?.reminderMinutes).toBe(0);
    });

    it('should model reactivated tasks', () => {
      const reactivated: Task = {
        id: 'reactivated-task',
        text: 'Previously failed task',
        type: TaskType.ONE_TIME,
        state: TaskState.PENDING,
        dueAt: '2025-01-10T14:00:00.000Z',
        createdAt: '2024-12-01T00:00:00.000Z',
        failedAt: '2024-12-20T18:00:00.000Z',
        updatedAt: '2025-01-01T10:00:00.000Z',
        isReactivation: true,
      };

      expect(reactivated.isReactivation).toBe(true);
      expect(reactivated.failedAt).toBeDefined();
      expect(reactivated.state).toBe(TaskState.PENDING);
    });
  });
});