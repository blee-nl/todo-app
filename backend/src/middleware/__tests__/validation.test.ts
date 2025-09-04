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
    it('should pass validation for valid todo data', () => {
      mockReq.body = { text: 'Valid todo text' };
      mockReq.method = 'POST';

      validateTodo(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should reject empty text', () => {
      mockReq.body = { text: '' };
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
