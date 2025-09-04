import mongoose from 'mongoose';
import Todo from '../Todo';

describe('Todo Model', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await Todo.deleteMany({});
  });

  describe('Todo Creation', () => {
    it('should create a new one-time todo with required fields', async () => {
      const todoData = {
        text: 'Test one-time todo',
        type: 'one-time',
        state: 'pending',
        dueAt: new Date('2024-12-31T23:59:59.000Z'),
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo._id).toBeDefined();
      expect(savedTodo.text).toBe(todoData.text);
      expect(savedTodo.type).toBe(todoData.type);
      expect(savedTodo.state).toBe(todoData.state);
      expect(savedTodo.dueAt).toEqual(todoData.dueAt);
      expect(savedTodo.createdAt).toBeDefined();
      expect(savedTodo.updatedAt).toBeDefined();
    });

    it('should create a new daily todo with required fields', async () => {
      const todoData = {
        text: 'Test daily todo',
        type: 'daily',
        state: 'pending',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo._id).toBeDefined();
      expect(savedTodo.text).toBe(todoData.text);
      expect(savedTodo.type).toBe(todoData.type);
      expect(savedTodo.state).toBe(todoData.state);
      expect(savedTodo.dueAt).toBeUndefined();
      expect(savedTodo.createdAt).toBeDefined();
      expect(savedTodo.updatedAt).toBeDefined();
    });

    it('should create a completed todo with completedAt field', async () => {
      const todoData = {
        text: 'Completed todo',
        type: 'one-time',
        state: 'completed',
        dueAt: new Date('2024-12-31T23:59:59.000Z'),
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo.state).toBe('completed');
      expect(savedTodo.completedAt).toBeDefined();
    });
  });

  describe('Todo Validation', () => {
    it('should require text field', async () => {
      const todo = new Todo({ 
        type: 'one-time',
        state: 'pending',
        dueAt: new Date('2024-12-31T23:59:59.000Z')
      });

      await expect(todo.save()).rejects.toThrow();
    });

    it('should require type field', async () => {
      const todo = new Todo({ 
        text: 'Test todo',
        state: 'pending'
      });

      await expect(todo.save()).rejects.toThrow();
    });

    it('should require dueAt for one-time tasks', async () => {
      const todo = new Todo({ 
        text: 'Test todo',
        type: 'one-time',
        state: 'pending'
      });

      await expect(todo.save()).rejects.toThrow();
    });

    it('should have state field default to pending', async () => {
      const todo = new Todo({ 
        text: 'Test todo',
        type: 'daily'
      });
      const savedTodo = await todo.save();

      expect(savedTodo.state).toBe('pending');
    });

    it('should not allow empty text', async () => {
      const todo = new Todo({ 
        text: '', 
        type: 'daily',
        state: 'pending'
      });

      await expect(todo.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    it('should activate a pending todo', async () => {
      const todo = new Todo({
        text: 'Test todo',
        type: 'daily',
        state: 'pending'
      });
      await todo.save();

      const activatedTodo = await todo.activate();

      expect(activatedTodo.state).toBe('active');
      expect(activatedTodo.activatedAt).toBeDefined();
    });

    it('should complete an active todo', async () => {
      const todo = new Todo({
        text: 'Test todo',
        type: 'daily',
        state: 'active',
        activatedAt: new Date()
      });
      await todo.save();

      const completedTodo = await todo.complete();

      expect(completedTodo.state).toBe('completed');
      expect(completedTodo.completedAt).toBeDefined();
    });

    it('should fail an active todo', async () => {
      const todo = new Todo({
        text: 'Test todo',
        type: 'daily',
        state: 'active',
        activatedAt: new Date()
      });
      await todo.save();

      const failedTodo = await todo.fail();

      expect(failedTodo.state).toBe('failed');
      expect(failedTodo.failedAt).toBeDefined();
    });

    it('should reactivate a completed todo', async () => {
      const todo = new Todo({
        text: 'Test todo',
        type: 'daily',
        state: 'completed',
        completedAt: new Date()
      });
      await todo.save();

      const reactivatedTodo = await todo.reactivate();

      expect(reactivatedTodo.state).toBe('active');
      expect(reactivatedTodo.originalId).toBe((todo._id as any).toString());
      expect(reactivatedTodo.isReactivation).toBe(true);
      expect(reactivatedTodo.activatedAt).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test data
      await Todo.create([
        { text: 'Pending todo 1', type: 'one-time', state: 'pending', dueAt: new Date('2024-12-31T23:59:59.000Z') },
        { text: 'Active todo 1', type: 'daily', state: 'active', activatedAt: new Date() },
        { text: 'Completed todo 1', type: 'one-time', state: 'completed', dueAt: new Date('2024-12-31T23:59:59.000Z'), completedAt: new Date() },
        { text: 'Failed todo 1', type: 'daily', state: 'failed', failedAt: new Date() },
      ]);
    });

    it('should find todos by state', async () => {
      const pendingTodos = await Todo.findByState('pending');
      const activeTodos = await Todo.findByState('active');

      expect(pendingTodos).toHaveLength(1);
      expect(activeTodos).toHaveLength(1);
      expect(pendingTodos[0].state).toBe('pending');
      expect(activeTodos[0].state).toBe('active');
    });

    it('should find todos by type', async () => {
      const oneTimeTodos = await Todo.findByType('one-time');
      const dailyTodos = await Todo.findByType('daily');

      expect(oneTimeTodos).toHaveLength(2);
      expect(dailyTodos).toHaveLength(2);
      expect(oneTimeTodos.every((todo: any) => todo.type === 'one-time')).toBe(true);
      expect(dailyTodos.every((todo: any) => todo.type === 'daily')).toBe(true);
    });

    it('should find overdue tasks', async () => {
      // Create an overdue task
      await Todo.create({
        text: 'Overdue todo',
        type: 'one-time',
        state: 'active',
        dueAt: new Date('2020-01-01T00:00:00.000Z'),
        activatedAt: new Date()
      });

      const overdueTasks = await Todo.findOverdueTasks();

      expect(overdueTasks).toHaveLength(1);
      expect(overdueTasks[0].text).toBe('Overdue todo');
    });
  });
});