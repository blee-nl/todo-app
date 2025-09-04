import { Router, Request, Response, IRouter } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

const router: IRouter = Router();

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Todo App API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Serve raw OpenAPI JSON
router.get('/json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API overview endpoint
router.get('/overview', (req: Request, res: Response) => {
  res.json({
    title: 'Todo App API Documentation',
    version: '1.0.0',
    description: 'A comprehensive REST API for managing todos with different states and types',
    endpoints: {
      documentation: '/api/docs',
      openapiJson: '/api/docs/json',
      health: '/health',
      todos: '/api/todos'
    },
    features: [
      'Create, read, update, and delete todos',
      'Support for one-time and daily recurring tasks',
      'State management (pending, active, completed, failed)',
      'Task activation and completion workflows',
      'Bulk operations for completed and failed tasks',
      'Automatic processing of overdue and daily tasks',
      'Comprehensive error handling and validation'
    ],
    taskTypes: {
      'one-time': 'Tasks with a specific due date',
      'daily': 'Recurring tasks that reset daily'
    },
    taskStates: {
      'pending': 'Newly created tasks waiting to be activated',
      'active': 'Tasks that are currently in progress',
      'completed': 'Successfully finished tasks',
      'failed': 'Tasks that were not completed on time'
    }
  });
});

export default router;
