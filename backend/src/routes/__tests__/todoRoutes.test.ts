import request from 'supertest';
import express from 'express';
import todoRoutes from '../todoRoutes';
import * as todoController from '../../controllers/todoController';
import * as validation from '../../middleware/validation';

// Mock all controller functions
jest.mock('../../controllers/todoController');
jest.mock('../../middleware/validation');

const mockedTodoController = todoController as jest.Mocked<typeof todoController>;
const mockedValidation = validation as jest.Mocked<typeof validation>;

describe('Todo Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/todos', todoRoutes);

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default middleware mocks to pass through
    mockedValidation.validateTodo.mockImplementation((req, res, next) => next());
    mockedValidation.validateId.mockImplementation((req, res, next) => next());

    // Setup default controller mocks
    mockedTodoController.getAllTodos.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: { pending: [], active: [], completed: [], failed: [] } });
    });

    mockedTodoController.getTodosByState.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: [] });
    });

    mockedTodoController.getTodoById.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: { id: req.params.id, text: 'Test todo' } });
    });

    mockedTodoController.createTodo.mockImplementation(async (req, res) => {
      res.status(201).json({ success: true, message: 'Todo created successfully', data: { id: '123', ...req.body } });
    });

    mockedTodoController.updateTodo.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Todo updated successfully', data: { id: req.params.id, ...req.body } });
    });

    mockedTodoController.activateTodo.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Todo activated successfully', data: { id: req.params.id, state: 'active' } });
    });

    mockedTodoController.completeTodo.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Todo completed successfully', data: { id: req.params.id, state: 'completed' } });
    });

    mockedTodoController.failTodo.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Todo failed successfully', data: { id: req.params.id, state: 'failed' } });
    });

    mockedTodoController.reactivateTodo.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Todo reactivated successfully', data: { id: req.params.id, state: 'pending' } });
    });

    mockedTodoController.deleteTodo.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Todo deleted successfully' });
    });

    mockedTodoController.deleteCompletedTodos.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Completed todos deleted successfully' });
    });

    mockedTodoController.deleteFailedTodos.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Failed todos deleted successfully' });
    });

    mockedTodoController.processOverdueTasks.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Overdue tasks processed' });
    });

    mockedTodoController.processDailyTasks.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Daily tasks processed' });
    });

    mockedTodoController.getTasksForNotification.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, data: [] });
    });

    mockedTodoController.updateNotificationSettings.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Notification settings updated' });
    });

    mockedTodoController.markTaskAsNotified.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Task marked as notified' });
    });
  });

  describe('GET /api/todos', () => {
    it('should call getAllTodos controller', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(mockedTodoController.getAllTodos).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
    });

    it('should not apply validation middleware', async () => {
      await request(app).get('/api/todos');

      expect(mockedValidation.validateTodo).not.toHaveBeenCalled();
      expect(mockedValidation.validateId).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/todos/state/:state', () => {
    it('should call getTodosByState controller with state parameter', async () => {
      const state = 'active';
      const response = await request(app)
        .get(`/api/todos/state/${state}`)
        .expect(200);

      expect(mockedTodoController.getTodosByState).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
    });

    it('should not apply validation middleware', async () => {
      await request(app).get('/api/todos/state/pending');

      expect(mockedValidation.validateTodo).not.toHaveBeenCalled();
      expect(mockedValidation.validateId).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/todos/notifications', () => {
    it('should call getTasksForNotification controller', async () => {
      const response = await request(app)
        .get('/api/todos/notifications')
        .expect(200);

      expect(mockedTodoController.getTasksForNotification).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should call getTodoById controller with ID validation', async () => {
      const todoId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/todos/${todoId}`)
        .expect(200);

      expect(mockedValidation.validateId).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.getTodoById).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
    });

    it('should handle validation middleware failure', async () => {
      mockedValidation.validateId.mockImplementation((req, res, next) => {
        res.status(400).json({ success: false, error: 'Invalid ID format' });
      });

      await request(app)
        .get('/api/todos/invalid-id')
        .expect(400);

      expect(mockedValidation.validateId).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.getTodoById).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/todos', () => {
    it('should call createTodo controller with validation', async () => {
      const todoData = {
        text: 'Test todo',
        type: 'one-time',
        dueAt: '2024-12-31T23:59:59.000Z'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(mockedValidation.validateTodo).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.createTodo).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo created successfully');
    });

    it('should handle validation middleware failure', async () => {
      mockedValidation.validateTodo.mockImplementation((req, res, next) => {
        res.status(400).json({ success: false, error: 'Validation failed' });
      });

      await request(app)
        .post('/api/todos')
        .send({ text: '' })
        .expect(400);

      expect(mockedValidation.validateTodo).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.createTodo).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should call updateTodo controller with ID validation', async () => {
      const todoId = '507f1f77bcf86cd799439011';
      const updateData = { text: 'Updated todo text' };

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send(updateData)
        .expect(200);

      expect(mockedValidation.validateId).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.updateTodo).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo updated successfully');
    });
  });

  describe('PATCH /api/todos/:id/activate', () => {
    it('should call activateTodo controller with ID validation', async () => {
      const todoId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .patch(`/api/todos/${todoId}/activate`)
        .expect(200);

      expect(mockedValidation.validateId).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.activateTodo).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo activated successfully');
    });
  });

  describe('PATCH /api/todos/:id/complete', () => {
    it('should call completeTodo controller with ID validation', async () => {
      const todoId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .patch(`/api/todos/${todoId}/complete`)
        .expect(200);

      expect(mockedValidation.validateId).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.completeTodo).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo completed successfully');
    });
  });

  describe('PATCH /api/todos/:id/fail', () => {
    it('should call failTodo controller with ID validation', async () => {
      const todoId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .patch(`/api/todos/${todoId}/fail`)
        .expect(200);

      expect(mockedValidation.validateId).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.failTodo).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo failed successfully');
    });
  });

  describe('PATCH /api/todos/:id/reactivate', () => {
    it('should call reactivateTodo controller with ID validation', async () => {
      const todoId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .patch(`/api/todos/${todoId}/reactivate`)
        .expect(200);

      expect(mockedValidation.validateId).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.reactivateTodo).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo reactivated successfully');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should call deleteTodo controller with ID validation', async () => {
      const todoId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(200);

      expect(mockedValidation.validateId).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.deleteTodo).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo deleted successfully');
    });
  });

  describe('DELETE /api/todos/completed', () => {
    it('should call deleteCompletedTodos controller', async () => {
      const response = await request(app)
        .delete('/api/todos/completed')
        .expect(200);

      expect(mockedTodoController.deleteCompletedTodos).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Completed todos deleted successfully');
    });

    it('should not apply validation middleware', async () => {
      await request(app).delete('/api/todos/completed');

      expect(mockedValidation.validateTodo).not.toHaveBeenCalled();
      expect(mockedValidation.validateId).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/todos/failed', () => {
    it('should call deleteFailedTodos controller', async () => {
      const response = await request(app)
        .delete('/api/todos/failed')
        .expect(200);

      expect(mockedTodoController.deleteFailedTodos).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Failed todos deleted successfully');
    });

    it('should not apply validation middleware', async () => {
      await request(app).delete('/api/todos/failed');

      expect(mockedValidation.validateTodo).not.toHaveBeenCalled();
      expect(mockedValidation.validateId).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/todos/process/overdue', () => {
    it('should call processOverdueTasks controller', async () => {
      const response = await request(app)
        .post('/api/todos/process/overdue')
        .expect(200);

      expect(mockedTodoController.processOverdueTasks).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Overdue tasks processed');
    });

    it('should not apply validation middleware', async () => {
      await request(app).post('/api/todos/process/overdue');

      expect(mockedValidation.validateTodo).not.toHaveBeenCalled();
      expect(mockedValidation.validateId).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/todos/process/daily', () => {
    it('should call processDailyTasks controller', async () => {
      const response = await request(app)
        .post('/api/todos/process/daily')
        .expect(200);

      expect(mockedTodoController.processDailyTasks).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Daily tasks processed');
    });

    it('should not apply validation middleware', async () => {
      await request(app).post('/api/todos/process/daily');

      expect(mockedValidation.validateTodo).not.toHaveBeenCalled();
      expect(mockedValidation.validateId).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/todos/:id/notification', () => {
    it('should call updateNotificationSettings controller with ID validation', async () => {
      const todoId = '507f1f77bcf86cd799439011';
      const notificationData = {
        enabled: true,
        reminderMinutes: 15
      };

      const response = await request(app)
        .put(`/api/todos/${todoId}/notification`)
        .send(notificationData)
        .expect(200);

      expect(mockedValidation.validateId).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.updateNotificationSettings).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification settings updated');
    });
  });

  describe('POST /api/todos/:id/notification/mark', () => {
    it('should call markTaskAsNotified controller with ID validation', async () => {
      const todoId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post(`/api/todos/${todoId}/notification/mark`)
        .expect(200);

      expect(mockedValidation.validateId).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.markTaskAsNotified).toHaveBeenCalledTimes(1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task marked as notified');
    });
  });

  describe('Route Order and Specificity', () => {
    it('should prioritize specific routes over parameterized routes', async () => {
      // Test that /api/todos/completed doesn't match /api/todos/:id
      await request(app)
        .delete('/api/todos/completed')
        .expect(200);

      expect(mockedTodoController.deleteCompletedTodos).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.deleteTodo).not.toHaveBeenCalled();
    });

    it('should prioritize specific routes for notifications', async () => {
      // Test that /api/todos/notifications doesn't match /api/todos/:id
      await request(app)
        .get('/api/todos/notifications')
        .expect(200);

      expect(mockedTodoController.getTasksForNotification).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.getTodoById).not.toHaveBeenCalled();
    });

    it('should handle state routes correctly', async () => {
      // Test that /api/todos/state/active works correctly
      await request(app)
        .get('/api/todos/state/active')
        .expect(200);

      expect(mockedTodoController.getTodosByState).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.getTodoById).not.toHaveBeenCalled();
    });
  });

  describe('HTTP Methods', () => {
    it('should only accept GET for listing routes', async () => {
      await request(app)
        .post('/api/todos/notifications')
        .expect(404);

      await request(app)
        .put('/api/todos/state/active')
        .expect(404);
    });

    it('should only accept specific methods for ID-based routes', async () => {
      const todoId = '507f1f77bcf86cd799439011';

      // Test unsupported methods
      await request(app)
        .post(`/api/todos/${todoId}`)
        .expect(404);

      await request(app)
        .patch(`/api/todos/${todoId}`)
        .expect(404);
    });

    it('should handle PATCH methods for state changes', async () => {
      const todoId = '507f1f77bcf86cd799439011';

      // All these should work
      await Promise.all([
        request(app).patch(`/api/todos/${todoId}/activate`).expect(200),
        request(app).patch(`/api/todos/${todoId}/complete`).expect(200),
        request(app).patch(`/api/todos/${todoId}/fail`).expect(200),
        request(app).patch(`/api/todos/${todoId}/reactivate`).expect(200)
      ]);

      expect(mockedTodoController.activateTodo).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.completeTodo).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.failTodo).toHaveBeenCalledTimes(1);
      expect(mockedTodoController.reactivateTodo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Middleware Integration', () => {
    it('should apply validateId to all ID-based routes', async () => {
      const todoId = '507f1f77bcf86cd799439011';

      await Promise.all([
        request(app).get(`/api/todos/${todoId}`),
        request(app).put(`/api/todos/${todoId}`).send({ text: 'Updated' }),
        request(app).patch(`/api/todos/${todoId}/activate`),
        request(app).patch(`/api/todos/${todoId}/complete`),
        request(app).patch(`/api/todos/${todoId}/fail`),
        request(app).patch(`/api/todos/${todoId}/reactivate`),
        request(app).delete(`/api/todos/${todoId}`),
        request(app).put(`/api/todos/${todoId}/notification`).send({ enabled: true }),
        request(app).post(`/api/todos/${todoId}/notification/mark`)
      ]);

      // validateId should be called for each ID-based route
      expect(mockedValidation.validateId).toHaveBeenCalledTimes(9);
    });

    it('should apply validateTodo only to creation routes', async () => {
      await request(app)
        .post('/api/todos')
        .send({ text: 'Test', type: 'one-time' });

      expect(mockedValidation.validateTodo).toHaveBeenCalledTimes(1);
    });

    it('should not apply validation to routes that don\'t need it', async () => {
      await Promise.all([
        request(app).get('/api/todos'),
        request(app).get('/api/todos/state/active'),
        request(app).get('/api/todos/notifications'),
        request(app).delete('/api/todos/completed'),
        request(app).delete('/api/todos/failed'),
        request(app).post('/api/todos/process/overdue'),
        request(app).post('/api/todos/process/daily')
      ]);

      // These routes should not trigger any validation
      expect(mockedValidation.validateTodo).not.toHaveBeenCalled();
      expect(mockedValidation.validateId).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle controller errors gracefully', async () => {
      mockedTodoController.getAllTodos.mockImplementation(async (req, res) => {
        res.status(500).json({ success: false, error: 'Internal server error' });
      });

      const response = await request(app)
        .get('/api/todos')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle validation errors', async () => {
      mockedValidation.validateId.mockImplementation((req, res, next) => {
        res.status(400).json({ success: false, error: 'Invalid ID format' });
      });

      const response = await request(app)
        .get('/api/todos/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid ID format');
    });
  });
});