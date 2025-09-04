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
    it('should return all todos', async () => {
      // Create test todos
      const todos = await Todo.create([
        { text: 'Todo 1', completed: false },
        { text: 'Todo 2', completed: true },
      ]);

      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no todos exist', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const todoData = { text: 'New todo' };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBe('New todo');
      expect(response.body.data.completed).toBe(false);
      expect(response.body.data.id).toBeDefined();
    });
  });
});
