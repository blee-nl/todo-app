import type { NotificationOptions } from '../types/notification';

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  taskId: string;
}

export class NotificationManager {
  private static scheduledNotifications = new Map<string, number>();

  /**
   * Check if notifications are supported by the browser
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           typeof navigator !== 'undefined' && 
           'serviceWorker' in navigator;
  }

  /**
   * Get current notification permission status
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission as NotificationPermission;
  }

  /**
   * Request notification permission from user
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported by this browser');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Show an immediate notification
   */
  static async showNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    const permission = this.getPermissionStatus();

    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      // Use service worker notification if available, fallback to basic notification
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          badge: options.badge || '/favicon.ico',
          tag: options.tag,
          data: options.data,
          requireInteraction: true
        });
      } else {
        // Fallback to basic notification
        const notification = new Notification(title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          tag: options.tag,
          data: options.data,
        });

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
          notification.close();
        }, 10000);

        // Handle click events
        notification.onclick = () => {
          window.focus();
          notification.close();
          // You can add custom click handling here
        };
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Schedule a notification for a specific time
   */
  static scheduleNotification(
    taskId: string,
    title: string,
    body: string,
    scheduledTime: Date
  ): void {
    // Clear any existing notification for this task
    this.clearScheduledNotification(taskId);

    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Time has already passed, show immediately
      this.showNotification(title, { body, tag: `task-${taskId}` });
      return;
    }

    // Schedule the notification
    const timeoutId = window.setTimeout(() => {
      this.showNotification(title, {
        body,
        tag: `task-${taskId}`,
        data: {
          taskId,
          title,
          body,
          scheduledTime,
          taskDueTime: new Date()
        }
      });
      this.scheduledNotifications.delete(taskId);
    }, delay);

    this.scheduledNotifications.set(taskId, timeoutId);

    console.log(`Notification scheduled for task ${taskId} at ${scheduledTime}`);
  }

  /**
   * Clear a scheduled notification
   */
  static clearScheduledNotification(taskId: string): void {
    const timeoutId = this.scheduledNotifications.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(taskId);
      console.log(`Cleared scheduled notification for task ${taskId}`);
    }
  }

  /**
   * Clear all scheduled notifications
   */
  static clearAllScheduledNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
    console.log('Cleared all scheduled notifications');
  }

  /**
   * Get permission status message for user
   */
  static getPermissionMessage(permission: NotificationPermission): string {
    switch (permission) {
      case 'granted':
        return 'Notifications are enabled. You will receive reminders for your tasks.';
      case 'denied':
        return 'Notifications are blocked. Please enable them in your browser settings to receive task reminders.';
      case 'default':
        return 'Click to enable notifications for task reminders. You can change this setting anytime.';
      default:
        return 'Notification status unknown.';
    }
  }

  /**
   * Calculate notification time based on due date and reminder minutes
   */
  static calculateNotificationTime(dueAt: string, reminderMinutes: number): Date {
    const dueTime = new Date(dueAt);
    const notificationTime = new Date(dueTime.getTime() - (reminderMinutes * 60 * 1000));
    return notificationTime;
  }

  /**
   * Format time remaining until notification
   */
  static formatTimeUntilNotification(notificationTime: Date): string {
    const now = new Date();
    const diff = notificationTime.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Now';
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `in ${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`.trim();
    } else {
      return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  /**
   * Validate reminder time
   */
  static validateReminderTime(dueAt: string, reminderMinutes: number): {
    isValid: boolean;
    error?: string;
  } {
    if (reminderMinutes < 1) {
      return { isValid: false, error: 'Reminder time must be at least 1 minute' };
    }

    if (reminderMinutes > 10080) { // 7 days
      return { isValid: false, error: 'Reminder time cannot exceed 7 days' };
    }

    const notificationTime = this.calculateNotificationTime(dueAt, reminderMinutes);
    const now = new Date();

    if (notificationTime < now) {
      return { isValid: false, error: 'Reminder time is in the past' };
    }

    return { isValid: true };
  }
}