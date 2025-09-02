import { Request, Response } from 'express';
import Todo, { ITodo } from '../models/Todo';

// Custom error class for better error handling
class TodoError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'TodoError';
  }
}

// Get all todos
export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
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
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      throw new TodoError('Todo text is required', 400);
    }
    
    if (text.length > 500) {
      throw new TodoError('Todo text cannot exceed 500 characters', 400);
    }
    
    const todo = new Todo({ text: text.trim() });
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

// Update todo
export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;
    
    if (!id) {
      throw new TodoError('Todo ID is required', 400);
    }
    
    const updateData: Partial<ITodo> = {};
    
    if (text !== undefined) {
      if (text.trim().length === 0) {
        throw new TodoError('Todo text cannot be empty', 400);
      }
      if (text.length > 500) {
        throw new TodoError('Todo text cannot exceed 500 characters', 400);
      }
      updateData.text = text.trim();
    }
    
    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }
    
    const todo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      throw new TodoError('Todo not found', 404);
    }
    
    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: todo
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

// Delete todo
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
      data: { id }
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

// Toggle todo completion
export const toggleTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new TodoError('Todo ID is required', 400);
    }
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      throw new TodoError('Todo not found', 404);
    }
    
    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();
    
    res.status(200).json({
      success: true,
      message: `Todo ${updatedTodo.completed ? 'completed' : 'uncompleted'} successfully`,
      data: updatedTodo
    });
  } catch (error) {
    const err = error as TodoError;
    res.status(err.statusCode || 500).json({
      success: false,
      error: 'Failed to toggle todo',
      message: err.message
    });
  }
};

// Get todos by completion status
export const getTodosByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { completed } = req.query;
    
    let filter = {};
    if (completed !== undefined) {
      filter = { completed: completed === 'true' };
    }
    
    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: 'Failed to fetch todos by status',
      message: err.message
    });
  }
};

// Delete all completed todos
export const deleteCompletedTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await Todo.deleteMany({ completed: true });
    
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} completed todos deleted successfully`,
      data: { deletedCount: result.deletedCount }
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
