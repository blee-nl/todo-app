import mongoose from 'mongoose';
import Todo from '../Todo';

describe('Todo Model', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await Todo.deleteMany({});
  });

  describe('Todo Creation', () => {
    it('should create a new todo with required fields', async () => {
      const todoData = {
        text: 'Test todo',
        completed: false,
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo._id).toBeDefined();
      expect(savedTodo.text).toBe(todoData.text);
      expect(savedTodo.completed).toBe(todoData.completed);
      expect(savedTodo.createdAt).toBeDefined();
      expect(savedTodo.updatedAt).toBeDefined();
    });

    it('should create a completed todo with completedAt field', async () => {
      const todoData = {
        text: 'Completed todo',
        completed: true,
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo.completed).toBe(true);
      expect(savedTodo.completedAt).toBeDefined();
    });
  });

  describe('Todo Validation', () => {
    it('should require text field', async () => {
      const todo = new Todo({ completed: false });

      await expect(todo.save()).rejects.toThrow();
    });

    it('should have completed field default to false', async () => {
      const todo = new Todo({ text: 'Test todo' });
      const savedTodo = await todo.save();

      expect(savedTodo.completed).toBe(false);
    });

    it('should not allow empty text', async () => {
      const todo = new Todo({ text: '', completed: false });

      await expect(todo.save()).rejects.toThrow();
    });
  });
});
