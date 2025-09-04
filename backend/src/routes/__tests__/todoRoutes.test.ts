import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import todoRoutes from '../todoRoutes';
import Todo from '../../models/Todo';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/todos', todoRoutes);

describe('Todo Routes Integration Tests', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await Todo.deleteMany({});
  });

  describe('GET /api/todos', () => {
    it('should return all todos grouped by state', async () => {
      // Create test todos with different states
      const pendingTodo = await Todo.create({
        text: 'Pending todo',
        type: 'one-time',
        state: 'pending',
        dueAt: new Date(Date.now() + 86400000), // Tomorrow
      });

      const activeTodo = await Todo.create({
        text: 'Active todo',
        type: 'daily',
        state: 'active',
        activatedAt: new Date(),
      });

      const completedTodo = await Todo.create({
        text: 'Completed todo',
        type: 'one-time',
        state: 'completed',
        dueAt: new Date(Date.now() + 86400000), // Tomorrow
        activatedAt: new Date(Date.now() - 3600000), // 1 hour ago
        completedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pending');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('failed');
      expect(response.body.data.pending).toHaveLength(1);
      expect(response.body.data.active).toHaveLength(1);
      expect(response.body.data.completed).toHaveLength(1);
      expect(response.body.data.failed).toHaveLength(0);
    });

    it('should return empty groups when no todos exist', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        pending: [],
        active: [],
        completed: [],
        failed: [],
      });
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new one-time todo', async () => {
      const todoData = {
        text: 'New one-time todo',
        type: 'one-time',
        dueAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBe('New one-time todo');
      expect(response.body.data.type).toBe('one-time');
      expect(response.body.data.state).toBe('pending');
      expect(response.body.data.dueAt).toBeDefined();
    });

    it('should create a new daily todo', async () => {
      const todoData = {
        text: 'New daily todo',
        type: 'daily',
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBe('New daily todo');
      expect(response.body.data.type).toBe('daily');
      expect(response.body.data.state).toBe('pending');
    });

    it('should reject one-time todo without dueAt', async () => {
      const todoData = {
        text: 'Invalid todo',
        type: 'one-time',
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PATCH /api/todos/:id/activate', () => {
    it('should activate a pending todo', async () => {
      const todo = await Todo.create({
        text: 'Pending todo',
        type: 'one-time',
        state: 'pending',
        dueAt: new Date(Date.now() + 86400000),
      });

      const response = await request(app)
        .patch(`/api/todos/${todo._id}/activate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.state).toBe('active');
      expect(response.body.data.activatedAt).toBeDefined();
    });

    it('should return 404 for non-existent todo', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .patch(`/api/todos/${fakeId}/activate`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to activate todo');
    });
  });

  describe('PATCH /api/todos/:id/complete', () => {
    it('should complete an active todo', async () => {
      const todo = await Todo.create({
        text: 'Active todo',
        type: 'daily',
        state: 'active',
        activatedAt: new Date(),
      });

      const response = await request(app)
        .patch(`/api/todos/${todo._id}/complete`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.state).toBe('completed');
      expect(response.body.data.completedAt).toBeDefined();
    });
  });

  describe('PATCH /api/todos/:id/fail', () => {
    it('should fail an active todo', async () => {
      const todo = await Todo.create({
        text: 'Active todo',
        type: 'daily',
        state: 'active',
        activatedAt: new Date(),
      });

      const response = await request(app)
        .patch(`/api/todos/${todo._id}/fail`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.state).toBe('failed');
      expect(response.body.data.failedAt).toBeDefined();
    });
  });

  describe('PATCH /api/todos/:id/reactivate', () => {
    it('should reactivate a completed todo', async () => {
      const todo = await Todo.create({
        text: 'Completed todo',
        type: 'one-time',
        state: 'completed',
        dueAt: new Date(Date.now() + 86400000), // Tomorrow
        activatedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(),
      });

      const response = await request(app)
        .patch(`/api/todos/${todo._id}/reactivate`)
        .send({ newDueAt: new Date(Date.now() + 86400000).toISOString() })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.state).toBe('active');
      expect(response.body.data.isReactivation).toBe(true);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const todo = await Todo.create({
        text: 'Todo to delete',
        type: 'daily',
        state: 'pending',
      });

      const response = await request(app)
        .delete(`/api/todos/${todo._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo deleted successfully');

      // Verify todo is deleted
      const deletedTodo = await Todo.findById(todo._id);
      expect(deletedTodo).toBeNull();
    });
  });
});
