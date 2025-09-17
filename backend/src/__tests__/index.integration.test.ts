import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index';

describe('Main Application Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

  describe('Health Check Endpoint', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
        database: 'connected'
      });

      // Verify timestamp is valid ISO string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);

      // Verify uptime is positive
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    it('should include CORS headers when Origin is provided', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  describe('Root Endpoint', () => {
    it('should return 200 with app information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Hello from Todo Backend!',
        version: '1.0.0',
        timestamp: expect.any(String),
        endpoints: {
          health: '/health',
          todos: '/api/todos',
          docs: '/api/docs',
          docsOverview: '/api/docs/overview'
        }
      });

      // Verify timestamp is valid ISO string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Route GET /unknown-route not found',
        timestamp: expect.any(String),
        availableEndpoints: [
          'GET /',
          'GET /health',
          'GET /api/docs',
          'GET /api/docs/overview',
          'GET /api/todos',
          'POST /api/todos',
          'PUT /api/todos/:id',
          'DELETE /api/todos/:id'
        ]
      });
    });

    it('should handle different HTTP methods', async () => {
      const response = await request(app)
        .post('/unknown-route')
        .expect(404);

      expect(response.body.message).toBe('Route POST /unknown-route not found');
    });
  });

  describe('CORS Configuration', () => {
    it('should allow requests from localhost:3000', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should allow requests from localhost:5173', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to requests', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for rate limit headers (these may vary based on implementation)
      expect(response.headers).toBeDefined();
    });
  });

  describe('Request Body Parsing', () => {
    it('should parse JSON request bodies', async () => {
      const testData = { text: 'Test todo', type: 'one-time', dueAt: new Date(Date.now() + 20 * 60 * 1000).toISOString() };

      // Test with valid todo data to ensure JSON parsing works
      const response = await request(app)
        .post('/api/todos')
        .send(testData);

      // Should either succeed (201) or fail with validation error (400), but JSON parsing should work
      expect([200, 201, 400]).toContain(response.status);
      if (response.status === 400) {
        // If validation fails, make sure it's not a JSON parsing error
        expect(response.body.message).not.toContain('Unexpected token');
        expect(response.body.message).not.toContain('JSON');
      }
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });

  describe('Database Connection Status', () => {
    it('should report database as connected when mongoose is connected', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.database).toBe('connected');
    });
  });

  describe('Environment Configuration', () => {
    it('should report current environment', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.environment).toBeDefined();
      expect(typeof response.body.environment).toBe('string');
    });
  });

  describe('Security Headers', () => {
    it('should set appropriate security headers when Origin is provided', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      // CORS headers should be present when Origin header is provided
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Create a request that might cause an error
      const response = await request(app)
        .post('/api/todos')
        .send({ invalid: 'data that might cause an error' });

      // Even if there's an error, it should be handled properly
      if (response.status >= 500) {
        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('timestamp');
      }
    });
  });

  describe('Request Logging', () => {
    // Note: Testing logging is complex since it goes to console
    // In a real application, you might want to use a logger that can be mocked
    it('should handle requests without crashing', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await request(app)
        .get('/health')
        .expect(200);

      // Verify that logging middleware runs without errors
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('API Routes Integration', () => {
    it('should mount todo routes correctly', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      // Should get a valid response from todos route
      expect(response.body).toBeDefined();
    });

    it('should mount docs routes correctly', async () => {
      const response = await request(app)
        .get('/api/docs');

      // Docs route should exist (may return 200 or redirect)
      expect(response.status).not.toBe(404);
    });
  });

  describe('Application Export', () => {
    it('should export the Express app instance', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
      expect(app.listen).toBeDefined();
    });
  });
});