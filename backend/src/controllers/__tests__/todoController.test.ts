import { Request, Response } from 'express';
import Todo from '../../models/Todo';
import { getAllTodos, createTodo } from '../todoController';

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
    it('should return all todos successfully', async () => {
      const mockTodos = [
        { _id: '1', text: 'Test todo 1', completed: false },
        { _id: '2', text: 'Test todo 2', completed: true },
      ];

      MockedTodo.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTodos),
      } as any);

      await getAllTodos(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        count: mockTodos.length,
        data: mockTodos,
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      MockedTodo.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(error),
      } as any);

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
    it('should create a new todo', async () => {
      const newTodo = { text: 'New todo' };
      mockReq.body = newTodo;
      
      const createdTodo = { _id: '3', text: newTodo.text, completed: false };
      // Mock the Todo constructor
      (MockedTodo as any).mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(createdTodo),
      }));

      await createTodo(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Todo created successfully',
        data: createdTodo,
      });
    });
  });
});
