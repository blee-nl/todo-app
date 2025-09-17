import { Request, Response } from 'express';
import Todo from '../../models/Todo';
import { createTodo, updateTodo, reactivateTodo } from '../todoController';
import { NOTIFICATION_CONSTANTS } from '../../constants/timeConstants';

// Mock the Todo model
jest.mock('../../models/Todo');
const MockedTodo = Todo as jest.Mocked<typeof Todo>;

describe('Todo Controller - Notification Features', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    mockReq = {};
    jest.clearAllMocks();
  });

  describe('createTodo with notification settings', () => {
    it('should create todo with notification settings when provided', async () => {
      const mockSavedTodo = {
        _id: 'todo1',
        text: 'Test task with notification',
        type: 'one-time',
        dueAt: new Date('2025-09-20T10:00:00Z'),
        notification: {
          enabled: true,
          reminderMinutes: 30,
          notifiedAt: null,
        },
        save: jest.fn().mockImplementation(function(this: any) { return this; }),
      };

      (MockedTodo as any).mockImplementation(() => mockSavedTodo as any);

      mockReq.body = {
        text: 'Test task with notification',
        type: 'one-time',
        dueAt: '2025-09-20T10:00:00Z',
        notification: {
          enabled: true,
          reminderMinutes: 30,
          notifiedAt: null,
        },
      };

      await createTodo(mockReq as Request, mockRes as Response);

      // Verify Todo constructor was called with notification data
      expect(MockedTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Test task with notification',
          type: 'one-time',
          dueAt: expect.any(Date),
          notification: {
            enabled: true,
            reminderMinutes: 30,
          },
        })
      );

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo created successfully',
        data: mockSavedTodo,
      });
    });

    it('should create todo without notification when not provided', async () => {
      const mockSavedTodo = {
        _id: 'todo1',
        text: 'Test task without notification',
        type: 'daily',
        save: jest.fn().mockImplementation(function(this: any) { return this; }),
      };

      (MockedTodo as any).mockImplementation(() => mockSavedTodo as any);

      mockReq.body = {
        text: 'Test task without notification',
        type: 'daily',
      };

      await createTodo(mockReq as Request, mockRes as Response);

      // Verify notification field was not included
      expect(MockedTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Test task without notification',
          type: 'daily',
        })
      );
      expect(MockedTodo).not.toHaveBeenCalledWith(
        expect.objectContaining({
          notification: expect.anything(),
        })
      );
    });

    it('should use default reminder minutes when notification enabled but minutes not specified', async () => {
      const mockSavedTodo = {
        _id: 'todo1',
        text: 'Test task',
        save: jest.fn().mockImplementation(function(this: any) { return this; }),
      };

      (MockedTodo as any).mockImplementation(() => mockSavedTodo as any);

      mockReq.body = {
        text: 'Test task',
        type: 'one-time',
        dueAt: '2025-09-20T10:00:00Z',
        notification: {
          enabled: true,
          // reminderMinutes not provided
        },
      };

      await createTodo(mockReq as Request, mockRes as Response);

      expect(MockedTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          notification: {
            enabled: true,
            reminderMinutes: NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES,
          },
        })
      );
    });
  });

  describe('updateTodo with notification settings', () => {
    it('should update notification settings when provided', async () => {
      const mockTodo = {
        _id: 'todo1',
        text: 'Original task',
        type: 'one-time',
        state: 'pending',
        dueAt: new Date('2025-09-20T10:00:00Z'),
        notification: {
          enabled: false,
          reminderMinutes: 15,
        },
        save: jest.fn().mockResolvedValue({
          _id: 'todo1',
          text: 'Updated task',
          state: 'pending',
          notification: {
            enabled: true,
            reminderMinutes: 60,
            notifiedAt: null,
          },
        }),
      };

      MockedTodo.findById = jest.fn().mockResolvedValue(mockTodo);

      mockReq.params = { id: 'todo1' };
      mockReq.body = {
        text: 'Updated task',
        notification: {
          enabled: true,
          reminderMinutes: 60,
        },
      };

      await updateTodo(mockReq as Request, mockRes as Response);

      // Verify response was sent successfully
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo updated successfully',
        data: expect.objectContaining({
          _id: 'todo1',
          text: 'Updated task',
          state: 'pending',
          notification: {
            enabled: true,
            reminderMinutes: 60,
            notifiedAt: null,
          },
        }),
      });
    });

    it('should preserve existing notification settings when not provided in update', async () => {
      const originalNotification = {
        enabled: true,
        reminderMinutes: 30,
      };

      const mockTodo = {
        _id: 'todo1',
        text: 'Original task',
        type: 'one-time',
        state: 'pending',
        notification: originalNotification,
        save: jest.fn().mockImplementation(function(this: any) { return this; }),
      };

      MockedTodo.findById = jest.fn().mockResolvedValue(mockTodo);

      mockReq.params = { id: 'todo1' };
      mockReq.body = {
        text: 'Updated task text only',
        // notification not provided
      };

      await updateTodo(mockReq as Request, mockRes as Response);

      // Verify response was sent successfully
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo updated successfully',
        data: mockTodo,
      });
    });
  });

  describe('reactivateTodo with notification preservation', () => {
    it('should preserve notification settings when reactivating completed task', async () => {
      const originalNotification = {
        enabled: true,
        reminderMinutes: 120,
      };

      const mockCompletedTodo = {
        _id: 'completed-todo1',
        text: 'Completed task',
        type: 'one-time',
        state: 'completed',
        dueAt: new Date('2025-09-20T10:00:00Z'),
        notification: originalNotification,
        reactivate: jest.fn().mockResolvedValue({
          _id: 'reactivated-todo1',
          text: 'Completed task',
          type: 'one-time',
          state: 'active',
          dueAt: new Date('2025-09-21T10:00:00Z'),
          isReactivation: true,
          notification: {
            enabled: true,
            reminderMinutes: 120,
            notifiedAt: null,
          },
        }),
      };

      MockedTodo.findById = jest.fn().mockResolvedValue(mockCompletedTodo);
      MockedTodo.findOne = jest.fn().mockResolvedValue(null); // No duplicate active task

      mockReq.params = { id: 'completed-todo1' };
      mockReq.body = { newDueAt: '2025-09-21T10:00:00Z' };

      await reactivateTodo(mockReq as Request, mockRes as Response);

      // Verify reactivate was called with newDueAt
      expect(mockCompletedTodo.reactivate).toHaveBeenCalledWith(new Date('2025-09-21T10:00:00Z'), undefined);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo re-activated successfully',
        data: expect.objectContaining({
          notification: {
            enabled: true,
            reminderMinutes: 120,
            notifiedAt: null,
          },
        }),
      });
    });

    it('should handle reactivation of task without notification settings', async () => {
      const mockCompletedTodo = {
        _id: 'completed-todo2',
        text: 'Task without notifications',
        type: 'daily',
        state: 'completed',
        notification: undefined,
        reactivate: jest.fn().mockResolvedValue({
          _id: 'reactivated-todo2',
          text: 'Task without notifications',
          state: 'active',
          notification: undefined,
        }),
      };

      MockedTodo.findById = jest.fn().mockResolvedValue(mockCompletedTodo);
      MockedTodo.findOne = jest.fn().mockResolvedValue(null);

      mockReq.params = { id: 'completed-todo2' };
      mockReq.body = {};

      await reactivateTodo(mockReq as Request, mockRes as Response);

      expect(mockCompletedTodo.reactivate).toHaveBeenCalledWith(undefined, undefined);
      expect(mockStatus).toHaveBeenCalledWith(201);
    });

    it('should return error when trying to reactivate non-completed/failed task', async () => {
      const mockActiveTodo = {
        _id: 'active-todo1',
        state: 'active',
      };

      MockedTodo.findById = jest.fn().mockResolvedValue(mockActiveTodo);

      mockReq.params = { id: 'active-todo1' };

      await reactivateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to re-activate todo',
        message: 'Only completed or failed tasks can be re-activated',
      });
    });
  });

  describe('Notification validation', () => {
    it('should validate reminderMinutes range', async () => {
      const mockSavedTodo = {
        save: jest.fn().mockImplementation(function(this: any) { return this; }),
      };

      (MockedTodo as any).mockImplementation(() => mockSavedTodo as any);

      // Test with invalid reminderMinutes
      mockReq.body = {
        text: 'Test task',
        type: 'one-time',
        dueAt: '2025-09-20T10:00:00Z',
        notification: {
          enabled: true,
          reminderMinutes: -5, // Invalid
        },
      };

      await createTodo(mockReq as Request, mockRes as Response);

      // Should use default when invalid value provided
      expect(MockedTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          notification: {
            enabled: true,
            reminderMinutes: NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES,
          },
        })
      );
    });
  });
});