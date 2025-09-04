import { Request, Response } from 'express';
import Todo from '../../models/Todo';
import { getAllTodos, createTodo, activateTodo, completeTodo, failTodo, reactivateTodo } from '../todoController';
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
      mockReq.body = mockCreateTodoRequest;
      
      const createdTodo = { ...mockTodos[0], _id: 'new-id' };
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
      mockReq.body = mockCreateTodoRequest;
      
      MockedTodo.findOne = jest.fn().mockResolvedValue(mockTodos[2]); // Found duplicate

      await createTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create todo',
        message: 'An active task with this content already exists',
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
