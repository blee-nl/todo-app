import { Router, IRouter } from 'express';
import {
  getAllTodos,
  getTodosByState,
  getTodoById,
  createTodo,
  updateTodo,
  activateTodo,
  completeTodo,
  failTodo,
  reactivateTodo,
  deleteTodo,
  deleteCompletedTodos,
  deleteFailedTodos,
  processOverdueTasks,
  processDailyTasks
} from '../controllers/todoController';
import { validateTodo, validateId } from '../middleware/validation';

const router: IRouter = Router();

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos grouped by state
 *     description: Retrieve all todos organized by their current state (pending, active, completed, failed)
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: Successfully retrieved all todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   $ref: '#/components/schemas/GroupedTodos'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', getAllTodos);

/**
 * @swagger
 * /api/todos/state/{state}:
 *   get:
 *     summary: Get todos by state
 *     description: Retrieve all todos with a specific state
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, active, completed, failed]
 *         description: The state of todos to retrieve
 *         example: active
 *     responses:
 *       200:
 *         description: Successfully retrieved todos by state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Invalid state parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/state/:state', getTodosByState);

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a single todo by ID
 *     description: Retrieve a specific todo by its unique identifier
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the todo
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Successfully retrieved the todo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', validateId, getTodoById);

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     description: Create a new todo task with specified type and optional due date
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTodoRequest'
 *           examples:
 *             oneTimeTask:
 *               summary: One-time task
 *               value:
 *                 text: "Complete project documentation"
 *                 type: "one-time"
 *                 dueAt: "2024-12-31T23:59:59.000Z"
 *             dailyTask:
 *               summary: Daily recurring task
 *               value:
 *                 text: "Review daily tasks"
 *                 type: "daily"
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Todo created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', validateTodo, createTodo);

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     description: Update the text content of an active todo task
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the todo
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTodoRequest'
 *           example:
 *             text: "Updated project documentation with new features"
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Todo updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', validateId, updateTodo);

/**
 * @swagger
 * /api/todos/{id}/activate:
 *   patch:
 *     summary: Activate a pending task
 *     description: Move a pending task to active state
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the todo
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Todo activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Todo activated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/activate', validateId, activateTodo);

// PATCH /api/todos/:id/complete - Complete an active task
router.patch('/:id/complete', validateId, completeTodo);

// PATCH /api/todos/:id/fail - Mark an active task as failed
router.patch('/:id/fail', validateId, failTodo);

// PATCH /api/todos/:id/reactivate - Re-activate a completed or failed task
router.patch('/:id/reactivate', validateId, reactivateTodo);

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     description: Permanently delete a todo task
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the todo
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Todo deleted successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', validateId, deleteTodo);

// DELETE /api/todos/completed - Delete all completed todos
router.delete('/completed', deleteCompletedTodos);

// DELETE /api/todos/failed - Delete all failed todos
router.delete('/failed', deleteFailedTodos);

// POST /api/todos/process/overdue - Process overdue tasks (cron job)
router.post('/process/overdue', processOverdueTasks);

// POST /api/todos/process/daily - Process daily tasks (cron job)
router.post('/process/daily', processDailyTasks);

export default router;
