import mongoose from 'mongoose';
import Todo, { ITodo } from '../Todo';

describe('Todo Model - Notification Features', () => {
  beforeEach(async () => {
    await Todo.deleteMany({});
  });

  describe('reactivate method with notification preservation', () => {
    it('should preserve notification settings when reactivating task', async () => {
      // Create a completed task with notification settings
      const completedTodo = new Todo({
        text: 'Completed task with notifications',
        type: 'one-time',
        state: 'completed',
        dueAt: new Date('2025-09-20T10:00:00Z'),
        completedAt: new Date('2025-09-19T09:00:00Z'),
        notification: {
          enabled: true,
          reminderMinutes: 60,
          notifiedAt: new Date('2025-09-19T08:00:00Z'),
        },
      });
      await completedTodo.save();

      // Reactivate the task
      const newDueAt = new Date('2025-09-25T14:00:00Z');
      const reactivatedTodo = await completedTodo.reactivate(newDueAt);

      // Verify notification settings were preserved
      expect(reactivatedTodo.notification).toBeDefined();
      expect(reactivatedTodo.notification!.enabled).toBe(true);
      expect(reactivatedTodo.notification!.reminderMinutes).toBe(60);
      expect(reactivatedTodo.notification!.notifiedAt).toBeNull(); // Should be reset

      // Verify other reactivation properties
      expect(reactivatedTodo.state).toBe('active');
      expect(reactivatedTodo.dueAt).toEqual(newDueAt);
      expect(reactivatedTodo.isReactivation).toBe(true);
      expect(reactivatedTodo.originalId).toBe(completedTodo._id?.toString());
      expect(reactivatedTodo.activatedAt).toBeDefined();
    });

    it('should reactivate task without notification when original had none', async () => {
      const completedTodo = new Todo({
        text: 'Task without notifications',
        type: 'daily',
        state: 'failed',
        // No notification field
      });
      await completedTodo.save();

      const reactivatedTodo = await completedTodo.reactivate();

      expect(reactivatedTodo.notification).toEqual({
        enabled: false,
        reminderMinutes: 15,
        notifiedAt: null
      });
      expect(reactivatedTodo.state).toBe('active');
      expect(reactivatedTodo.isReactivation).toBe(true);
    });

    it('should preserve notification settings but reset notifiedAt for one-time tasks', async () => {
      const failedTodo = new Todo({
        text: 'Failed one-time task',
        type: 'one-time',
        state: 'failed',
        dueAt: new Date('2025-09-15T10:00:00Z'),
        failedAt: new Date('2025-09-16T10:00:00Z'),
        notification: {
          enabled: true,
          reminderMinutes: 30,
          notifiedAt: new Date('2025-09-15T09:30:00Z'), // Was notified before
        },
      });
      await failedTodo.save();

      const reactivatedTodo = await failedTodo.reactivate(new Date('2025-09-30T10:00:00Z'));

      expect(reactivatedTodo.notification).toEqual({
        enabled: true,
        reminderMinutes: 30,
        notifiedAt: null, // Should be reset for new task
      });
    });

    it('should handle different reminder minute values correctly', async () => {
      const testCases = [
        { reminderMinutes: 5, description: '5 minutes' },
        { reminderMinutes: 60, description: '1 hour' },
        { reminderMinutes: 1440, description: '1 day' },
        { reminderMinutes: 2880, description: '2 days' },
      ];

      for (const testCase of testCases) {
        const completedTodo = new Todo({
          text: `Task with ${testCase.description} reminder`,
          type: 'one-time',
          state: 'completed',
          dueAt: new Date('2025-09-20T10:00:00Z'),
          notification: {
            enabled: true,
            reminderMinutes: testCase.reminderMinutes,
          },
        });
        await completedTodo.save();

        const reactivatedTodo = await completedTodo.reactivate();

        expect(reactivatedTodo.notification!.reminderMinutes).toBe(testCase.reminderMinutes);

        // Clean up for next iteration
        await Todo.deleteMany({});
      }
    });

    it('should preserve disabled notification settings', async () => {
      const completedTodo = new Todo({
        text: 'Task with disabled notifications',
        type: 'one-time',
        state: 'completed',
        dueAt: new Date('2025-09-20T10:00:00Z'),
        notification: {
          enabled: false, // Disabled
          reminderMinutes: 15,
        },
      });
      await completedTodo.save();

      const reactivatedTodo = await completedTodo.reactivate();

      expect(reactivatedTodo.notification).toEqual({
        enabled: false,
        reminderMinutes: 15,
        notifiedAt: null,
      });
    });
  });

  describe('notification field validation', () => {
    it('should allow saving todo with valid notification settings', async () => {
      const todo = new Todo({
        text: 'Task with valid notification',
        type: 'one-time',
        dueAt: new Date('2025-09-20T10:00:00Z'),
        notification: {
          enabled: true,
          reminderMinutes: 30,
        },
      });

      const savedTodo = await todo.save();
      expect(savedTodo.notification).toEqual({
        enabled: true,
        reminderMinutes: 30,
        notifiedAt: null,
      });
    });

    it('should allow saving todo without notification field', async () => {
      const todo = new Todo({
        text: 'Task without notification',
        type: 'daily',
      });

      const savedTodo = await todo.save();
      expect(savedTodo.notification).toEqual({
        enabled: false,
        reminderMinutes: 15,
        notifiedAt: null
      });
    });

    it('should handle notification field with only enabled property', async () => {
      const todo = new Todo({
        text: 'Task with partial notification',
        type: 'one-time',
        dueAt: new Date('2025-09-20T10:00:00Z'),
        notification: {
          enabled: true,
          // reminderMinutes will be handled by schema default
        },
      });

      const savedTodo = await todo.save();
      expect(savedTodo.notification!.enabled).toBe(true);
      expect(savedTodo.notification!.reminderMinutes).toBeDefined();
    });
  });

  describe('notification with different task types', () => {
    it('should handle notifications for one-time tasks', async () => {
      const todo = new Todo({
        text: 'One-time task with notification',
        type: 'one-time',
        dueAt: new Date('2025-09-20T10:00:00Z'),
        notification: {
          enabled: true,
          reminderMinutes: 120,
        },
      });

      const savedTodo = await todo.save();
      expect(savedTodo.type).toBe('one-time');
      expect(savedTodo.notification!.enabled).toBe(true);
      expect(savedTodo.notification!.reminderMinutes).toBe(120);
    });

    it('should handle notifications for daily tasks', async () => {
      const todo = new Todo({
        text: 'Daily task with notification',
        type: 'daily',
        notification: {
          enabled: true,
          reminderMinutes: 60,
        },
      });

      const savedTodo = await todo.save();
      expect(savedTodo.type).toBe('daily');
      expect(savedTodo.notification!.enabled).toBe(true);
      expect(savedTodo.notification!.reminderMinutes).toBe(60);
    });
  });
});