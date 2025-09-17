import { Request, Response } from 'express';
import Todo, { ITodo, TaskType, TaskState } from '../models/Todo';
import { NotificationService } from '../services/NotificationService';
import { TIME_CONSTANTS, NOTIFICATION_CONSTANTS } from '../constants/timeConstants';

// Custom error class for better error handling
class TodoValidationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'TodoValidationError';
  }
}

// Get all todos grouped by state
export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    
    // Group todos by state
    const todosByState = {
      pending: todos.filter(todo => todo.state === 'pending'),
      active: todos.filter(todo => todo.state === 'active'),
      completed: todos.filter(todo => todo.state === 'completed'),
      failed: todos.filter(todo => todo.state === 'failed')
    };
    
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todosByState
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: 'Failed to fetch todos',
      message: err.message
    });
  }
};

// Get todos by state
export const getTodosByState = async (req: Request, res: Response): Promise<void> => {
  try {
    const { state } = req.params;
    
    if (!['pending', 'active', 'completed', 'failed'].includes(state)) {
      throw new TodoValidationError('Invalid state. Must be: pending, active, completed, or failed', 400);
    }
    
    const todos = await Todo.findByState(state as TaskState);
    
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    const err = error as TodoValidationError;
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Failed to fetch todos',
      message: err.message
    });
  }
};

// Get single todo by ID
export const getTodoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new TodoValidationError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoValidationError('Todo not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    const err = error as TodoValidationError;
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Failed to fetch todo',
      message: err.message
    });
  }
};

// Create new todo
export const createTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, type, dueAt, notification } = req.body;
    
    if (!text || text.trim().length === 0) {
      throw new TodoValidationError('Todo text is required', 400);
    }
    
    if (text.length > 500) {
      throw new TodoValidationError('Todo text cannot exceed 500 characters', 400);
    }
    
    if (!type || !['one-time', 'daily'].includes(type)) {
      throw new TodoValidationError('Task type is required and must be "one-time" or "daily"', 400);
    }
    
    if (type === 'one-time' && !dueAt) {
      throw new TodoValidationError('Due date is required for one-time tasks', 400);
    }
    
    const todoData: any = {
      text: text.trim(),
      type,
      state: 'pending'
    };

    // Include notification settings if provided
    if (notification) {
      let reminderMinutes = NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES;

      if (notification.reminderMinutes &&
          notification.reminderMinutes >= NOTIFICATION_CONSTANTS.MIN_REMINDER_MINUTES &&
          notification.reminderMinutes <= NOTIFICATION_CONSTANTS.MAX_REMINDER_MINUTES) {
        reminderMinutes = notification.reminderMinutes;
      }

      todoData.notification = {
        enabled: notification.enabled,
        reminderMinutes: reminderMinutes
      };
    }
    
    if (type === 'one-time' && dueAt) {
      const dueDate = new Date(dueAt);
      if (isNaN(dueDate.getTime())) {
        throw new TodoValidationError('Invalid due date format', 400);
      }
      
      // Check if due date is at least 10 minutes from now
      const currentTime = new Date();
      const minimumDueDateTime = new Date(currentTime.getTime() + TIME_CONSTANTS.MIN_DUE_DATE_OFFSET_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE);
      if (dueDate < minimumDueDateTime) {
        throw new TodoValidationError(`Due date must be at least ${TIME_CONSTANTS.MIN_DUE_DATE_OFFSET_MINUTES} minutes from now`, 400);
      }
      
      todoData.dueAt = dueDate;
    }
    
    // Check for duplicate active tasks with the same content
    const duplicateActiveTodo = await Todo.findOne({
      text: todoData.text,
      state: 'active'
    });
    
    if (duplicateActiveTodo) {
      throw new TodoValidationError('An active task with this content already exists', 400);
    }
    
    const todo = new Todo(todoData);
    const savedTodo = await todo.save();
    
    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: savedTodo
    });
  } catch (error) {
    const err = error as TodoValidationError;
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Failed to create todo',
      message: err.message
    });
  }
};

// Update todo (only text for active tasks)
export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, dueAt, notification } = req.body;
    
    if (!id) {
      throw new TodoValidationError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoValidationError('Todo not found', 404);
    }
    
    // Allow editing for both pending and active tasks
    if (!['pending', 'active'].includes(todo.state)) {
      throw new TodoValidationError('Only pending and active tasks can be edited', 400);
    }
    
    if (!text || text.trim().length === 0) {
      throw new TodoValidationError('Todo text is required', 400);
    }
    
    if (text.length > 500) {
      throw new TodoValidationError('Todo text cannot exceed 500 characters', 400);
    }
    
    todo.text = text.trim();

    // Update notification settings if provided
    if (notification) {
      let reminderMinutes = NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES;

      if (notification.reminderMinutes &&
          notification.reminderMinutes >= NOTIFICATION_CONSTANTS.MIN_REMINDER_MINUTES &&
          notification.reminderMinutes <= NOTIFICATION_CONSTANTS.MAX_REMINDER_MINUTES) {
        reminderMinutes = notification.reminderMinutes;
      }

      todo.notification = {
        enabled: notification.enabled,
        reminderMinutes: reminderMinutes
      };
    }

    // Update dueAt if provided and task is one-time
    if (dueAt && todo.type === 'one-time') {
      const dueDate = new Date(dueAt);
      if (isNaN(dueDate.getTime())) {
        throw new TodoValidationError('Invalid due date format', 400);
      }
      
      // Check if due date is at least 10 minutes from now
      const currentTime = new Date();
      const minimumDueDateTime = new Date(currentTime.getTime() + TIME_CONSTANTS.MIN_DUE_DATE_OFFSET_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE);
      if (dueDate < minimumDueDateTime) {
        throw new TodoValidationError(`Due date must be at least ${TIME_CONSTANTS.MIN_DUE_DATE_OFFSET_MINUTES} minutes from now`, 400);
      }
      
      todo.dueAt = dueDate;
    }
    
    const updatedTodo = await todo.save();
    
    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: updatedTodo
    });
  } catch (error) {
    const err = error as TodoValidationError;
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Failed to update todo',
      message: err.message
    });
  }
};

// Activate a pending task
export const activateTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new TodoValidationError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoValidationError('Todo not found', 404);
    }
    
    if (todo.state !== 'pending') {
      throw new TodoValidationError('Only pending tasks can be activated', 400);
    }
    
    // Check for duplicate active tasks
    const existingActive = await Todo.findOne({
      text: todo.text,
      state: 'active',
      type: todo.type
    });
    
    if (existingActive) {
      throw new TodoValidationError('A similar active task already exists', 409);
    }
    
    const activatedTodo = await todo.activate();
    
    res.status(200).json({
      success: true,
      message: 'Todo activated successfully',
      data: activatedTodo
    });
  } catch (error) {
    const err = error as TodoValidationError;
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Failed to activate todo',
      message: err.message
    });
  }
};

// Complete a task
export const completeTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new TodoValidationError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoValidationError('Todo not found', 404);
    }
    
    if (todo.state !== 'active') {
      throw new TodoValidationError('Only active tasks can be completed', 400);
    }
    
    const completedTodo = await todo.complete();
    
    res.status(200).json({
      success: true,
      message: 'Todo completed successfully',
      data: completedTodo
    });
  } catch (error) {
    const err = error as TodoValidationError;
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Failed to complete todo',
      message: err.message
    });
  }
};

// Fail a task
export const failTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new TodoValidationError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoValidationError('Todo not found', 404);
    }
    
    if (todo.state !== 'active') {
      throw new TodoValidationError('Only active tasks can be marked as failed', 400);
    }
    
    const failedTodo = await todo.fail();
    
    res.status(200).json({
      success: true,
      message: 'Todo marked as failed',
      data: failedTodo
    });
  } catch (error) {
    const err = error as TodoValidationError;
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Failed to mark todo as failed',
      message: err.message
    });
  }
};

// Re-activate a completed or failed task
export const reactivateTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newDueAt, notification } = req.body || {};
    
    if (!id) {
      throw new TodoValidationError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoValidationError('Todo not found', 404);
    }
    
    if (!['completed', 'failed'].includes(todo.state)) {
      throw new TodoValidationError('Only completed or failed tasks can be re-activated', 400);
    }
    
    // Check for duplicate active tasks
    const existingActive = await Todo.findOne({
      text: todo.text,
      state: 'active',
      type: todo.type
    });
    
    if (existingActive) {
      throw new TodoValidationError('A similar active task already exists', 409);
    }
    
    let reactivatedTodo;

    if (todo.type === 'one-time' && newDueAt) {
      reactivatedTodo = await todo.reactivate(new Date(newDueAt), notification);
    } else {
      reactivatedTodo = await todo.reactivate(undefined, notification);
    }
    
    res.status(201).json({
      success: true,
      message: 'Todo re-activated successfully',
      data: reactivatedTodo
    });
  } catch (error) {
    const err = error as TodoValidationError;
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Failed to re-activate todo',
      message: err.message
    });
  }
};

// Delete single todo
export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new TodoValidationError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findByIdAndDelete(id);
    
    if (!todo) {
      throw new TodoValidationError('Todo not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
      data: todo
    });
  } catch (error) {
    const err = error as TodoValidationError;
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Failed to delete todo',
      message: err.message
    });
  }
};

// Delete all completed todos
export const deleteCompletedTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await Todo.deleteMany({ state: 'completed' });
    
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} completed todos deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: 'Failed to delete completed todos',
      message: err.message
    });
  }
};

// Delete all failed todos
export const deleteFailedTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await Todo.deleteMany({ state: 'failed' });
    
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} failed todos deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: 'Failed to delete failed todos',
      message: err.message
    });
  }
};

// Process overdue tasks (cron job endpoint)
export const processOverdueTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const overdueTasks = await Todo.findOverdueTasks();
    
    for (const task of overdueTasks) {
      await task.fail();
    }
    
    res.status(200).json({
      success: true,
      message: `${overdueTasks.length} overdue tasks marked as failed`,
      processedCount: overdueTasks.length
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: 'Failed to process overdue tasks',
      message: err.message
    });
  }
};

// Process daily tasks (cron job endpoint)
export const processDailyTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all daily tasks that should be active today
    const dailyTasks = await Todo.findByType('daily');
    
    let activatedTasksCount = 0;
    
    for (const task of dailyTasks) {
      // Check if there's already an active instance for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const existingActive = await Todo.findOne({
        text: task.text,
        type: 'daily',
        state: 'active',
        activatedAt: { $gte: today, $lt: tomorrow }
      });
      
      if (!existingActive) {
        // Create new active instance
        const newTask = new Todo({
          text: task.text,
          type: 'daily',
          state: 'active',
          activatedAt: new Date()
        });
        
        await newTask.save();
        activatedTasksCount++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: `${activatedTasksCount} daily tasks activated for today`,
      activatedTasksCount
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: 'Failed to process daily tasks',
      message: err.message
    });
  }
};

/**
 * Get tasks ready for notification
 */
export const getTasksForNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await NotificationService.getTasksReadyForNotification();

    const notificationData = tasks.map(task => ({
      task: {
        id: task.id,
        text: task.text,
        type: task.type,
        state: task.state,
        dueAt: task.dueAt,
        notification: task.notification
      },
      notification: NotificationService.createNotificationData(task)
    }));

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: notificationData
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: 'Failed to get tasks for notification',
      message: err.message
    });
  }
};

/**
 * Update notification settings for a task
 */
export const updateNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { enabled, reminderMinutes } = req.body;

    // Validation
    if (typeof enabled !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'enabled field must be a boolean'
      });
      return;
    }

    if (reminderMinutes !== undefined) {
      if (typeof reminderMinutes !== 'number' || reminderMinutes < 1 || reminderMinutes > 10080) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'reminderMinutes must be a number between 1 and 10080 (7 days)'
        });
        return;
      }
    }

    const task = await NotificationService.updateNotificationSettings(id, {
      enabled,
      reminderMinutes
    });

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: task
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: 'Failed to update notification settings',
      message: err.message
    });
  }
};

/**
 * Mark task as notified
 */
export const markTaskAsNotified = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await NotificationService.markTaskAsNotified(id);

    res.status(200).json({
      success: true,
      message: 'Task marked as notified successfully'
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: 'Failed to mark task as notified',
      message: err.message
    });
  }
};