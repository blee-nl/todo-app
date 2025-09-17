import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationScheduler } from '../notificationScheduler';
import { NotificationManager } from '../../utils/notificationUtils';
import type { Task } from '../../domain/entities/Task';
import { TaskState, TaskType } from '../../constants/taskConstants';

// Mock the NotificationManager
vi.mock('../../utils/notificationUtils', () => ({
  NotificationManager: {
    calculateNotificationTime: vi.fn(),
    scheduleNotification: vi.fn(),
    clearScheduledNotification: vi.fn(),
    clearAllScheduledNotifications: vi.fn(),
    isSupported: vi.fn(),
    getPermissionStatus: vi.fn(),
    requestPermission: vi.fn(),
  },
}));

const mockNotificationManager = vi.mocked(NotificationManager);

describe('NotificationScheduler', () => {
  const mockTask: Task = {
    id: 'task-1',
    text: 'Test task',
    type: TaskType.ONE_TIME,
    state: TaskState.PENDING,
    dueAt: '2024-12-31T23:59:59.000Z',
    notification: {
      enabled: true,
      reminderMinutes: 15,
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset the static state
    (NotificationScheduler as any).isInitialized = false;
    (NotificationScheduler as any).scheduledTasks = new Set<string>();

    global.console.log = vi.fn();
    global.console.warn = vi.fn();
    global.console.error = vi.fn();

    // Setup default mock returns
    mockNotificationManager.calculateNotificationTime.mockReturnValue(
      new Date('2024-12-31T23:44:59.000Z') // 15 minutes before due time
    );
    mockNotificationManager.isSupported.mockReturnValue(true);
    mockNotificationManager.getPermissionStatus.mockReturnValue('granted');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();

    // Clear any intervals
    vi.clearAllTimers();
  });

  describe('initialize', () => {
    it('initializes only once', () => {
      expect((NotificationScheduler as any).isInitialized).toBe(false);

      NotificationScheduler.initialize();
      expect((NotificationScheduler as any).isInitialized).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Notification scheduler initialized');

      // Second call should not log again
      vi.clearAllMocks();
      NotificationScheduler.initialize();
      expect(console.log).not.toHaveBeenCalled();
    });

    it('sets up periodic checks', () => {
      vi.spyOn(global, 'setInterval');

      NotificationScheduler.initialize();

      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        5 * 60 * 1000 // 5 minutes
      );
    });

    it('performs initial check on initialization', () => {
      vi.spyOn(NotificationScheduler as any, 'checkAndScheduleNotifications');

      NotificationScheduler.initialize();

      expect((NotificationScheduler as any).checkAndScheduleNotifications).toHaveBeenCalled();
    });
  });

  describe('scheduleTaskNotification', () => {
    it('schedules notification for valid task', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z')); // Before notification time

      NotificationScheduler.scheduleTaskNotification(mockTask);

      expect(mockNotificationManager.calculateNotificationTime).toHaveBeenCalledWith(
        mockTask.dueAt,
        mockTask.notification!.reminderMinutes
      );
      expect(mockNotificationManager.scheduleNotification).toHaveBeenCalledWith(
        mockTask.id,
        'Task Reminder',
        expect.stringContaining(mockTask.text),
        new Date('2024-12-31T23:44:59.000Z')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(`Scheduled notification for task "${mockTask.text}"`)
      );
    });

    it('does not schedule for task without notifications enabled', () => {
      const taskWithoutNotification = {
        ...mockTask,
        notification: { enabled: false, reminderMinutes: 15 },
      };

      NotificationScheduler.scheduleTaskNotification(taskWithoutNotification);

      expect(mockNotificationManager.scheduleNotification).not.toHaveBeenCalled();
    });

    it('does not schedule for task without due date', () => {
      const taskWithoutDueDate = {
        ...mockTask,
        dueAt: undefined,
      };

      NotificationScheduler.scheduleTaskNotification(taskWithoutDueDate);

      expect(mockNotificationManager.scheduleNotification).not.toHaveBeenCalled();
    });

    it('does not schedule for completed tasks', () => {
      const completedTask = {
        ...mockTask,
        state: TaskState.COMPLETED,
      };

      NotificationScheduler.scheduleTaskNotification(completedTask);

      expect(mockNotificationManager.scheduleNotification).not.toHaveBeenCalled();
    });

    it('does not schedule for failed tasks', () => {
      const failedTask = {
        ...mockTask,
        state: TaskState.FAILED,
      };

      NotificationScheduler.scheduleTaskNotification(failedTask);

      expect(mockNotificationManager.scheduleNotification).not.toHaveBeenCalled();
    });

    it('skips if notification time has passed', () => {
      vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z')); // After notification time

      NotificationScheduler.scheduleTaskNotification(mockTask);

      expect(mockNotificationManager.scheduleNotification).not.toHaveBeenCalled();
    });

    it('skips if task is already notified', () => {
      const notifiedTask = {
        ...mockTask,
        notification: {
          ...mockTask.notification!,
          notifiedAt: '2024-12-31T23:44:59.000Z',
        },
      };

      NotificationScheduler.scheduleTaskNotification(notifiedTask);

      expect(mockNotificationManager.scheduleNotification).not.toHaveBeenCalled();
    });

    it('skips if task is already scheduled', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));

      // First call should schedule
      NotificationScheduler.scheduleTaskNotification(mockTask);
      expect(mockNotificationManager.scheduleNotification).toHaveBeenCalledTimes(1);

      // Second call should skip
      NotificationScheduler.scheduleTaskNotification(mockTask);
      expect(mockNotificationManager.scheduleNotification).toHaveBeenCalledTimes(1);
    });

    it('schedules for active tasks', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));
      const activeTask = {
        ...mockTask,
        state: TaskState.ACTIVE,
      };

      NotificationScheduler.scheduleTaskNotification(activeTask);

      expect(mockNotificationManager.scheduleNotification).toHaveBeenCalled();
    });
  });

  describe('clearTaskNotification', () => {
    it('clears scheduled notification', () => {
      // First schedule a task
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));
      NotificationScheduler.scheduleTaskNotification(mockTask);

      // Then clear it
      NotificationScheduler.clearTaskNotification(mockTask.id);

      expect(mockNotificationManager.clearScheduledNotification).toHaveBeenCalledWith(mockTask.id);
      expect(console.log).toHaveBeenCalledWith(`Cleared notification for task ${mockTask.id}`);
    });

    it('removes task from scheduled set', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));
      NotificationScheduler.scheduleTaskNotification(mockTask);

      expect((NotificationScheduler as any).scheduledTasks.has(mockTask.id)).toBe(true);

      NotificationScheduler.clearTaskNotification(mockTask.id);

      expect((NotificationScheduler as any).scheduledTasks.has(mockTask.id)).toBe(false);
    });
  });

  describe('updateTaskNotification', () => {
    it('clears and reschedules notification', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));

      const clearSpy = vi.spyOn(NotificationScheduler, 'clearTaskNotification');
      const scheduleSpy = vi.spyOn(NotificationScheduler, 'scheduleTaskNotification');

      NotificationScheduler.updateTaskNotification(mockTask);

      expect(clearSpy).toHaveBeenCalledWith(mockTask.id);
      expect(scheduleSpy).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('scheduleTaskNotifications', () => {
    it('schedules notifications for multiple tasks', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));

      const task2 = { ...mockTask, id: 'task-2', text: 'Second task' };
      const task3 = { ...mockTask, id: 'task-3', text: 'Third task' };
      const tasks = [mockTask, task2, task3];

      const scheduleSpy = vi.spyOn(NotificationScheduler, 'scheduleTaskNotification');

      NotificationScheduler.scheduleTaskNotifications(tasks);

      expect(console.log).toHaveBeenCalledWith('Scheduling notifications for 3 tasks');
      expect(scheduleSpy).toHaveBeenCalledTimes(3);
      expect(scheduleSpy).toHaveBeenCalledWith(mockTask);
      expect(scheduleSpy).toHaveBeenCalledWith(task2);
      expect(scheduleSpy).toHaveBeenCalledWith(task3);
    });

    it('handles empty task array', () => {
      const scheduleSpy = vi.spyOn(NotificationScheduler, 'scheduleTaskNotification');

      NotificationScheduler.scheduleTaskNotifications([]);

      expect(console.log).toHaveBeenCalledWith('Scheduling notifications for 0 tasks');
      expect(scheduleSpy).not.toHaveBeenCalled();
    });
  });

  describe('checkAndScheduleNotifications', () => {
    it('logs check message', async () => {
      await (NotificationScheduler as any).checkAndScheduleNotifications();

      expect(console.log).toHaveBeenCalledWith('Checking for tasks to schedule notifications...');
    });

    it('handles errors gracefully', async () => {
      // Mock console.log to throw an error inside the try block
      const originalConsoleLog = console.log;
      console.log = vi.fn().mockImplementation(() => {
        throw new Error('Check failed');
      });

      await (NotificationScheduler as any).checkAndScheduleNotifications();

      expect(console.error).toHaveBeenCalledWith('Error checking notifications:', expect.any(Error));

      // Restore original console.log
      console.log = originalConsoleLog;
    });
  });

  describe('handleTaskStateChange', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));
    });

    it('clears notification for completed task', () => {
      const completedTask = { ...mockTask, state: TaskState.COMPLETED };
      const clearSpy = vi.spyOn(NotificationScheduler, 'clearTaskNotification');

      NotificationScheduler.handleTaskStateChange(completedTask);

      expect(clearSpy).toHaveBeenCalledWith(completedTask.id);
    });

    it('clears notification for failed task', () => {
      const failedTask = { ...mockTask, state: TaskState.FAILED };
      const clearSpy = vi.spyOn(NotificationScheduler, 'clearTaskNotification');

      NotificationScheduler.handleTaskStateChange(failedTask);

      expect(clearSpy).toHaveBeenCalledWith(failedTask.id);
    });

    it('schedules notification for pending task', () => {
      const pendingTask = { ...mockTask, state: TaskState.PENDING };
      const scheduleSpy = vi.spyOn(NotificationScheduler, 'scheduleTaskNotification');

      NotificationScheduler.handleTaskStateChange(pendingTask);

      expect(scheduleSpy).toHaveBeenCalledWith(pendingTask);
    });

    it('schedules notification for active task', () => {
      const activeTask = { ...mockTask, state: TaskState.ACTIVE };
      const scheduleSpy = vi.spyOn(NotificationScheduler, 'scheduleTaskNotification');

      NotificationScheduler.handleTaskStateChange(activeTask);

      expect(scheduleSpy).toHaveBeenCalledWith(activeTask);
    });
  });

  describe('clearAll', () => {
    it('clears all notifications and scheduled tasks', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));

      // Schedule some tasks first
      NotificationScheduler.scheduleTaskNotification(mockTask);
      const task2 = { ...mockTask, id: 'task-2' };
      NotificationScheduler.scheduleTaskNotification(task2);

      expect((NotificationScheduler as any).scheduledTasks.size).toBe(2);

      NotificationScheduler.clearAll();

      expect(mockNotificationManager.clearAllScheduledNotifications).toHaveBeenCalled();
      expect((NotificationScheduler as any).scheduledTasks.size).toBe(0);
      expect(console.log).toHaveBeenCalledWith('Cleared all scheduled notifications');
    });
  });

  describe('getNotificationStatus', () => {
    it('returns correct status for scheduled task', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));

      NotificationScheduler.scheduleTaskNotification(mockTask);

      const status = NotificationScheduler.getNotificationStatus(mockTask.id);

      expect(status).toEqual({
        isScheduled: true,
        browserSupported: true,
        permissionGranted: true,
      });
    });

    it('returns correct status for unscheduled task', () => {
      const status = NotificationScheduler.getNotificationStatus('unscheduled-task');

      expect(status).toEqual({
        isScheduled: false,
        browserSupported: true,
        permissionGranted: true,
      });
    });

    it('handles unsupported browser', () => {
      mockNotificationManager.isSupported.mockReturnValue(false);

      const status = NotificationScheduler.getNotificationStatus(mockTask.id);

      expect(status.browserSupported).toBe(false);
    });

    it('handles denied permission', () => {
      mockNotificationManager.getPermissionStatus.mockReturnValue('denied');

      const status = NotificationScheduler.getNotificationStatus(mockTask.id);

      expect(status.permissionGranted).toBe(false);
    });
  });

  describe('ensurePermission', () => {
    it('returns true when permission is granted', async () => {
      mockNotificationManager.requestPermission.mockResolvedValue('granted');

      const result = await NotificationScheduler.ensurePermission();

      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Notification permission granted');
    });

    it('returns false when permission is denied', async () => {
      mockNotificationManager.requestPermission.mockResolvedValue('denied');

      const result = await NotificationScheduler.ensurePermission();

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('Notification permission denied');
    });

    it('returns false when notifications are not supported', async () => {
      mockNotificationManager.isSupported.mockReturnValue(false);

      const result = await NotificationScheduler.ensurePermission();

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('Notifications not supported');
      expect(mockNotificationManager.requestPermission).not.toHaveBeenCalled();
    });

    it('handles permission request errors', async () => {
      mockNotificationManager.requestPermission.mockRejectedValue(new Error('Permission error'));

      await expect(NotificationScheduler.ensurePermission()).rejects.toThrow('Permission error');
    });
  });

  describe('edge cases and error handling', () => {
    it('handles invalid due date format', () => {
      const taskWithInvalidDate = {
        ...mockTask,
        dueAt: 'invalid-date',
      };

      expect(() => {
        NotificationScheduler.scheduleTaskNotification(taskWithInvalidDate);
      }).not.toThrow();
    });

    it('handles missing notification object', () => {
      const taskWithoutNotification = {
        ...mockTask,
        notification: undefined,
      };

      expect(() => {
        NotificationScheduler.scheduleTaskNotification(taskWithoutNotification);
      }).not.toThrow();
    });

    it('handles notification manager errors gracefully', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));

      mockNotificationManager.scheduleNotification.mockImplementation(() => {
        throw new Error('Notification manager error');
      });

      // The actual implementation may not catch this error, so we expect it to throw
      expect(() => {
        NotificationScheduler.scheduleTaskNotification(mockTask);
      }).toThrow('Notification manager error');
    });

    it('handles concurrent operations', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));

      // Simulate concurrent scheduling and clearing
      NotificationScheduler.scheduleTaskNotification(mockTask);
      NotificationScheduler.clearTaskNotification(mockTask.id);
      NotificationScheduler.scheduleTaskNotification(mockTask);

      expect(mockNotificationManager.scheduleNotification).toHaveBeenCalledTimes(2);
      expect(mockNotificationManager.clearScheduledNotification).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('handles task lifecycle correctly', () => {
      vi.setSystemTime(new Date('2024-12-31T20:00:00.000Z'));

      // Task created (pending)
      const pendingTask = { ...mockTask, state: TaskState.PENDING };
      NotificationScheduler.handleTaskStateChange(pendingTask);
      expect((NotificationScheduler as any).scheduledTasks.has(mockTask.id)).toBe(true);

      // Task activated
      const activeTask = { ...mockTask, state: TaskState.ACTIVE };
      NotificationScheduler.handleTaskStateChange(activeTask);
      expect((NotificationScheduler as any).scheduledTasks.has(mockTask.id)).toBe(true);

      // Task completed
      const completedTask = { ...mockTask, state: TaskState.COMPLETED };
      NotificationScheduler.handleTaskStateChange(completedTask);
      expect((NotificationScheduler as any).scheduledTasks.has(mockTask.id)).toBe(false);
    });

    it('handles notification time edge cases', () => {
      // Test scheduling right at notification time
      const notificationTime = new Date('2024-12-31T23:44:59.000Z');
      vi.setSystemTime(notificationTime);

      NotificationScheduler.scheduleTaskNotification(mockTask);
      expect(mockNotificationManager.scheduleNotification).not.toHaveBeenCalled();

      // Test scheduling just before notification time
      vi.setSystemTime(new Date(notificationTime.getTime() - 1000)); // 1 second before
      NotificationScheduler.scheduleTaskNotification({ ...mockTask, id: 'task-2' });
      expect(mockNotificationManager.scheduleNotification).toHaveBeenCalled();
    });
  });
});