import { NotificationService, NotificationData } from '../NotificationService';
import Todo, { ITodo } from '../../models/Todo';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../../models/Todo');
jest.mock('../../utils/logger');

const MockedTodo = Todo as jest.Mocked<typeof Todo>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Helper to create mock ITodo
const createMockTodo = (overrides: Partial<ITodo> = {}): ITodo => ({
  id: 'mock-id',
  text: 'Mock task',
  type: 'one-time',
  state: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  activate: jest.fn(),
  complete: jest.fn(),
  fail: jest.fn(),
  reactivate: jest.fn(),
  ...overrides,
} as unknown as ITodo);

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasksReadyForNotification', () => {
    it('should return tasks ready for notification', async () => {
      const mockTasks = [
        createMockTodo({ id: '1', text: 'Task 1' }),
        createMockTodo({ id: '2', text: 'Task 2' }),
      ];

      MockedTodo.findTasksReadyForNotification.mockResolvedValue(mockTasks);

      const result = await NotificationService.getTasksReadyForNotification();

      expect(result).toEqual(mockTasks);
      expect(mockLogger.info).toHaveBeenCalledWith('Found 2 tasks ready for notification');
      expect(MockedTodo.findTasksReadyForNotification).toHaveBeenCalled();
    });

    it('should handle errors when finding tasks', async () => {
      const error = new Error('Database error');
      MockedTodo.findTasksReadyForNotification.mockRejectedValue(error);

      await expect(NotificationService.getTasksReadyForNotification()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error finding tasks ready for notification:', error);
    });
  });

  describe('createNotificationData', () => {
    it('should create notification data for task with due date', () => {
      const task = createMockTodo({
        id: 'task-1',
        text: 'Complete project',
        dueAt: new Date('2025-01-15T14:30:00Z'),
      });

      const result = NotificationService.createNotificationData(task);

      expect(result.title).toBe('Task Reminder');
      expect(result.body).toContain('Complete project');
      expect(result.tag).toBe('task-task-1');
      expect(result.data.todoId).toBe('task-1');
      expect(result.data.action).toBe('task_reminder');
    });

    it('should create notification data for task without due date', () => {
      const task = createMockTodo({
        id: 'task-2',
        text: 'Daily habit',
        dueAt: undefined,
      });

      const result = NotificationService.createNotificationData(task);

      expect(result.body).toBe('"Daily habit" is due soon');
      expect(result.tag).toBe('task-task-2');
    });
  });

  describe('markTaskAsNotified', () => {
    it('should mark task as notified', async () => {
      MockedTodo.findByIdAndUpdate.mockResolvedValue({} as any);

      await NotificationService.markTaskAsNotified('task-1');

      expect(MockedTodo.findByIdAndUpdate).toHaveBeenCalledWith('task-1', {
        'notification.notifiedAt': expect.any(Date),
      });
      expect(mockLogger.info).toHaveBeenCalledWith('Task task-1 marked as notified');
    });

    it('should handle errors when marking task as notified', async () => {
      const error = new Error('Update failed');
      MockedTodo.findByIdAndUpdate.mockRejectedValue(error);

      await expect(NotificationService.markTaskAsNotified('task-1')).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error marking task task-1 as notified:', error);
    });
  });

  describe('getNotificationStatus', () => {
    it('should return notification status for existing task', async () => {
      const mockTask = {
        notification: {
          enabled: true,
          reminderMinutes: 30,
          notifiedAt: new Date('2025-01-15T12:00:00Z'),
        },
      };

      MockedTodo.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTask),
      } as any);

      const result = await NotificationService.getNotificationStatus('task-1');

      expect(result).toEqual({
        enabled: true,
        reminderMinutes: 30,
        notified: true,
        notifiedAt: mockTask.notification.notifiedAt,
      });
    });

    it('should return null for non-existent task', async () => {
      MockedTodo.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await NotificationService.getNotificationStatus('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateNotificationSettings', () => {
    it('should update notification settings', async () => {
      const mockTask = createMockTodo({ id: 'task-1' });
      MockedTodo.findByIdAndUpdate.mockResolvedValue(mockTask);

      const settings = { enabled: true, reminderMinutes: 60 };
      const result = await NotificationService.updateNotificationSettings('task-1', settings);

      expect(result).toBe(mockTask);
      expect(MockedTodo.findByIdAndUpdate).toHaveBeenCalledWith(
        'task-1',
        {
          'notification.enabled': true,
          'notification.reminderMinutes': 60,
          'notification.notifiedAt': null,
        },
        { new: true, runValidators: true }
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Notification settings updated for task task-1');
    });

    it('should handle errors when updating settings', async () => {
      const error = new Error('Update failed');
      MockedTodo.findByIdAndUpdate.mockRejectedValue(error);

      await expect(
        NotificationService.updateNotificationSettings('task-1', { enabled: true })
      ).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error updating notification settings for task task-1:', error);
    });
  });

  describe('disableNotificationsForCompletedTasks', () => {
    it('should disable notifications for completed/failed tasks', async () => {
      const mockResult = { modifiedCount: 5 };
      MockedTodo.updateMany.mockResolvedValue(mockResult as any);

      await NotificationService.disableNotificationsForCompletedTasks();

      expect(MockedTodo.updateMany).toHaveBeenCalledWith(
        {
          state: { $in: ['completed', 'failed'] },
          'notification.enabled': true,
        },
        {
          'notification.enabled': false,
        }
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Disabled notifications for 5 completed/failed tasks');
    });
  });

  describe('cleanupOldNotifications', () => {
    it('should cleanup old notification records', async () => {
      const mockResult = { modifiedCount: 3 };
      MockedTodo.updateMany.mockResolvedValue(mockResult as any);

      await NotificationService.cleanupOldNotifications();

      expect(MockedTodo.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          state: { $in: ['completed', 'failed'] },
        }),
        {
          $unset: { 'notification.notifiedAt': 1 },
        }
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Cleaned up 3 old notification records');
    });

    it('should handle errors when cleaning up notifications', async () => {
      const error = new Error('Cleanup failed');
      MockedTodo.updateMany.mockRejectedValue(error);

      await expect(NotificationService.cleanupOldNotifications()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error cleaning up old notifications:', error);
    });
  });
});