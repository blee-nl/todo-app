import { Request, Response, NextFunction } from 'express';

// Validation interface
interface ValidationError {
  field: string;
  message: string;
}

// Todo validation middleware
export const validateTodo = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { text, type, dueAt, newDueAt } = req.body;

  // Validate text field
  if (req.method === 'POST' || (req.method === 'PUT' && text !== undefined)) {
    if (!text || text.trim().length === 0) {
      errors.push({
        field: 'text',
        message: 'Todo text is required and cannot be empty'
      });
    } else if (text.length > 500) {
      errors.push({
        field: 'text',
        message: 'Todo text cannot exceed 500 characters'
      });
    }
  }

  // Validate type field (for POST requests)
  if (req.method === 'POST') {
    if (!type) {
      errors.push({
        field: 'type',
        message: 'Task type is required'
      });
    } else if (!['one-time', 'daily'].includes(type)) {
      errors.push({
        field: 'type',
        message: 'Task type must be "one-time" or "daily"'
      });
    }
  }

  // Validate dueAt field for one-time tasks
  if (req.method === 'POST' && type === 'one-time') {
    if (!dueAt) {
      errors.push({
        field: 'dueAt',
        message: 'Due date is required for one-time tasks'
      });
    } else {
      const dueDate = new Date(dueAt);
      if (isNaN(dueDate.getTime())) {
        errors.push({
          field: 'dueAt',
          message: 'Due date must be a valid date'
        });
      } else if (dueDate <= new Date()) {
        errors.push({
          field: 'dueAt',
          message: 'Due date must be in the future'
        });
      }
    }
  }

  // Validate newDueAt field for re-activation
  if (req.method === 'PATCH' && req.path.includes('/reactivate') && newDueAt) {
    const dueDate = new Date(newDueAt);
    if (isNaN(dueDate.getTime())) {
      errors.push({
        field: 'newDueAt',
        message: 'New due date must be a valid date'
      });
    } else if (dueDate <= new Date()) {
      errors.push({
        field: 'newDueAt',
        message: 'New due date must be in the future'
      });
    }
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
    return;
  }

  next();
};

// ID validation middleware
export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      message: 'ID must be a valid MongoDB ObjectId (24 characters)'
    });
    return;
  }

  next();
};

// Query parameter validation middleware
export const validateQueryParams = (req: Request, res: Response, next: NextFunction): void => {
  const { completed, limit, page } = req.query;
  const errors: ValidationError[] = [];

  // Validate completed query parameter
  if (completed !== undefined && !['true', 'false'].includes(completed as string)) {
    errors.push({
      field: 'completed',
      message: 'Completed parameter must be either "true" or "false"'
    });
  }

  // Validate limit query parameter
  if (limit !== undefined) {
    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push({
        field: 'limit',
        message: 'Limit must be a number between 1 and 100'
      });
    }
  }

  // Validate page query parameter
  if (page !== undefined) {
    const pageNum = parseInt(page as string, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push({
        field: 'page',
        message: 'Page must be a positive number'
      });
    }
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid query parameters',
      details: errors
    });
    return;
  }

  next();
};

// Rate limiting middleware (basic implementation)
export const rateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // This is a basic rate limiting implementation
  // In production, you'd want to use a proper rate limiting library like express-rate-limit
  
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Simple in-memory rate limiting (not suitable for production)
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = new Map();
  }
  
  const clientData = req.app.locals.rateLimit.get(clientIP) || { count: 0, resetTime: now + 60000 };
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + 60000; // 1 minute window
  } else {
    clientData.count++;
  }
  
  if (clientData.count > 100) { // 100 requests per minute
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
    return;
  }
  
  req.app.locals.rateLimit.set(clientIP, clientData);
  next();
};
