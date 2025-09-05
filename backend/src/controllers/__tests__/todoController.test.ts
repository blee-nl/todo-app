import { Request, Response } from 'express';
import Todo from '../../models/Todo';
import { getAllTodos, createTodo, updateTodo, activateTodo, completeTodo, failTodo, reactivateTodo } from '../todoController';
import { mockTodos, mockGroupedTodos, mockCreateTodoRequest, mockCreateDailyTodoRequest } from '../../test/utils';

// Mock the Todo model
jest.mock('../../models/Todo');
const MockedTodo = Todo as jest.Mocked<typeof Todo>;

describe('Todo Controller', () => {
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

  describe('getAllTodos', () => {
    it('should return all todos grouped by state', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockTodos)
      };
      MockedTodo.find = jest.fn().mockReturnValue(mockQuery);

      await getAllTodos(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        count: 4,
        data: mockGroupedTodos,
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      const mockQuery = {
        sort: jest.fn().mockRejectedValue(error)
      };
      MockedTodo.find = jest.fn().mockReturnValue(mockQuery);

      await getAllTodos(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch todos',
        message: 'Database connection failed',
      });
    });
  });

  describe('createTodo', () => {
    it('should create a new one-time todo', async () => {
      const futureDueDate = new Date();
      futureDueDate.setMinutes(futureDueDate.getMinutes() + 15); // 15 minutes from now
      
      mockReq.body = {
        ...mockCreateTodoRequest,
        dueAt: futureDueDate.toISOString()
      };
      
      const createdTodo = { ...mockTodos[0], _id: 'new-id', dueAt: futureDueDate };
      MockedTodo.findOne = jest.fn().mockResolvedValue(null); // No duplicate
      MockedTodo.prototype.save = jest.fn().mockResolvedValue(createdTodo);

      await createTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo created successfully',
        data: createdTodo,
      });
    });

    it('should create a new daily todo', async () => {
      mockReq.body = mockCreateDailyTodoRequest;
      
      const createdTodo = { ...mockTodos[1], _id: 'new-id' };
      MockedTodo.findOne = jest.fn().mockResolvedValue(null); // No duplicate
      MockedTodo.prototype.save = jest.fn().mockResolvedValue(createdTodo);

      await createTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo created successfully',
        data: createdTodo,
      });
    });

    it('should reject duplicate active tasks', async () => {
      const futureDueDate = new Date();
      futureDueDate.setMinutes(futureDueDate.getMinutes() + 15); // 15 minutes from now
      
      mockReq.body = {
        ...mockCreateTodoRequest,
        dueAt: futureDueDate.toISOString()
      };
      
      MockedTodo.findOne = jest.fn().mockResolvedValue(mockTodos[2]); // Found duplicate

      await createTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create todo',
        message: 'An active task with this content already exists',
      });
    });

    it('should reject due date less than 10 minutes from now', async () => {
      const pastDueDate = new Date();
      pastDueDate.setMinutes(pastDueDate.getMinutes() + 5); // Only 5 minutes from now
      
      mockReq.body = {
        ...mockCreateTodoRequest,
        dueAt: pastDueDate.toISOString()
      };
      
      MockedTodo.findOne = jest.fn().mockResolvedValue(null); // No duplicate

      await createTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create todo',
        message: 'Due date must be at least 10 minutes from now',
      });
    });

    it('should accept due date more than 10 minutes from now', async () => {
      const futureDueDate = new Date();
      futureDueDate.setMinutes(futureDueDate.getMinutes() + 15); // 15 minutes from now
      
      mockReq.body = {
        ...mockCreateTodoRequest,
        dueAt: futureDueDate.toISOString()
      };
      
      const createdTodo = { ...mockTodos[0], _id: 'new-id', dueAt: futureDueDate };
      MockedTodo.findOne = jest.fn().mockResolvedValue(null); // No duplicate
      MockedTodo.prototype.save = jest.fn().mockResolvedValue(createdTodo);

      await createTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo created successfully',
        data: createdTodo,
      });
    });
  });

  describe('updateTodo', () => {
    it('should update a pending todo text', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      mockReq.body = { text: 'Updated pending todo text' };
      
      const todo = { 
        ...mockTodos[0], 
        state: 'pending',
        type: 'one-time',
        text: 'Updated pending todo text',
        save: jest.fn().mockResolvedValue({ ...mockTodos[0], text: 'Updated pending todo text' })
      };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo updated successfully',
        data: { ...mockTodos[0], text: 'Updated pending todo text' },
      });
    });

    it('should update an active todo text', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439013' };
      mockReq.body = { text: 'Updated active todo text' };
      
      const todo = { 
        ...mockTodos[2], 
        state: 'active',
        type: 'one-time',
        text: 'Updated active todo text',
        save: jest.fn().mockResolvedValue({ ...mockTodos[2], text: 'Updated active todo text' })
      };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo updated successfully',
        data: { ...mockTodos[2], text: 'Updated active todo text' },
      });
    });

    it('should update a one-time todo with dueAt', async () => {
      const futureDueDate = new Date();
      futureDueDate.setMinutes(futureDueDate.getMinutes() + 15); // 15 minutes from now
      
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      mockReq.body = { 
        text: 'Updated todo text',
        dueAt: futureDueDate.toISOString()
      };
      
      const todo = { 
        ...mockTodos[0], 
        state: 'pending',
        type: 'one-time',
        text: 'Updated todo text',
        dueAt: futureDueDate,
        save: jest.fn().mockResolvedValue({ 
          ...mockTodos[0], 
          text: 'Updated todo text',
          dueAt: futureDueDate
        })
      };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo updated successfully',
        data: { 
          ...mockTodos[0], 
          text: 'Updated todo text',
          dueAt: futureDueDate
        },
      });
    });

    it('should reject updating completed todo', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439012' };
      mockReq.body = { text: 'Updated completed todo text' };
      
      const todo = { ...mockTodos[1], state: 'completed' };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update todo',
        message: 'Only pending and active tasks can be edited',
      });
    });

    it('should reject updating failed todo', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439014' };
      mockReq.body = { text: 'Updated failed todo text' };
      
      const todo = { ...mockTodos[3], state: 'failed' };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update todo',
        message: 'Only pending and active tasks can be edited',
      });
    });

    it('should handle todo not found', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      mockReq.body = { text: 'Updated todo text' };
      
      MockedTodo.findById = jest.fn().mockResolvedValue(null);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update todo',
        message: 'Todo not found',
      });
    });

    it('should reject empty text', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      mockReq.body = { text: '' };
      
      const todo = { ...mockTodos[0], state: 'pending' };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update todo',
        message: 'Todo text is required',
      });
    });

    it('should reject text longer than 500 characters', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      mockReq.body = { text: 'a'.repeat(501) };
      
      const todo = { ...mockTodos[0], state: 'pending' };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update todo',
        message: 'Todo text cannot exceed 500 characters',
      });
    });

    it('should reject invalid dueAt format', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      mockReq.body = { 
        text: 'Updated todo text',
        dueAt: 'invalid-date'
      };
      
      const todo = { ...mockTodos[0], state: 'pending', type: 'one-time' };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update todo',
        message: 'Invalid due date format',
      });
    });

    it('should reject due date less than 10 minutes from now in update', async () => {
      const pastDueDate = new Date();
      pastDueDate.setMinutes(pastDueDate.getMinutes() + 5); // Only 5 minutes from now
      
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      mockReq.body = { 
        text: 'Updated todo text',
        dueAt: pastDueDate.toISOString()
      };
      
      const todo = { ...mockTodos[0], state: 'pending', type: 'one-time' };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update todo',
        message: 'Due date must be at least 10 minutes from now',
      });
    });

    it('should accept due date more than 10 minutes from now in update', async () => {
      const futureDueDate = new Date();
      futureDueDate.setMinutes(futureDueDate.getMinutes() + 15); // 15 minutes from now
      
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      mockReq.body = { 
        text: 'Updated todo text',
        dueAt: futureDueDate.toISOString()
      };
      
      const todo = { 
        ...mockTodos[0], 
        state: 'pending', 
        type: 'one-time',
        text: 'Updated todo text',
        dueAt: futureDueDate,
        save: jest.fn().mockResolvedValue({ 
          ...mockTodos[0], 
          text: 'Updated todo text',
          dueAt: futureDueDate
        })
      };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await updateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo updated successfully',
        data: { 
          ...mockTodos[0], 
          text: 'Updated todo text',
          dueAt: futureDueDate
        },
      });
    });
  });

  describe('activateTodo', () => {
    it('should activate a pending todo', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      
      const todo = { ...mockTodos[0], activate: jest.fn().mockResolvedValue(mockTodos[2]) };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);
      MockedTodo.findOne = jest.fn().mockResolvedValue(null); // No duplicate found

      await activateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo activated successfully',
        data: mockTodos[2],
      });
    });

    it('should handle todo not found', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439011' };
      
      MockedTodo.findById = jest.fn().mockResolvedValue(null);

      await activateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to activate todo',
        message: 'Todo not found',
      });
    });
  });

  describe('completeTodo', () => {
    it('should complete an active todo', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439013' };
      
      const todo = { ...mockTodos[2], complete: jest.fn().mockResolvedValue(mockTodos[1]) };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await completeTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo completed successfully',
        data: mockTodos[1],
      });
    });
  });

  describe('failTodo', () => {
    it('should fail an active todo', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439013' };
      
      const todo = { ...mockTodos[2], fail: jest.fn().mockResolvedValue(mockTodos[3]) };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);

      await failTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo marked as failed',
        data: mockTodos[3],
      });
    });
  });

  describe('reactivateTodo', () => {
    it('should reactivate a completed todo', async () => {
      mockReq.params = { id: '507f1f77bcf86cd799439012' };
      mockReq.body = { newDueAt: '2024-12-31T23:59:59.000Z' };
      
      const todo = { ...mockTodos[1], reactivate: jest.fn().mockResolvedValue(mockTodos[2]) };
      MockedTodo.findById = jest.fn().mockResolvedValue(todo);
      MockedTodo.findOne = jest.fn().mockResolvedValue(null); // No duplicate found

      await reactivateTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo re-activated successfully',
        data: mockTodos[2],
      });
    });
  });
});
