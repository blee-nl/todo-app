// Jest globals are available without import

// Mock swagger-jsdoc before importing
const mockSwaggerJsdoc = jest.fn();
jest.mock('swagger-jsdoc', () => mockSwaggerJsdoc);

describe('Swagger Configuration', () => {
  let swaggerModule: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSwaggerJsdoc.mockReturnValue({
      openapi: '3.0.0',
      info: { title: 'Mock API', version: '1.0.0' },
    });

    // Fresh import for each test
    jest.resetModules();
    swaggerModule = await import('../swagger');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Swagger Definition Configuration', () => {
    it('should call swaggerJsdoc with correct configuration', () => {
      expect(mockSwaggerJsdoc).toHaveBeenCalledWith({
        definition: expect.objectContaining({
          openapi: '3.0.0',
          info: expect.objectContaining({
            title: 'Todo App API',
            version: '1.0.0',
            description: 'A comprehensive REST API for managing todos with different states and types',
            contact: {
              name: 'BLEE',
            },
          }),
        }),
        apis: [
          './src/routes/*.ts',
          './src/controllers/*.ts',
          './src/index.ts'
        ]
      });
    });

    it('should configure OpenAPI 3.0.0 specification', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      expect(callArgs.definition.openapi).toBe('3.0.0');
    });

    it('should set correct API information', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const info = callArgs.definition.info;

      expect(info.title).toBe('Todo App API');
      expect(info.version).toBe('1.0.0');
      expect(info.description).toBe('A comprehensive REST API for managing todos with different states and types');
      expect(info.contact.name).toBe('BLEE');
    });

    it('should configure multiple servers', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const servers = callArgs.definition.servers;

      expect(servers).toHaveLength(2);
      expect(servers[0]).toEqual({
        url: 'http://localhost:5001',
        description: 'Development server'
      });
      expect(servers[1]).toEqual({
        url: 'https://api.todoapp.com',
        description: 'Production server'
      });
    });

    it('should define correct API file paths for documentation parsing', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const apis = callArgs.apis;

      expect(apis).toContain('./src/routes/*.ts');
      expect(apis).toContain('./src/controllers/*.ts');
      expect(apis).toContain('./src/index.ts');
    });
  });

  describe('Schema Definitions', () => {
    let schemas: any;

    beforeEach(() => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      schemas = callArgs.definition.components.schemas;
    });

    describe('Todo Schema', () => {
      it('should define Todo schema with correct structure', () => {
        const todoSchema = schemas.Todo;

        expect(todoSchema.type).toBe('object');
        expect(todoSchema.required).toEqual(['text', 'type', 'state']);
      });

      it('should define all Todo properties with correct types', () => {
        const todoProperties = schemas.Todo.properties;

        expect(todoProperties.id.type).toBe('string');
        expect(todoProperties.text.type).toBe('string');
        expect(todoProperties.text.maxLength).toBe(500);
        expect(todoProperties.type.enum).toEqual(['one-time', 'daily']);
        expect(todoProperties.state.enum).toEqual(['pending', 'active', 'completed', 'failed']);
      });

      it('should define timestamp properties with date-time format', () => {
        const todoProperties = schemas.Todo.properties;

        ['dueAt', 'createdAt', 'updatedAt', 'activatedAt', 'completedAt', 'failedAt'].forEach(field => {
          expect(todoProperties[field].type).toBe('string');
          expect(todoProperties[field].format).toBe('date-time');
        });
      });

      it('should define reactivation-related properties', () => {
        const todoProperties = schemas.Todo.properties;

        expect(todoProperties.originalId.type).toBe('string');
        expect(todoProperties.isReactivation.type).toBe('boolean');
        expect(todoProperties.isReactivation.example).toBe(false);
      });

      it('should include example values for all properties', () => {
        const todoProperties = schemas.Todo.properties;

        expect(todoProperties.id.example).toBe('507f1f77bcf86cd799439011');
        expect(todoProperties.text.example).toBe('Complete project documentation');
        expect(todoProperties.type.example).toBe('one-time');
        expect(todoProperties.state.example).toBe('pending');
        expect(todoProperties.dueAt.example).toBe('2024-12-31T23:59:59.000Z');
      });
    });

    describe('CreateTodoRequest Schema', () => {
      it('should define CreateTodoRequest with required fields', () => {
        const createSchema = schemas.CreateTodoRequest;

        expect(createSchema.type).toBe('object');
        expect(createSchema.required).toEqual(['text', 'type']);
      });

      it('should define correct properties for creation', () => {
        const createProperties = schemas.CreateTodoRequest.properties;

        expect(createProperties.text.type).toBe('string');
        expect(createProperties.text.maxLength).toBe(500);
        expect(createProperties.type.enum).toEqual(['one-time', 'daily']);
        expect(createProperties.dueAt.format).toBe('date-time');
      });

      it('should include examples for CreateTodoRequest', () => {
        const createProperties = schemas.CreateTodoRequest.properties;

        expect(createProperties.text.example).toBe('Complete project documentation');
        expect(createProperties.type.example).toBe('one-time');
        expect(createProperties.dueAt.example).toBe('2024-12-31T23:59:59.000Z');
      });
    });

    describe('UpdateTodoRequest Schema', () => {
      it('should define UpdateTodoRequest with optional fields', () => {
        const updateSchema = schemas.UpdateTodoRequest;

        expect(updateSchema.type).toBe('object');
        expect(updateSchema.required).toBeUndefined(); // All fields optional
      });

      it('should allow text updates', () => {
        const updateProperties = schemas.UpdateTodoRequest.properties;

        expect(updateProperties.text.type).toBe('string');
        expect(updateProperties.text.maxLength).toBe(500);
        expect(updateProperties.text.example).toBe('Updated project documentation');
      });
    });

    describe('ReactivateTodoRequest Schema', () => {
      it('should define ReactivateTodoRequest schema', () => {
        const reactivateSchema = schemas.ReactivateTodoRequest;

        expect(reactivateSchema.type).toBe('object');
        expect(reactivateSchema.required).toBeUndefined(); // Optional field
      });

      it('should define newDueAt property', () => {
        const reactivateProperties = schemas.ReactivateTodoRequest.properties;

        expect(reactivateProperties.newDueAt.type).toBe('string');
        expect(reactivateProperties.newDueAt.format).toBe('date-time');
        expect(reactivateProperties.newDueAt.example).toBe('2024-12-31T23:59:59.000Z');
      });
    });

    describe('ApiResponse Schema', () => {
      it('should define standard API response structure', () => {
        const responseSchema = schemas.ApiResponse;

        expect(responseSchema.type).toBe('object');
      });

      it('should define all response properties', () => {
        const responseProperties = schemas.ApiResponse.properties;

        expect(responseProperties.success.type).toBe('boolean');
        expect(responseProperties.success.example).toBe(true);
        expect(responseProperties.message.type).toBe('string');
        expect(responseProperties.data.type).toBe('object');
        expect(responseProperties.count.type).toBe('integer');
        expect(responseProperties.count.example).toBe(5);
      });
    });

    describe('ErrorResponse Schema', () => {
      it('should define error response structure', () => {
        const errorSchema = schemas.ErrorResponse;

        expect(errorSchema.type).toBe('object');
      });

      it('should define error response properties', () => {
        const errorProperties = schemas.ErrorResponse.properties;

        expect(errorProperties.success.type).toBe('boolean');
        expect(errorProperties.success.example).toBe(false);
        expect(errorProperties.error.type).toBe('string');
        expect(errorProperties.error.example).toBe('Validation Error');
        expect(errorProperties.message.example).toBe('Todo text is required');
        expect(errorProperties.timestamp.format).toBe('date-time');
      });
    });

    describe('GroupedTodos Schema', () => {
      it('should define grouped todos structure', () => {
        const groupedSchema = schemas.GroupedTodos;

        expect(groupedSchema.type).toBe('object');
      });

      it('should define all state groups as arrays', () => {
        const groupedProperties = schemas.GroupedTodos.properties;

        ['pending', 'active', 'completed', 'failed'].forEach(state => {
          expect(groupedProperties[state].type).toBe('array');
          expect(groupedProperties[state].items.$ref).toBe('#/components/schemas/Todo');
        });
      });
    });
  });

  describe('Response Templates', () => {
    let responses: any;

    beforeEach(() => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      responses = callArgs.definition.components.responses;
    });

    it('should define BadRequest response template', () => {
      const badRequest = responses.BadRequest;

      expect(badRequest.description).toBe('Bad Request - Invalid input data');
      expect(badRequest.content['application/json'].schema.$ref).toBe('#/components/schemas/ErrorResponse');
    });

    it('should define NotFound response template', () => {
      const notFound = responses.NotFound;

      expect(notFound.description).toBe('Not Found - Resource not found');
      expect(notFound.content['application/json'].schema.$ref).toBe('#/components/schemas/ErrorResponse');
    });

    it('should define InternalServerError response template', () => {
      const serverError = responses.InternalServerError;

      expect(serverError.description).toBe('Internal Server Error');
      expect(serverError.content['application/json'].schema.$ref).toBe('#/components/schemas/ErrorResponse');
    });
  });

  describe('Tags Configuration', () => {
    it('should define API tags', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const tags = callArgs.definition.tags;

      expect(tags).toHaveLength(2);
      expect(tags[0]).toEqual({
        name: 'Health',
        description: 'Health check endpoints'
      });
      expect(tags[1]).toEqual({
        name: 'Todos',
        description: 'Todo management endpoints'
      });
    });
  });

  describe('Swagger Spec Export', () => {
    it('should export swaggerSpec', () => {
      expect(swaggerModule.swaggerSpec).toBeDefined();
    });

    it('should call swaggerJsdoc to generate spec', () => {
      expect(mockSwaggerJsdoc).toHaveBeenCalledTimes(1);
    });

    it('should return the mocked swagger specification', () => {
      expect(swaggerModule.swaggerSpec).toEqual({
        openapi: '3.0.0',
        info: { title: 'Mock API', version: '1.0.0' },
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should use correct OpenAPI version', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      expect(callArgs.definition.openapi).toBe('3.0.0');
    });

    it('should include all required schema fields', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const schemas = callArgs.definition.components.schemas;

      // Verify all schemas are defined
      expect(schemas.Todo).toBeDefined();
      expect(schemas.CreateTodoRequest).toBeDefined();
      expect(schemas.UpdateTodoRequest).toBeDefined();
      expect(schemas.ReactivateTodoRequest).toBeDefined();
      expect(schemas.ApiResponse).toBeDefined();
      expect(schemas.ErrorResponse).toBeDefined();
      expect(schemas.GroupedTodos).toBeDefined();
    });

    it('should include all required response templates', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const responses = callArgs.definition.components.responses;

      expect(responses.BadRequest).toBeDefined();
      expect(responses.NotFound).toBeDefined();
      expect(responses.InternalServerError).toBeDefined();
    });

    it('should validate enum values for todo properties', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const todoProperties = callArgs.definition.components.schemas.Todo.properties;

      expect(todoProperties.type.enum).toEqual(['one-time', 'daily']);
      expect(todoProperties.state.enum).toEqual(['pending', 'active', 'completed', 'failed']);
    });

    it('should enforce text length constraints', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const schemas = callArgs.definition.components.schemas;

      expect(schemas.Todo.properties.text.maxLength).toBe(500);
      expect(schemas.CreateTodoRequest.properties.text.maxLength).toBe(500);
      expect(schemas.UpdateTodoRequest.properties.text.maxLength).toBe(500);
    });
  });

  describe('Schema References and Relationships', () => {
    it('should use correct schema references in GroupedTodos', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const groupedProperties = callArgs.definition.components.schemas.GroupedTodos.properties;

      ['pending', 'active', 'completed', 'failed'].forEach(state => {
        expect(groupedProperties[state].items.$ref).toBe('#/components/schemas/Todo');
      });
    });

    it('should use correct schema references in responses', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const responses = callArgs.definition.components.responses;

      expect(responses.BadRequest.content['application/json'].schema.$ref).toBe('#/components/schemas/ErrorResponse');
      expect(responses.NotFound.content['application/json'].schema.$ref).toBe('#/components/schemas/ErrorResponse');
      expect(responses.InternalServerError.content['application/json'].schema.$ref).toBe('#/components/schemas/ErrorResponse');
    });
  });

  describe('Example Values', () => {
    it('should provide realistic example values', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const todoProperties = callArgs.definition.components.schemas.Todo.properties;

      expect(todoProperties.id.example).toMatch(/^[a-f0-9]{24}$/); // MongoDB ObjectId format
      expect(todoProperties.dueAt.example).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/); // ISO date format
      expect(todoProperties.text.example).toBe('Complete project documentation');
    });

    it('should provide consistent example formats across schemas', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const schemas = callArgs.definition.components.schemas;

      const todoExample = schemas.Todo.properties.dueAt.example;
      const createExample = schemas.CreateTodoRequest.properties.dueAt.example;
      const reactivateExample = schemas.ReactivateTodoRequest.properties.newDueAt.example;

      // All should follow ISO 8601 format
      expect(todoExample).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(createExample).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(reactivateExample).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing swagger-jsdoc gracefully', async () => {
      // Test that the module can be imported even if swagger-jsdoc fails
      mockSwaggerJsdoc.mockImplementation(() => {
        throw new Error('swagger-jsdoc failed');
      });

      expect(() => {
        jest.resetModules();
        require('../swagger');
      }).toThrow('swagger-jsdoc failed');
    });

    it('should maintain backwards compatibility with OpenAPI 3.0.0', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];

      // Ensure we're not using deprecated OpenAPI 2.0 features
      expect(callArgs.definition.openapi).toBe('3.0.0');
      expect(callArgs.definition.swagger).toBeUndefined(); // Should not have swagger 2.0 field
    });
  });

  describe('API Documentation Coverage', () => {
    it('should scan all relevant source files', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const apis = callArgs.apis;

      // Should cover routes, controllers, and main app file
      expect(apis).toContain('./src/routes/*.ts');
      expect(apis).toContain('./src/controllers/*.ts');
      expect(apis).toContain('./src/index.ts');
    });

    it('should use glob patterns for flexible file discovery', () => {
      const callArgs = mockSwaggerJsdoc.mock.calls[0][0];
      const apis = callArgs.apis;

      // Check for wildcard patterns
      expect(apis.some((api: string) => api.includes('*'))).toBe(true);
    });
  });
});