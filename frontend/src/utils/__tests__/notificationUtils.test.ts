import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationManager, type NotificationPermission, type ScheduledNotification } from '../notificationUtils';
import type { NotificationOptions } from '../../types/notification';

// Mock browser APIs
const mockNotification = {
  permission: 'default' as NotificationPermission,
  requestPermission: vi.fn(),
  close: vi.fn(),
  onclick: null,
};

const mockServiceWorkerRegistration = {
  showNotification: vi.fn(),
};

const mockNavigator = {
  serviceWorker: {
    ready: Promise.resolve(mockServiceWorkerRegistration),
  },
};

// Global setup
Object.defineProperty(global, 'Notification', {
  value: vi.fn().mockImplementation((title, options) => ({
    title,
    ...options,
    close: mockNotification.close,
    onclick: null,
  })),
  configurable: true,
});

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  configurable: true,
});

Object.defineProperty(global, 'window', {
  value: {
    Notification: global.Notification,
    navigator: mockNavigator,
    setTimeout: vi.fn(global.setTimeout),
    clearTimeout: vi.fn(global.clearTimeout),
    focus: vi.fn(),
  },
  configurable: true,
});

// Make Notification.permission accessible
Object.defineProperty(global.Notification, 'permission', {
  get: () => mockNotification.permission,
  set: (value) => { mockNotification.permission = value; },
  configurable: true,
});

Object.defineProperty(global.Notification, 'requestPermission', {
  value: mockNotification.requestPermission,
  configurable: true,
});

describe('NotificationManager', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockNotification.permission = 'default'; // Default to default for most tests
    mockNotification.requestPermission.mockResolvedValue('granted');
    mockServiceWorkerRegistration.showNotification.mockResolvedValue(undefined);

    // Clear all scheduled notifications
    NotificationManager.clearAllScheduledNotifications();

    // Reset console mocks
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    NotificationManager.clearAllScheduledNotifications();
  });

  describe('Browser Support Detection', () => {
    it('should detect supported browsers', () => {
      expect(NotificationManager.isSupported()).toBe(true);
    });

    it('should detect unsupported browsers without Notification', () => {
      // Temporarily remove Notification from both global and window
      const originalNotification = global.Notification;
      const originalWindowNotification = (global as any).window.Notification;
      delete (global as any).Notification;
      delete (global as any).window.Notification;

      expect(NotificationManager.isSupported()).toBe(false);

      // Restore
      global.Notification = originalNotification;
      (global as any).window.Notification = originalWindowNotification;
    });

    it('should detect unsupported browsers without serviceWorker', () => {
      // Temporarily remove serviceWorker
      const originalServiceWorker = global.navigator.serviceWorker;
      delete (global.navigator as any).serviceWorker;

      expect(NotificationManager.isSupported()).toBe(false);

      // Restore
      global.navigator.serviceWorker = originalServiceWorker;
    });
  });

  describe('Permission Management', () => {
    it('should get permission status when supported', () => {
      mockNotification.permission = 'granted';
      expect(NotificationManager.getPermissionStatus()).toBe('granted');

      mockNotification.permission = 'denied';
      expect(NotificationManager.getPermissionStatus()).toBe('denied');

      mockNotification.permission = 'default';
      expect(NotificationManager.getPermissionStatus()).toBe('default');
    });

    it('should return denied when not supported', () => {
      const originalNotification = global.Notification;
      const originalWindowNotification = (global as any).window.Notification;
      delete (global as any).Notification;
      delete (global as any).window.Notification;

      expect(NotificationManager.getPermissionStatus()).toBe('denied');

      global.Notification = originalNotification;
      (global as any).window.Notification = originalWindowNotification;
    });

    it('should request permission successfully', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted');

      const result = await NotificationManager.requestPermission();
      expect(result).toBe('granted');
      expect(mockNotification.requestPermission).toHaveBeenCalled();
    });

    it('should return granted if permission already granted', async () => {
      mockNotification.permission = 'granted';

      const result = await NotificationManager.requestPermission();
      expect(result).toBe('granted');
      expect(mockNotification.requestPermission).not.toHaveBeenCalled();
    });

    it('should throw error when not supported', async () => {
      const originalNotification = global.Notification;
      const originalWindowNotification = (global as any).window.Notification;
      delete (global as any).Notification;
      delete (global as any).window.Notification;

      await expect(NotificationManager.requestPermission()).rejects.toThrow(
        'Notifications are not supported by this browser'
      );

      global.Notification = originalNotification;
      (global as any).window.Notification = originalWindowNotification;
    });

    it('should handle permission request errors', async () => {
      mockNotification.requestPermission.mockRejectedValue(new Error('Permission error'));

      const result = await NotificationManager.requestPermission();
      expect(result).toBe('denied');
      expect(console.error).toHaveBeenCalledWith('Error requesting notification permission:', expect.any(Error));
    });
  });

  describe('Show Immediate Notifications', () => {
    beforeEach(() => {
      mockNotification.permission = 'granted';
    });

    it('should show service worker notification when available', async () => {
      const title = 'Test Notification';
      const options: NotificationOptions = {
        body: 'Test body',
        icon: '/custom-icon.png',
        tag: 'test-tag',
      };

      await NotificationManager.showNotification(title, options);

      expect(mockServiceWorkerRegistration.showNotification).toHaveBeenCalledWith(title, {
        body: 'Test body',
        icon: '/custom-icon.png',
        badge: '/favicon.ico',
        tag: 'test-tag',
        data: undefined,
        requireInteraction: true,
      });
    });

    it('should use default icon when not provided', async () => {
      await NotificationManager.showNotification('Test', { body: 'Test body' });

      expect(mockServiceWorkerRegistration.showNotification).toHaveBeenCalledWith('Test', {
        body: 'Test body',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: undefined,
        data: undefined,
        requireInteraction: true,
      });
    });

    it('should fallback to basic notification when service worker unavailable', async () => {
      // Mock service worker as unavailable
      delete (global.navigator as any).serviceWorker;

      const title = 'Test Notification';
      const options: NotificationOptions = { body: 'Test body' };

      await NotificationManager.showNotification(title, options);

      expect(global.Notification).toHaveBeenCalledWith(title, {
        body: 'Test body',
        icon: '/favicon.ico',
        tag: undefined,
        data: undefined,
      });

      // Restore service worker
      global.navigator.serviceWorker = mockNavigator.serviceWorker;
    });

    it('should not show notification when permission denied', async () => {
      mockNotification.permission = 'denied';

      await NotificationManager.showNotification('Test', { body: 'Test body' });

      expect(mockServiceWorkerRegistration.showNotification).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Notification permission not granted');
    });

    it('should handle service worker notification errors', async () => {
      mockServiceWorkerRegistration.showNotification.mockRejectedValue(new Error('SW error'));

      await NotificationManager.showNotification('Test', { body: 'Test body' });

      expect(console.error).toHaveBeenCalledWith('Error showing notification:', expect.any(Error));
    });

    it('should handle basic notification errors', async () => {
      // Mock service worker as unavailable
      delete (global.navigator as any).serviceWorker;

      // Mock Notification constructor to throw
      global.Notification = vi.fn().mockImplementation(() => {
        throw new Error('Notification error');
      });

      await NotificationManager.showNotification('Test', { body: 'Test body' });

      expect(console.error).toHaveBeenCalledWith('Error showing notification:', expect.any(Error));

      // Restore
      global.navigator.serviceWorker = mockNavigator.serviceWorker;
    });
  });

  describe('Scheduled Notifications', () => {
    beforeEach(() => {
      mockNotification.permission = 'granted';
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should schedule notification for future time', () => {
      const taskId = 'task-123';
      const title = 'Task Reminder';
      const body = 'Your task is due soon';
      const futureTime = new Date(Date.now() + 60000); // 1 minute from now

      const setTimeoutSpy = vi.spyOn(global.window, 'setTimeout');

      NotificationManager.scheduleNotification(taskId, title, body, futureTime);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 60000);
      expect(console.log).toHaveBeenCalledWith(`Notification scheduled for task ${taskId} at ${futureTime}`);
    });

    it('should show immediate notification for past time', async () => {
      const taskId = 'task-123';
      const title = 'Task Reminder';
      const body = 'Your task is due soon';
      const pastTime = new Date(Date.now() - 60000); // 1 minute ago

      const showNotificationSpy = vi.spyOn(NotificationManager, 'showNotification');

      NotificationManager.scheduleNotification(taskId, title, body, pastTime);

      expect(showNotificationSpy).toHaveBeenCalledWith(title, {
        body,
        tag: `task-${taskId}`,
      });
    });

    it('should clear existing notification when scheduling new one', () => {
      const taskId = 'task-123';
      const futureTime = new Date(Date.now() + 60000);

      const clearTimeoutSpy = vi.spyOn(global.window, 'clearTimeout');

      // Schedule first notification
      NotificationManager.scheduleNotification(taskId, 'Title 1', 'Body 1', futureTime);

      // Schedule second notification for same task
      NotificationManager.scheduleNotification(taskId, 'Title 2', 'Body 2', futureTime);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should trigger scheduled notification when timeout expires', async () => {
      const taskId = 'task-123';
      const title = 'Task Reminder';
      const body = 'Your task is due soon';
      const futureTime = new Date(Date.now() + 60000);

      const showNotificationSpy = vi.spyOn(NotificationManager, 'showNotification');

      NotificationManager.scheduleNotification(taskId, title, body, futureTime);

      // Fast-forward time
      vi.advanceTimersByTime(60000);

      expect(showNotificationSpy).toHaveBeenCalledWith(title, {
        body,
        tag: `task-${taskId}`,
        data: {
          taskId,
          title,
          body,
          scheduledTime: futureTime,
          taskDueTime: expect.any(Date),
        },
      });
    });
  });

  describe('Clear Notifications', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should clear specific scheduled notification', () => {
      const taskId = 'task-123';
      const futureTime = new Date(Date.now() + 60000);

      const clearTimeoutSpy = vi.spyOn(global.window, 'clearTimeout');

      // Schedule notification
      NotificationManager.scheduleNotification(taskId, 'Title', 'Body', futureTime);

      // Clear notification
      NotificationManager.clearScheduledNotification(taskId);

      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(`Cleared scheduled notification for task ${taskId}`);
    });

    it('should handle clearing non-existent notification', () => {
      const clearTimeoutSpy = vi.spyOn(global.window, 'clearTimeout');

      NotificationManager.clearScheduledNotification('non-existent');

      expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });

    it('should clear all scheduled notifications', () => {
      const futureTime = new Date(Date.now() + 60000);
      const clearTimeoutSpy = vi.spyOn(global.window, 'clearTimeout');

      // Schedule multiple notifications
      NotificationManager.scheduleNotification('task-1', 'Title 1', 'Body 1', futureTime);
      NotificationManager.scheduleNotification('task-2', 'Title 2', 'Body 2', futureTime);
      NotificationManager.scheduleNotification('task-3', 'Title 3', 'Body 3', futureTime);

      // Clear all
      NotificationManager.clearAllScheduledNotifications();

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(3);
      expect(console.log).toHaveBeenCalledWith('Cleared all scheduled notifications');
    });
  });

  describe('Permission Messages', () => {
    it('should return correct message for granted permission', () => {
      const message = NotificationManager.getPermissionMessage('granted');
      expect(message).toBe('Notifications are enabled. You will receive reminders for your tasks.');
    });

    it('should return correct message for denied permission', () => {
      const message = NotificationManager.getPermissionMessage('denied');
      expect(message).toBe('Notifications are blocked. Please enable them in your browser settings to receive task reminders.');
    });

    it('should return correct message for default permission', () => {
      const message = NotificationManager.getPermissionMessage('default');
      expect(message).toBe('Click to enable notifications for task reminders. You can change this setting anytime.');
    });

    it('should return default message for unknown permission', () => {
      // @ts-expect-error - Testing invalid input
      const message = NotificationManager.getPermissionMessage('unknown');
      expect(message).toBe('Notification status unknown.');
    });
  });

  describe('Time Calculations', () => {
    it('should calculate notification time correctly', () => {
      const dueAt = '2024-01-01T12:00:00.000Z';
      const reminderMinutes = 30;

      const notificationTime = NotificationManager.calculateNotificationTime(dueAt, reminderMinutes);

      expect(notificationTime.toISOString()).toBe('2024-01-01T11:30:00.000Z');
    });

    it('should handle different reminder durations', () => {
      const dueAt = '2024-01-01T12:00:00.000Z';

      // 5 minutes before
      const fiveMinBefore = NotificationManager.calculateNotificationTime(dueAt, 5);
      expect(fiveMinBefore.toISOString()).toBe('2024-01-01T11:55:00.000Z');

      // 2 hours before
      const twoHoursBefore = NotificationManager.calculateNotificationTime(dueAt, 120);
      expect(twoHoursBefore.toISOString()).toBe('2024-01-01T10:00:00.000Z');

      // 1 day before
      const oneDayBefore = NotificationManager.calculateNotificationTime(dueAt, 1440);
      expect(oneDayBefore.toISOString()).toBe('2023-12-31T12:00:00.000Z');
    });
  });

  describe('Time Formatting', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should format time as "Now" for past or current time', () => {
      const pastTime = new Date('2024-01-01T11:00:00.000Z');
      const currentTime = new Date('2024-01-01T12:00:00.000Z');

      expect(NotificationManager.formatTimeUntilNotification(pastTime)).toBe('Now');
      expect(NotificationManager.formatTimeUntilNotification(currentTime)).toBe('Now');
    });

    it('should format minutes correctly', () => {
      const inFiveMinutes = new Date('2024-01-01T12:05:00.000Z');
      const inOneMinute = new Date('2024-01-01T12:01:00.000Z');

      expect(NotificationManager.formatTimeUntilNotification(inFiveMinutes)).toBe('in 5 minutes');
      expect(NotificationManager.formatTimeUntilNotification(inOneMinute)).toBe('in 1 minute');
    });

    it('should format hours correctly', () => {
      const inTwoHours = new Date('2024-01-01T14:00:00.000Z');
      const inOneHourThirtyMinutes = new Date('2024-01-01T13:30:00.000Z');
      const inExactlyOneHour = new Date('2024-01-01T13:00:00.000Z');

      expect(NotificationManager.formatTimeUntilNotification(inTwoHours)).toBe('in 2h');
      expect(NotificationManager.formatTimeUntilNotification(inOneHourThirtyMinutes)).toBe('in 1h 30m');
      expect(NotificationManager.formatTimeUntilNotification(inExactlyOneHour)).toBe('in 1h');
    });

    it('should format days correctly', () => {
      const inTwoDays = new Date('2024-01-03T12:00:00.000Z');
      const inOneDay = new Date('2024-01-02T12:00:00.000Z');

      expect(NotificationManager.formatTimeUntilNotification(inTwoDays)).toBe('in 2 days');
      expect(NotificationManager.formatTimeUntilNotification(inOneDay)).toBe('in 1 day');
    });
  });

  describe('Validation', () => {
    it('should validate valid reminder times', () => {
      const dueAt = '2024-01-01T12:00:00.000Z';

      // Valid reminder times
      expect(NotificationManager.validateReminderTime(dueAt, 1)).toEqual({ isValid: true });
      expect(NotificationManager.validateReminderTime(dueAt, 30)).toEqual({ isValid: true });
      expect(NotificationManager.validateReminderTime(dueAt, 1440)).toEqual({ isValid: true });
      expect(NotificationManager.validateReminderTime(dueAt, 10080)).toEqual({ isValid: true });
    });

    it('should reject reminder times less than 1 minute', () => {
      const dueAt = '2024-01-01T12:00:00.000Z';

      expect(NotificationManager.validateReminderTime(dueAt, 0)).toEqual({
        isValid: false,
        error: 'Reminder time must be at least 1 minute',
      });

      expect(NotificationManager.validateReminderTime(dueAt, -5)).toEqual({
        isValid: false,
        error: 'Reminder time must be at least 1 minute',
      });
    });

    it('should reject reminder times greater than 7 days', () => {
      const dueAt = '2024-01-01T12:00:00.000Z';

      expect(NotificationManager.validateReminderTime(dueAt, 10081)).toEqual({
        isValid: false,
        error: 'Reminder time cannot exceed 7 days',
      });

      expect(NotificationManager.validateReminderTime(dueAt, 20160)).toEqual({
        isValid: false,
        error: 'Reminder time cannot exceed 7 days',
      });
    });

    it('should reject reminder times that result in past notification times', () => {
      // Mock current time
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));

      const dueAt = '2024-01-01T11:00:00.000Z'; // Due in the past
      const reminderMinutes = 30;

      expect(NotificationManager.validateReminderTime(dueAt, reminderMinutes)).toEqual({
        isValid: false,
        error: 'Reminder time is in the past',
      });

      vi.useRealTimers();
    });
  });

  describe('Real-world Integration Scenarios', () => {
    beforeEach(() => {
      mockNotification.permission = 'granted';
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle complete task notification workflow', async () => {
      const taskId = 'task-workflow-123';
      const dueAt = '2024-01-01T15:00:00.000Z'; // Due at 3 PM
      const reminderMinutes = 30; // Remind 30 minutes before

      // Calculate notification time
      const notificationTime = NotificationManager.calculateNotificationTime(dueAt, reminderMinutes);
      expect(notificationTime.toISOString()).toBe('2024-01-01T14:30:00.000Z');

      // Validate reminder time
      const validation = NotificationManager.validateReminderTime(dueAt, reminderMinutes);
      expect(validation.isValid).toBe(true);

      // Schedule notification
      NotificationManager.scheduleNotification(
        taskId,
        'Task Due Soon',
        'Your task is due in 30 minutes',
        notificationTime
      );

      // Check time until notification
      const timeUntil = NotificationManager.formatTimeUntilNotification(notificationTime);
      expect(timeUntil).toBe('in 2h 30m');

      // Advance time to notification time
      vi.advanceTimersByTime(2.5 * 60 * 60 * 1000); // 2.5 hours

      // Verify notification was shown
      expect(mockServiceWorkerRegistration.showNotification).toHaveBeenCalled();
    });

    it('should handle permission request flow', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('granted');

      // Check initial status
      expect(NotificationManager.getPermissionStatus()).toBe('default');

      // Get user-friendly message
      const message = NotificationManager.getPermissionMessage('default');
      expect(message).toContain('Click to enable notifications');

      // Request permission
      const result = await NotificationManager.requestPermission();
      expect(result).toBe('granted');

      // Verify permission is now granted
      mockNotification.permission = 'granted';
      expect(NotificationManager.getPermissionStatus()).toBe('granted');
    });

    it('should handle notification scheduling and clearing', () => {
      const tasks = [
        { id: 'task-1', dueAt: '2024-01-01T13:00:00.000Z', reminderMinutes: 15 },
        { id: 'task-2', dueAt: '2024-01-01T14:00:00.000Z', reminderMinutes: 30 },
        { id: 'task-3', dueAt: '2024-01-01T15:00:00.000Z', reminderMinutes: 60 },
      ];

      // Schedule notifications for all tasks
      tasks.forEach(task => {
        const notificationTime = NotificationManager.calculateNotificationTime(
          task.dueAt,
          task.reminderMinutes
        );
        NotificationManager.scheduleNotification(
          task.id,
          `Task ${task.id} Due`,
          'Your task is due soon',
          notificationTime
        );
      });

      // Clear specific task
      NotificationManager.clearScheduledNotification('task-2');

      // Clear all remaining
      NotificationManager.clearAllScheduledNotifications();

      expect(console.log).toHaveBeenCalledWith('Cleared all scheduled notifications');
    });

    it('should handle unsupported browser gracefully', async () => {
      // Mock unsupported browser
      delete (global as any).Notification;
      delete (global.navigator as any).serviceWorker;

      expect(NotificationManager.isSupported()).toBe(false);
      expect(NotificationManager.getPermissionStatus()).toBe('denied');

      await expect(NotificationManager.requestPermission()).rejects.toThrow(
        'Notifications are not supported by this browser'
      );

      // Notification scheduling should not throw errors
      expect(() => {
        NotificationManager.scheduleNotification(
          'task-123',
          'Test',
          'Test body',
          new Date(Date.now() + 60000)
        );
      }).not.toThrow();
    });
  });
});