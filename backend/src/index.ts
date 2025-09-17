import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes';
import docsRoutes from './routes/docsRoutes';
import { rateLimit } from './middleware/validation';

// Load environment variables
dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT || '5001', 10);

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5001', 'http://localhost:5173', 'http://localhost:5174'], // Frontend and direct browser access allowed
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

// Setup CORS
app.use(cors(corsOptions));

// Rate limiting middleware
app.use(rateLimit);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  console.log(`[${timestamp}] ${method} ${url} from ${ip}`);
  next();
});

// Body parsing middleware with error handling
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JSON parsing error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('JSON parsing error:', err.message);
    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON in request body',
      timestamp: new Date().toISOString()
    });
    return;
  }
  next(err);
});

// MongoDB connection
const uri: string = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app';

mongoose
  .connect(uri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err: Error) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// API routes
app.use('/api/todos', todoRoutes);
app.use('/api/docs', docsRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the API server and database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 3600
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected]
 *                   example: "connected"
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Default route
app.get('/', (req: Request, res: Response) => {
  console.log('Handling GET / request');
  res.status(200).json({
    message: 'Hello from Todo Backend!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      todos: '/api/todos',
      docs: '/api/docs',
      docsOverview: '/api/docs/overview'
    }
  });
});

// 404 handler for unhandled requests
app.use((req: Request, res: Response) => {
  console.log(`Unhandled ${req.method} request to ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
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

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
  console.log(`📋 API endpoints: http://localhost:${port}/api/todos`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close().then(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close().then(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

export default app;
