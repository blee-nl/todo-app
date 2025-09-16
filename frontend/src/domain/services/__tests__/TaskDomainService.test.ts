import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskDomainService } from '../TaskDomainService';
import { TaskType, TaskState } from '../../../constants/taskConstants';
import type { Task, TaskTypeValue, TaskStateValue } from '../../entities/Task';

describe('TaskDomainService', () => {
  // Mock task factory function
  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'test-id',
    text: 'Test task',
    type: TaskType.ONE_TIME,
    state: TaskState.PENDING,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    dueAt: '2026-01-16T14:00:00Z', // Set to far future to avoid overdue by default
    isReactivation: false,
    notification: {
      enabled: false,
      reminderMinutes: 15,
    },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task Type Checking', () => {
    describe('isOneTimeTask', () => {
      it('should return true for one-time task type', () => {
        expect(TaskDomainService.isOneTimeTask(TaskType.ONE_TIME)).toBe(true);
      });

      it('should return false for daily task type', () => {
        expect(TaskDomainService.isOneTimeTask(TaskType.DAILY)).toBe(false);
      });

      it('should handle type casting correctly', () => {
        expect(TaskDomainService.isOneTimeTask('one-time' as TaskTypeValue)).toBe(true);
        expect(TaskDomainService.isOneTimeTask('daily' as TaskTypeValue)).toBe(false);
      });
    });

    describe('isDailyTask', () => {
      it('should return true for daily task type', () => {
        expect(TaskDomainService.isDailyTask(TaskType.DAILY)).toBe(true);
      });

      it('should return false for one-time task type', () => {
        expect(TaskDomainService.isDailyTask(TaskType.ONE_TIME)).toBe(false);
      });

      it('should handle type casting correctly', () => {
        expect(TaskDomainService.isDailyTask('daily' as TaskTypeValue)).toBe(true);
        expect(TaskDomainService.isDailyTask('one-time' as TaskTypeValue)).toBe(false);
      });
    });
  });

  describe('Task State Checking', () => {
    describe('isPendingTask', () => {
      it('should return true for pending state', () => {
        expect(TaskDomainService.isPendingTask(TaskState.PENDING)).toBe(true);
      });

      it('should return false for non-pending states', () => {
        expect(TaskDomainService.isPendingTask(TaskState.ACTIVE)).toBe(false);
        expect(TaskDomainService.isPendingTask(TaskState.COMPLETED)).toBe(false);
        expect(TaskDomainService.isPendingTask(TaskState.FAILED)).toBe(false);
      });

      it('should handle type casting correctly', () => {
        expect(TaskDomainService.isPendingTask('pending' as TaskStateValue)).toBe(true);
        expect(TaskDomainService.isPendingTask('active' as TaskStateValue)).toBe(false);
      });
    });

    describe('isActiveTask', () => {
      it('should return true for active state', () => {
        expect(TaskDomainService.isActiveTask(TaskState.ACTIVE)).toBe(true);
      });

      it('should return false for non-active states', () => {
        expect(TaskDomainService.isActiveTask(TaskState.PENDING)).toBe(false);
        expect(TaskDomainService.isActiveTask(TaskState.COMPLETED)).toBe(false);
        expect(TaskDomainService.isActiveTask(TaskState.FAILED)).toBe(false);
      });
    });

    describe('isCompletedTask', () => {
      it('should return true for completed state', () => {
        expect(TaskDomainService.isCompletedTask(TaskState.COMPLETED)).toBe(true);
      });

      it('should return false for non-completed states', () => {
        expect(TaskDomainService.isCompletedTask(TaskState.PENDING)).toBe(false);
        expect(TaskDomainService.isCompletedTask(TaskState.ACTIVE)).toBe(false);
        expect(TaskDomainService.isCompletedTask(TaskState.FAILED)).toBe(false);
      });
    });

    describe('isFailedTask', () => {
      it('should return true for failed state', () => {
        expect(TaskDomainService.isFailedTask(TaskState.FAILED)).toBe(true);
      });

      it('should return false for non-failed states', () => {
        expect(TaskDomainService.isFailedTask(TaskState.PENDING)).toBe(false);
        expect(TaskDomainService.isFailedTask(TaskState.ACTIVE)).toBe(false);
        expect(TaskDomainService.isFailedTask(TaskState.COMPLETED)).toBe(false);
      });
    });
  });

  describe('Task Status Logic', () => {
    describe('isOverdue', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should return false for task without due date', () => {
        const task = createMockTask({ dueAt: undefined });
        expect(TaskDomainService.isOverdue(task)).toBe(false);
      });

      it('should return false for task with null due date', () => {
        const task = createMockTask({ dueAt: null as any });
        expect(TaskDomainService.isOverdue(task)).toBe(false);
      });

      it('should return true for task with past due date', () => {
        const task = createMockTask({ dueAt: '2025-01-15T10:00:00Z' }); // 2 hours ago
        expect(TaskDomainService.isOverdue(task)).toBe(true);
      });

      it('should return false for task with future due date', () => {
        const task = createMockTask({ dueAt: '2025-01-15T14:00:00Z' }); // 2 hours from now
        expect(TaskDomainService.isOverdue(task)).toBe(false);
      });

      it('should return false for task with current time as due date', () => {
        const task = createMockTask({ dueAt: '2025-01-15T12:00:00Z' }); // exactly now
        expect(TaskDomainService.isOverdue(task)).toBe(false);
      });

      it('should handle invalid date strings', () => {
        const task = createMockTask({ dueAt: 'invalid-date' });
        expect(TaskDomainService.isOverdue(task)).toBe(false);
      });

      it('should handle edge case of 1 minute overdue', () => {
        const task = createMockTask({ dueAt: '2025-01-15T11:59:00Z' }); // 1 minute ago
        expect(TaskDomainService.isOverdue(task)).toBe(true);
      });
    });
  });

  describe('Task Action Permissions', () => {
    describe('canBeActivated', () => {
      it('should return true for pending tasks', () => {
        const task = createMockTask({ state: TaskState.PENDING });
        expect(TaskDomainService.canBeActivated(task)).toBe(true);
      });

      it('should return false for non-pending tasks', () => {
        const activeTask = createMockTask({ state: TaskState.ACTIVE });
        const completedTask = createMockTask({ state: TaskState.COMPLETED });
        const failedTask = createMockTask({ state: TaskState.FAILED });

        expect(TaskDomainService.canBeActivated(activeTask)).toBe(false);
        expect(TaskDomainService.canBeActivated(completedTask)).toBe(false);
        expect(TaskDomainService.canBeActivated(failedTask)).toBe(false);
      });
    });

    describe('canBeCompleted', () => {
      it('should return true for active tasks', () => {
        const task = createMockTask({ state: TaskState.ACTIVE });
        expect(TaskDomainService.canBeCompleted(task)).toBe(true);
      });

      it('should return false for non-active tasks', () => {
        const pendingTask = createMockTask({ state: TaskState.PENDING });
        const completedTask = createMockTask({ state: TaskState.COMPLETED });
        const failedTask = createMockTask({ state: TaskState.FAILED });

        expect(TaskDomainService.canBeCompleted(pendingTask)).toBe(false);
        expect(TaskDomainService.canBeCompleted(completedTask)).toBe(false);
        expect(TaskDomainService.canBeCompleted(failedTask)).toBe(false);
      });
    });

    describe('canBeFailed', () => {
      it('should return true for active tasks', () => {
        const task = createMockTask({ state: TaskState.ACTIVE });
        expect(TaskDomainService.canBeFailed(task)).toBe(true);
      });

      it('should return false for non-active tasks', () => {
        const pendingTask = createMockTask({ state: TaskState.PENDING });
        const completedTask = createMockTask({ state: TaskState.COMPLETED });
        const failedTask = createMockTask({ state: TaskState.FAILED });

        expect(TaskDomainService.canBeFailed(pendingTask)).toBe(false);
        expect(TaskDomainService.canBeFailed(completedTask)).toBe(false);
        expect(TaskDomainService.canBeFailed(failedTask)).toBe(false);
      });
    });

    describe('canBeReactivated', () => {
      it('should return true for completed tasks', () => {
        const task = createMockTask({ state: TaskState.COMPLETED });
        expect(TaskDomainService.canBeReactivated(task)).toBe(true);
      });

      it('should return true for failed tasks', () => {
        const task = createMockTask({ state: TaskState.FAILED });
        expect(TaskDomainService.canBeReactivated(task)).toBe(true);
      });

      it('should return false for pending and active tasks', () => {
        const pendingTask = createMockTask({ state: TaskState.PENDING });
        const activeTask = createMockTask({ state: TaskState.ACTIVE });

        expect(TaskDomainService.canBeReactivated(pendingTask)).toBe(false);
        expect(TaskDomainService.canBeReactivated(activeTask)).toBe(false);
      });
    });

    describe('canBeEdited', () => {
      it('should return true for pending tasks', () => {
        const task = createMockTask({ state: TaskState.PENDING });
        expect(TaskDomainService.canBeEdited(task)).toBe(true);
      });

      it('should return true for active tasks', () => {
        const task = createMockTask({ state: TaskState.ACTIVE });
        expect(TaskDomainService.canBeEdited(task)).toBe(true);
      });

      it('should return false for completed and failed tasks', () => {
        const completedTask = createMockTask({ state: TaskState.COMPLETED });
        const failedTask = createMockTask({ state: TaskState.FAILED });

        expect(TaskDomainService.canBeEdited(completedTask)).toBe(false);
        expect(TaskDomainService.canBeEdited(failedTask)).toBe(false);
      });
    });
  });

  describe('Task Requirements', () => {
    describe('requiresDueDate', () => {
      it('should return true for one-time tasks', () => {
        expect(TaskDomainService.requiresDueDate(TaskType.ONE_TIME)).toBe(true);
      });

      it('should return false for daily tasks', () => {
        expect(TaskDomainService.requiresDueDate(TaskType.DAILY)).toBe(false);
      });

      it('should handle type casting correctly', () => {
        expect(TaskDomainService.requiresDueDate('one-time' as TaskTypeValue)).toBe(true);
        expect(TaskDomainService.requiresDueDate('daily' as TaskTypeValue)).toBe(false);
      });
    });
  });

  describe('Task Validation', () => {
    describe('validateTaskText', () => {
      it('should return valid for normal text', () => {
        const result = TaskDomainService.validateTaskText('Valid task text');
        expect(result).toEqual({ isValid: true });
      });

      it('should return invalid for empty text', () => {
        const result = TaskDomainService.validateTaskText('');
        expect(result).toEqual({
          isValid: false,
          error: 'Task text cannot be empty',
        });
      });

      it('should return invalid for whitespace-only text', () => {
        const result = TaskDomainService.validateTaskText('   \n\t   ');
        expect(result).toEqual({
          isValid: false,
          error: 'Task text cannot be empty',
        });
      });

      it('should return invalid for text exceeding 500 characters', () => {
        const longText = 'A'.repeat(501);
        const result = TaskDomainService.validateTaskText(longText);
        expect(result).toEqual({
          isValid: false,
          error: 'Task text cannot exceed 500 characters',
        });
      });

      it('should return valid for text exactly 500 characters', () => {
        const maxText = 'A'.repeat(500);
        const result = TaskDomainService.validateTaskText(maxText);
        expect(result).toEqual({ isValid: true });
      });

      it('should handle special characters and unicode', () => {
        const specialText = 'Task with émojis 😀 and "quotes" & <tags>';
        const result = TaskDomainService.validateTaskText(specialText);
        expect(result).toEqual({ isValid: true });
      });

      it('should trim whitespace before validation', () => {
        const result = TaskDomainService.validateTaskText('  Valid task  ');
        expect(result).toEqual({ isValid: true });
      });
    });

    describe('validateDueDate', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should return valid when due date is not required and not provided', () => {
        const result = TaskDomainService.validateDueDate('', TaskType.DAILY);
        expect(result).toEqual({ isValid: true });
      });

      it('should return invalid when due date is required but not provided', () => {
        const result = TaskDomainService.validateDueDate('', TaskType.ONE_TIME);
        expect(result).toEqual({
          isValid: false,
          error: 'Due date is required for one-time tasks',
        });
      });

      it('should return invalid for invalid date format', () => {
        const result = TaskDomainService.validateDueDate('invalid-date', TaskType.ONE_TIME);
        expect(result).toEqual({
          isValid: false,
          error: 'Invalid due date format',
        });
      });

      it('should return invalid for past due date', () => {
        const pastDate = '2025-01-15T10:00:00Z'; // 2 hours ago
        const result = TaskDomainService.validateDueDate(pastDate, TaskType.ONE_TIME);
        expect(result).toEqual({
          isValid: false,
          error: 'Due date cannot be in the past',
        });
      });

      it('should return valid for future due date', () => {
        const futureDate = '2025-01-15T14:00:00Z'; // 2 hours from now
        const result = TaskDomainService.validateDueDate(futureDate, TaskType.ONE_TIME);
        expect(result).toEqual({ isValid: true });
      });

      it('should return valid for current time as due date', () => {
        const currentDate = '2025-01-15T12:00:00Z'; // exactly now
        const result = TaskDomainService.validateDueDate(currentDate, TaskType.ONE_TIME);
        expect(result).toEqual({ isValid: true });
      });

      it('should handle edge case of 1 second in the past', () => {
        const pastDate = '2025-01-15T11:59:59Z'; // 1 second ago
        const result = TaskDomainService.validateDueDate(pastDate, TaskType.ONE_TIME);
        expect(result).toEqual({
          isValid: false,
          error: 'Due date cannot be in the past',
        });
      });

      it('should return valid for daily tasks with past due date (not required)', () => {
        const pastDate = '2025-01-15T10:00:00Z'; // 2 hours ago
        const result = TaskDomainService.validateDueDate(pastDate, TaskType.DAILY);
        expect(result).toEqual({
          isValid: false,
          error: 'Due date cannot be in the past',
        });
      });

      it('should handle empty string and undefined', () => {
        expect(TaskDomainService.validateDueDate('', TaskType.DAILY)).toEqual({ isValid: true });
        expect(TaskDomainService.validateDueDate('', TaskType.ONE_TIME)).toEqual({
          isValid: false,
          error: 'Due date is required for one-time tasks',
        });
      });
    });
  });

  describe('Task Display Logic', () => {
    describe('getTaskDisplayBadges', () => {
      it('should return type badge by default', () => {
        const task = createMockTask({ type: TaskType.ONE_TIME });
        const badges = TaskDomainService.getTaskDisplayBadges(task);

        expect(badges).toEqual([
          { variant: 'success', text: 'one-time' },
        ]);
      });

      it('should include reactivation badge when task is reactivated', () => {
        const task = createMockTask({
          type: TaskType.DAILY,
          isReactivation: true,
        });
        const badges = TaskDomainService.getTaskDisplayBadges(task);

        expect(badges).toEqual([
          { variant: 'success', text: 'daily' },
          { variant: 'purple', text: 'Re-activated' },
        ]);
      });

      it('should include overdue badge when task is overdue', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T16:00:00Z'));

        const task = createMockTask({
          type: TaskType.ONE_TIME,
          dueAt: '2025-01-15T14:00:00Z', // 2 hours ago
        });
        const badges = TaskDomainService.getTaskDisplayBadges(task);

        expect(badges).toEqual([
          { variant: 'success', text: 'one-time' },
          { variant: 'danger', text: 'Overdue' },
        ]);

        vi.useRealTimers();
      });

      it('should include both reactivation and overdue badges', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T16:00:00Z'));

        const task = createMockTask({
          type: TaskType.DAILY,
          dueAt: '2025-01-15T14:00:00Z', // 2 hours ago
          isReactivation: true,
        });
        const badges = TaskDomainService.getTaskDisplayBadges(task);

        expect(badges).toEqual([
          { variant: 'success', text: 'daily' },
          { variant: 'purple', text: 'Re-activated' },
          { variant: 'danger', text: 'Overdue' },
        ]);

        vi.useRealTimers();
      });

      it('should handle different task types', () => {
        const oneTimeTask = createMockTask({ type: TaskType.ONE_TIME });
        const dailyTask = createMockTask({ type: TaskType.DAILY });

        expect(TaskDomainService.getTaskDisplayBadges(oneTimeTask)[0].text).toBe('one-time');
        expect(TaskDomainService.getTaskDisplayBadges(dailyTask)[0].text).toBe('daily');
      });
    });

    describe('getTaskPriority', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T16:00:00Z'));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should return priority 1 for overdue tasks', () => {
        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z', // 2 hours ago
          state: TaskState.ACTIVE,
        });
        expect(TaskDomainService.getTaskPriority(task)).toBe(1);
      });

      it('should return priority 2 for active tasks', () => {
        const task = createMockTask({ state: TaskState.ACTIVE });
        expect(TaskDomainService.getTaskPriority(task)).toBe(2);
      });

      it('should return priority 3 for pending tasks', () => {
        const task = createMockTask({ state: TaskState.PENDING });
        expect(TaskDomainService.getTaskPriority(task)).toBe(3);
      });

      it('should return priority 4 for failed tasks', () => {
        const task = createMockTask({ state: TaskState.FAILED });
        expect(TaskDomainService.getTaskPriority(task)).toBe(4);
      });

      it('should return priority 5 for completed tasks', () => {
        const task = createMockTask({ state: TaskState.COMPLETED });
        expect(TaskDomainService.getTaskPriority(task)).toBe(5);
      });

      it('should return priority 6 for unknown states', () => {
        const task = createMockTask({ state: 'unknown' as any });
        expect(TaskDomainService.getTaskPriority(task)).toBe(6);
      });

      it('should prioritize overdue over state', () => {
        const overdueCompletedTask = createMockTask({
          dueAt: '2025-01-15T14:00:00Z', // 2 hours ago
          state: TaskState.COMPLETED,
        });
        // Overdue takes precedence over completed state
        expect(TaskDomainService.getTaskPriority(overdueCompletedTask)).toBe(1);
      });
    });
  });

  describe('Notification Logic', () => {
    describe('hasNotifications', () => {
      it('should return true when notifications are enabled', () => {
        const task = createMockTask({
          notification: { enabled: true, reminderMinutes: 15 },
        });
        expect(TaskDomainService.hasNotifications(task)).toBe(true);
      });

      it('should return false when notifications are disabled', () => {
        const task = createMockTask({
          notification: { enabled: false, reminderMinutes: 15 },
        });
        expect(TaskDomainService.hasNotifications(task)).toBe(false);
      });

      it('should return false when notification object is undefined', () => {
        const task = createMockTask({ notification: undefined });
        expect(TaskDomainService.hasNotifications(task)).toBe(false);
      });

      it('should return false when notification object is null', () => {
        const task = createMockTask({ notification: null as any });
        expect(TaskDomainService.hasNotifications(task)).toBe(false);
      });

      it('should return false when notification object has no enabled property', () => {
        const task = createMockTask({
          notification: { reminderMinutes: 15 } as any,
        });
        expect(TaskDomainService.hasNotifications(task)).toBe(false);
      });
    });

    describe('isNotificationScheduled', () => {
      it('should return true when notifications enabled, has due date, and not notified', () => {
        const task = createMockTask({
          dueAt: '2025-01-16T14:00:00Z',
          notification: {
            enabled: true,
            reminderMinutes: 15,
          },
        });
        expect(TaskDomainService.isNotificationScheduled(task)).toBe(true);
      });

      it('should return false when notifications are disabled', () => {
        const task = createMockTask({
          dueAt: '2025-01-16T14:00:00Z',
          notification: {
            enabled: false,
            reminderMinutes: 15,
          },
        });
        expect(TaskDomainService.isNotificationScheduled(task)).toBe(false);
      });

      it('should return false when no due date', () => {
        const task = createMockTask({
          dueAt: undefined,
          notification: {
            enabled: true,
            reminderMinutes: 15,
          },
        });
        expect(TaskDomainService.isNotificationScheduled(task)).toBe(false);
      });

      it('should return false when already notified', () => {
        const task = createMockTask({
          dueAt: '2025-01-16T14:00:00Z',
          notification: {
            enabled: true,
            reminderMinutes: 15,
            notifiedAt: '2025-01-15T12:00:00Z',
          },
        });
        expect(TaskDomainService.isNotificationScheduled(task)).toBe(false);
      });

      it('should return false when no notification object', () => {
        const task = createMockTask({
          dueAt: '2025-01-16T14:00:00Z',
          notification: undefined,
        });
        expect(TaskDomainService.isNotificationScheduled(task)).toBe(false);
      });
    });

    describe('getNotificationTime', () => {
      it('should return correct notification time', () => {
        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z',
          notification: {
            enabled: true,
            reminderMinutes: 30,
          },
        });

        const notificationTime = TaskDomainService.getNotificationTime(task);
        expect(notificationTime).toEqual(new Date('2025-01-15T13:30:00Z'));
      });

      it('should return null when notifications are disabled', () => {
        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z',
          notification: {
            enabled: false,
            reminderMinutes: 30,
          },
        });

        const notificationTime = TaskDomainService.getNotificationTime(task);
        expect(notificationTime).toBeNull();
      });

      it('should return null when no due date', () => {
        const task = createMockTask({
          dueAt: undefined,
          notification: {
            enabled: true,
            reminderMinutes: 30,
          },
        });

        const notificationTime = TaskDomainService.getNotificationTime(task);
        expect(notificationTime).toBeNull();
      });

      it('should return null when no reminder minutes', () => {
        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z',
          notification: {
            enabled: true,
            reminderMinutes: undefined as any,
          },
        });

        const notificationTime = TaskDomainService.getNotificationTime(task);
        expect(notificationTime).toBeNull();
      });

      it('should return null when no notification object', () => {
        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z',
          notification: undefined,
        });

        const notificationTime = TaskDomainService.getNotificationTime(task);
        expect(notificationTime).toBeNull();
      });

      it('should handle different reminder minutes correctly', () => {
        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z',
          notification: {
            enabled: true,
            reminderMinutes: 120, // 2 hours
          },
        });

        const notificationTime = TaskDomainService.getNotificationTime(task);
        expect(notificationTime).toEqual(new Date('2025-01-15T12:00:00Z'));
      });
    });

    describe('isNotificationDue', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T13:45:00Z'));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should return true when notification time has passed and not notified', () => {
        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z',
          notification: {
            enabled: true,
            reminderMinutes: 30, // notification at 13:30, current time is 13:45
          },
        });

        expect(TaskDomainService.isNotificationDue(task)).toBe(true);
      });

      it('should return false when notification time has not passed', () => {
        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z',
          notification: {
            enabled: true,
            reminderMinutes: 10, // notification at 13:50, current time is 13:45
          },
        });

        expect(TaskDomainService.isNotificationDue(task)).toBe(false);
      });

      it('should return false when already notified', () => {
        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z',
          notification: {
            enabled: true,
            reminderMinutes: 30,
            notifiedAt: '2025-01-15T13:30:00Z',
          },
        });

        expect(TaskDomainService.isNotificationDue(task)).toBe(false);
      });

      it('should return false when no notification time can be calculated', () => {
        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z',
          notification: {
            enabled: false,
            reminderMinutes: 30,
          },
        });

        expect(TaskDomainService.isNotificationDue(task)).toBe(false);
      });

      it('should return true at exactly notification time', () => {
        vi.setSystemTime(new Date('2025-01-15T13:30:00Z'));

        const task = createMockTask({
          dueAt: '2025-01-15T14:00:00Z',
          notification: {
            enabled: true,
            reminderMinutes: 30, // notification at exactly 13:30
          },
        });

        expect(TaskDomainService.isNotificationDue(task)).toBe(true);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle tasks with missing properties gracefully', () => {
      const partialTask = {
        id: 'partial',
        text: 'Partial task',
        type: TaskType.ONE_TIME,
        state: TaskState.PENDING,
      } as Task;

      // Should not throw errors
      expect(() => TaskDomainService.getTaskDisplayBadges(partialTask)).not.toThrow();
      expect(() => TaskDomainService.getTaskPriority(partialTask)).not.toThrow();
      expect(() => TaskDomainService.isOverdue(partialTask)).not.toThrow();
      expect(() => TaskDomainService.hasNotifications(partialTask)).not.toThrow();
    });

    it('should handle null and undefined values in notification logic', () => {
      const taskWithNulls = createMockTask({
        dueAt: null as any,
        notification: null as any,
      });

      expect(TaskDomainService.hasNotifications(taskWithNulls)).toBe(false);
      expect(TaskDomainService.isNotificationScheduled(taskWithNulls)).toBe(false);
      expect(TaskDomainService.getNotificationTime(taskWithNulls)).toBeNull();
      expect(TaskDomainService.isNotificationDue(taskWithNulls)).toBe(false);
    });

    it('should handle extreme date values', () => {
      const extremeTask = createMockTask({
        dueAt: '9999-12-31T23:59:59Z',
      });

      expect(() => TaskDomainService.isOverdue(extremeTask)).not.toThrow();
      expect(() => TaskDomainService.getTaskPriority(extremeTask)).not.toThrow();
    });

    it('should handle very long task text in validation', () => {
      const veryLongText = 'A'.repeat(10000);
      const result = TaskDomainService.validateTaskText(veryLongText);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Task text cannot exceed 500 characters');
    });
  });
});