import Todo, { ITodo } from '../models/Todo';
import { logger } from '../utils/logger';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag: string;
  data: {
    todoId: string;
    action: 'task_reminder';
  };
}

export class NotificationService {
  /**
   * Find all tasks that are ready for notification
   */
  static async getTasksReadyForNotification(): Promise<ITodo[]> {
    try {
      const tasks = await Todo.findTasksReadyForNotification();
      logger.info(`Found ${tasks.length} tasks ready for notification`);
      return tasks;
    } catch (error) {
      logger.error('Error finding tasks ready for notification:', error as Error);
      throw error;
    }
  }

  /**
   * Create notification data for a task
   */
  static createNotificationData(task: ITodo): NotificationData {
    const dueTime = task.dueAt ? new Date(task.dueAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }) : '';

    return {
      title: 'Task Reminder',
      body: `"${task.text}" is due ${dueTime ? `at ${dueTime}` : 'soon'}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `task-${task.id}`,
      data: {
        todoId: task.id,
        action: 'task_reminder'
      }
    };
  }

  /**
   * Mark task as notified
   */
  static async markTaskAsNotified(taskId: string): Promise<void> {
    try {
      await Todo.findByIdAndUpdate(taskId, {
        'notification.notifiedAt': new Date()
      });
      logger.info(`Task ${taskId} marked as notified`);
    } catch (error) {
      logger.error(`Error marking task ${taskId} as notified:`, error as Error);
      throw error;
    }
  }

  /**
   * Get notification status for a task
   */
  static async getNotificationStatus(taskId: string): Promise<{
    enabled: boolean;
    reminderMinutes: number;
    notified: boolean;
    notifiedAt?: Date;
  } | null> {
    try {
      const task = await Todo.findById(taskId, 'notification').lean();
      if (!task) return null;

      return {
        enabled: task.notification?.enabled || false,
        reminderMinutes: task.notification?.reminderMinutes || 15,
        notified: !!task.notification?.notifiedAt,
        notifiedAt: task.notification?.notifiedAt
      };
    } catch (error) {
      logger.error(`Error getting notification status for task ${taskId}:`, error as Error);
      throw error;
    }
  }

  /**
   * Update notification settings for a task
   */
  static async updateNotificationSettings(
    taskId: string,
    settings: { enabled: boolean; reminderMinutes?: number }
  ): Promise<ITodo | null> {
    try {
      const updateData: any = {
        'notification.enabled': settings.enabled
      };

      if (settings.reminderMinutes !== undefined) {
        updateData['notification.reminderMinutes'] = settings.reminderMinutes;
      }

      // Reset notified status when settings change
      if (settings.enabled) {
        updateData['notification.notifiedAt'] = null;
      }

      const task = await Todo.findByIdAndUpdate(
        taskId,
        updateData,
        { new: true, runValidators: true }
      );

      if (task) {
        logger.info(`Notification settings updated for task ${taskId}`);
      }

      return task;
    } catch (error) {
      logger.error(`Error updating notification settings for task ${taskId}:`, error as Error);
      throw error;
    }
  }

  /**
   * Disable notifications for completed/failed tasks
   */
  static async disableNotificationsForCompletedTasks(): Promise<void> {
    try {
      const result = await Todo.updateMany(
        {
          state: { $in: ['completed', 'failed'] },
          'notification.enabled': true
        },
        {
          'notification.enabled': false
        }
      );

      logger.info(`Disabled notifications for ${result.modifiedCount} completed/failed tasks`);
    } catch (error) {
      logger.error('Error disabling notifications for completed tasks:', error as Error);
      throw error;
    }
  }

  /**
   * Clean up old notifications (older than 7 days)
   */
  static async cleanupOldNotifications(): Promise<void> {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const result = await Todo.updateMany(
        {
          'notification.notifiedAt': { $lt: weekAgo },
          state: { $in: ['completed', 'failed'] }
        },
        {
          $unset: { 'notification.notifiedAt': 1 }
        }
      );

      logger.info(`Cleaned up ${result.modifiedCount} old notification records`);
    } catch (error) {
      logger.error('Error cleaning up old notifications:', error as Error);
      throw error;
    }
  }
}