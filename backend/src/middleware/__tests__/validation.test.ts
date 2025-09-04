import { Request, Response, NextFunction } from 'express';
import { validateTodo, validateId } from '../validation';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    mockNext = jest.fn();
    mockReq = {};
    jest.clearAllMocks();
  });

  describe('validateTodo', () => {
    it('should pass validation for valid one-time todo data', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      mockReq.body = { 
        text: 'Valid todo text',
        type: 'one-time',
        dueAt: futureDate
      };
      mockReq.method = 'POST';

      validateTodo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should pass validation for valid daily todo data', () => {
      mockReq.body = { 
        text: 'Valid daily todo',
        type: 'daily'
      };
      mockReq.method = 'POST';

      validateTodo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should reject empty text', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      mockReq.body = { 
        text: '',
        type: 'one-time',
        dueAt: futureDate
      };
      mockReq.method = 'POST';

      validateTodo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: [{
          field: 'text',
          message: 'Todo text is required and cannot be empty'
        }]
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject missing type', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      mockReq.body = { 
        text: 'Valid todo text',
        dueAt: futureDate
      };
      mockReq.method = 'POST';

      validateTodo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: [{
          field: 'type',
          message: 'Task type is required'
        }]
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject one-time todo without dueAt', () => {
      mockReq.body = { 
        text: 'Valid todo text',
        type: 'one-time'
      };
      mockReq.method = 'POST';

      validateTodo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: [{
          field: 'dueAt',
          message: 'Due date is required for one-time tasks'
        }]
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject past due date for one-time tasks', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
      mockReq.body = { 
        text: 'Valid todo text',
        type: 'one-time',
        dueAt: pastDate
      };
      mockReq.method = 'POST';

      validateTodo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: [{
          field: 'dueAt',
          message: 'Due date must be in the future'
        }]
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateId', () => {
    it('should pass validation for valid MongoDB ObjectId', () => {
      mockReq.params = { id: '507f1f77bcf86cd799439011' };

      validateId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should reject invalid ObjectId format', () => {
      mockReq.params = { id: 'invalid-id' };

      validateId(mockReq as Request, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid ID format',
        message: 'ID must be a valid MongoDB ObjectId (24 characters)',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
