import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Todo App API',
    version: '1.0.0',
    description: 'A comprehensive REST API for managing todos with different states and types',
    contact: {
      name: 'BLEE',
    },
  },
  servers: [
    {
      url: 'http://localhost:5001',
      description: 'Development server'
    },
    {
      url: 'https://api.todoapp.com',
      description: 'Production server'
    }
  ],
  components: {
    schemas: {
      Todo: {
        type: 'object',
        required: ['text', 'type', 'state'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique identifier for the todo',
            example: '507f1f77bcf86cd799439011'
          },
          text: {
            type: 'string',
            description: 'The todo text content',
            maxLength: 500,
            example: 'Complete project documentation'
          },
          type: {
            type: 'string',
            enum: ['one-time', 'daily'],
            description: 'Type of the todo task',
            example: 'one-time'
          },
          state: {
            type: 'string',
            enum: ['pending', 'active', 'completed', 'failed'],
            description: 'Current state of the todo',
            example: 'pending'
          },
          dueAt: {
            type: 'string',
            format: 'date-time',
            description: 'Due date for one-time tasks (ISO 8601 format)',
            example: '2024-12-31T23:59:59.000Z'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2024-01-01T00:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2024-01-01T00:00:00.000Z'
          },
          activatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the task was activated',
            example: '2024-01-01T00:00:00.000Z'
          },
          completedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the task was completed',
            example: '2024-01-02T00:00:00.000Z'
          },
          failedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the task was marked as failed',
            example: '2024-01-02T00:00:00.000Z'
          },
          originalId: {
            type: 'string',
            description: 'Original ID for re-activated tasks',
            example: '507f1f77bcf86cd799439011'
          },
          isReactivation: {
            type: 'boolean',
            description: 'Flag indicating if this is a re-activated task',
            example: false
          }
        }
      },
      CreateTodoRequest: {
        type: 'object',
        required: ['text', 'type'],
        properties: {
          text: {
            type: 'string',
            description: 'The todo text content',
            maxLength: 500,
            example: 'Complete project documentation'
          },
          type: {
            type: 'string',
            enum: ['one-time', 'daily'],
            description: 'Type of the todo task',
            example: 'one-time'
          },
          dueAt: {
            type: 'string',
            format: 'date-time',
            description: 'Due date for one-time tasks (required for one-time tasks)',
            example: '2024-12-31T23:59:59.000Z'
          }
        }
      },
      UpdateTodoRequest: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Updated todo text content',
            maxLength: 500,
            example: 'Updated project documentation'
          }
        }
      },
      ReactivateTodoRequest: {
        type: 'object',
        properties: {
          newDueAt: {
            type: 'string',
            format: 'date-time',
            description: 'New due date for re-activated one-time tasks',
            example: '2024-12-31T23:59:59.000Z'
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
            example: true
          },
          message: {
            type: 'string',
            description: 'Response message',
            example: 'Operation completed successfully'
          },
          data: {
            type: 'object',
            description: 'Response data'
          },
          count: {
            type: 'integer',
            description: 'Number of items returned',
            example: 5
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            description: 'Error type',
            example: 'Validation Error'
          },
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Todo text is required'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z'
          }
        }
      },
      GroupedTodos: {
        type: 'object',
        properties: {
          pending: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Todo'
            }
          },
          active: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Todo'
            }
          },
          completed: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Todo'
            }
          },
          failed: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Todo'
            }
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad Request - Invalid input data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      NotFound: {
        description: 'Not Found - Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Todos',
      description: 'Todo management endpoints'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/index.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
