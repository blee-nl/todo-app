import { NotificationManager } from "../utils/notificationUtils";
import type { Task } from "../domain/entities/Task";

export class NotificationScheduler {
  private static isInitialized = false;
  private static scheduledTasks = new Set<string>();

  /**
   * Initialize the notification scheduler
   */
  static initialize(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;
    console.log('Notification scheduler initialized');

    // Set up periodic task checks (every 5 minutes)
    setInterval(() => {
      this.checkAndScheduleNotifications();
    }, 5 * 60 * 1000);

    // Initial check
    this.checkAndScheduleNotifications();
  }

  /**
   * Schedule notification for a single task
   */
  static scheduleTaskNotification(task: Task): void {
    // Only schedule for tasks with notifications enabled and due date
    if (!task.notification?.enabled || !task.dueAt || task.state !== 'pending' && task.state !== 'active') {
      return;
    }

    // Skip if already scheduled
    if (this.scheduledTasks.has(task.id)) {
      return;
    }

    const dueTime = new Date(task.dueAt);
    const notificationTime = NotificationManager.calculateNotificationTime(
      task.dueAt,
      task.notification.reminderMinutes
    );

    const now = new Date();

    // Skip if notification time has passed or task is already notified
    if (notificationTime <= now || task.notification.notifiedAt) {
      return;
    }

    // Schedule the notification
    NotificationManager.scheduleNotification(
      task.id,
      'Task Reminder',
      `"${task.text}" is due at ${dueTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      notificationTime
    );

    this.scheduledTasks.add(task.id);

    console.log(`Scheduled notification for task "${task.text}" at ${notificationTime}`);
  }

  /**
   * Clear notification for a task
   */
  static clearTaskNotification(taskId: string): void {
    NotificationManager.clearScheduledNotification(taskId);
    this.scheduledTasks.delete(taskId);
    console.log(`Cleared notification for task ${taskId}`);
  }

  /**
   * Update task notification scheduling
   */
  static updateTaskNotification(task: Task): void {
    // Clear existing notification first
    this.clearTaskNotification(task.id);

    // Schedule new notification if needed
    this.scheduleTaskNotification(task);
  }

  /**
   * Schedule notifications for multiple tasks
   */
  static scheduleTaskNotifications(tasks: Task[]): void {
    console.log(`Scheduling notifications for ${tasks.length} tasks`);

    tasks.forEach(task => {
      this.scheduleTaskNotification(task);
    });
  }

  /**
   * Check and schedule notifications (called periodically)
   */
  private static async checkAndScheduleNotifications(): Promise<void> {
    try {
      // This would typically fetch tasks from the API
      // For now, we'll skip automatic fetching to avoid API calls
      console.log('Checking for tasks to schedule notifications...');

      // In a real implementation, you might want to:
      // 1. Fetch tasks with notifications enabled
      // 2. Schedule any new notifications
      // 3. Clear notifications for completed/failed tasks
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  /**
   * Handle task state changes
   */
  static handleTaskStateChange(task: Task): void {
    switch (task.state) {
      case 'completed':
      case 'failed':
        // Clear notifications for completed/failed tasks
        this.clearTaskNotification(task.id);
        break;

      case 'pending':
      case 'active':
        // Schedule notification if enabled
        this.scheduleTaskNotification(task);
        break;
    }
  }

  /**
   * Clear all notifications
   */
  static clearAll(): void {
    NotificationManager.clearAllScheduledNotifications();
    this.scheduledTasks.clear();
    console.log('Cleared all scheduled notifications');
  }

  /**
   * Get notification status
   */
  static getNotificationStatus(taskId: string): {
    isScheduled: boolean;
    browserSupported: boolean;
    permissionGranted: boolean;
  } {
    return {
      isScheduled: this.scheduledTasks.has(taskId),
      browserSupported: NotificationManager.isSupported(),
      permissionGranted: NotificationManager.getPermissionStatus() === 'granted',
    };
  }

  /**
   * Request notification permission and show status
   */
  static async ensurePermission(): Promise<boolean> {
    if (!NotificationManager.isSupported()) {
      console.warn('Notifications not supported');
      return false;
    }

    const permission = await NotificationManager.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.warn('Notification permission denied');
      return false;
    }
  }
}