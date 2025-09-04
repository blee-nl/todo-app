import { Request, Response } from 'express';
import Todo, { ITodo, TaskType, TaskState } from '../models/Todo';

// Custom error class for better error handling
class TodoError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'TodoError';
  }
}

// Get all todos grouped by state
export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    
    // Group todos by state
    const groupedTodos = {
      pending: todos.filter(todo => todo.state === 'pending'),
      active: todos.filter(todo => todo.state === 'active'),
      completed: todos.filter(todo => todo.state === 'completed'),
      failed: todos.filter(todo => todo.state === 'failed')
    };
    
    res.status(200).json({
      success: true,
      count: todos.length,
      data: groupedTodos
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
      throw new TodoError('Invalid state. Must be: pending, active, completed, or failed', 400);
    }
    
    const todos = await Todo.findByState(state as TaskState);
    
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    const err = error as TodoError;
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
      throw new TodoError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoError('Todo not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    const err = error as TodoError;
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
    const { text, type, dueAt } = req.body;
    
    if (!text || text.trim().length === 0) {
      throw new TodoError('Todo text is required', 400);
    }
    
    if (text.length > 500) {
      throw new TodoError('Todo text cannot exceed 500 characters', 400);
    }
    
    if (!type || !['one-time', 'daily'].includes(type)) {
      throw new TodoError('Task type is required and must be "one-time" or "daily"', 400);
    }
    
    if (type === 'one-time' && !dueAt) {
      throw new TodoError('Due date is required for one-time tasks', 400);
    }
    
    const todoData: any = {
      text: text.trim(),
      type,
      state: 'pending'
    };
    
    if (type === 'one-time' && dueAt) {
      todoData.dueAt = new Date(dueAt);
    }
    
    // Check for duplicate active tasks with the same content
    const existingActiveTodo = await Todo.findOne({
      text: todoData.text,
      state: 'active'
    });
    
    if (existingActiveTodo) {
      throw new TodoError('An active task with this content already exists', 400);
    }
    
    const todo = new Todo(todoData);
    const savedTodo = await todo.save();
    
    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: savedTodo
    });
  } catch (error) {
    const err = error as TodoError;
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
    const { text } = req.body;
    
    if (!id) {
      throw new TodoError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoError('Todo not found', 404);
    }
    
    // Only allow editing text for active tasks
    if (todo.state !== 'active') {
      throw new TodoError('Only active tasks can be edited', 400);
    }
    
    if (!text || text.trim().length === 0) {
      throw new TodoError('Todo text is required', 400);
    }
    
    if (text.length > 500) {
      throw new TodoError('Todo text cannot exceed 500 characters', 400);
    }
    
    todo.text = text.trim();
    const updatedTodo = await todo.save();
    
    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: updatedTodo
    });
  } catch (error) {
    const err = error as TodoError;
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
      throw new TodoError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoError('Todo not found', 404);
    }
    
    if (todo.state !== 'pending') {
      throw new TodoError('Only pending tasks can be activated', 400);
    }
    
    // Check for duplicate active tasks
    const existingActive = await Todo.findOne({
      text: todo.text,
      state: 'active',
      type: todo.type
    });
    
    if (existingActive) {
      throw new TodoError('A similar active task already exists', 409);
    }
    
    const activatedTodo = await todo.activate();
    
    res.status(200).json({
      success: true,
      message: 'Todo activated successfully',
      data: activatedTodo
    });
  } catch (error) {
    const err = error as TodoError;
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
      throw new TodoError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoError('Todo not found', 404);
    }
    
    if (todo.state !== 'active') {
      throw new TodoError('Only active tasks can be completed', 400);
    }
    
    const completedTodo = await todo.complete();
    
    res.status(200).json({
      success: true,
      message: 'Todo completed successfully',
      data: completedTodo
    });
  } catch (error) {
    const err = error as TodoError;
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
      throw new TodoError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoError('Todo not found', 404);
    }
    
    if (todo.state !== 'active') {
      throw new TodoError('Only active tasks can be marked as failed', 400);
    }
    
    const failedTodo = await todo.fail();
    
    res.status(200).json({
      success: true,
      message: 'Todo marked as failed',
      data: failedTodo
    });
  } catch (error) {
    const err = error as TodoError;
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
    const { newDueAt } = req.body || {};
    
    if (!id) {
      throw new TodoError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoError('Todo not found', 404);
    }
    
    if (!['completed', 'failed'].includes(todo.state)) {
      throw new TodoError('Only completed or failed tasks can be re-activated', 400);
    }
    
    // Check for duplicate active tasks
    const existingActive = await Todo.findOne({
      text: todo.text,
      state: 'active',
      type: todo.type
    });
    
    if (existingActive) {
      throw new TodoError('A similar active task already exists', 409);
    }
    
    let reactivatedTodo;
    
    if (todo.type === 'one-time' && newDueAt) {
      reactivatedTodo = await todo.reactivate(new Date(newDueAt));
    } else {
      reactivatedTodo = await todo.reactivate();
    }
    
    res.status(201).json({
      success: true,
      message: 'Todo re-activated successfully',
      data: reactivatedTodo
    });
  } catch (error) {
    const err = error as TodoError;
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
      throw new TodoError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findByIdAndDelete(id);
    
    if (!todo) {
      throw new TodoError('Todo not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
      data: todo
    });
  } catch (error) {
    const err = error as TodoError;
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
    
    let createdCount = 0;
    
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
        createdCount++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: `${createdCount} daily tasks activated for today`,
      createdCount
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