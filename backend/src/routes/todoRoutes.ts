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

// GET /api/todos - Get all todos grouped by state
router.get('/', getAllTodos);

// GET /api/todos/state/:state - Get todos by state (pending, active, completed, failed)
router.get('/state/:state', getTodosByState);

// GET /api/todos/:id - Get single todo by ID
router.get('/:id', validateId, getTodoById);

// POST /api/todos - Create new todo
router.post('/', validateTodo, createTodo);

// PUT /api/todos/:id - Update todo (only text for active tasks)
router.put('/:id', validateId, updateTodo);

// PATCH /api/todos/:id/activate - Activate a pending task
router.patch('/:id/activate', validateId, activateTodo);

// PATCH /api/todos/:id/complete - Complete an active task
router.patch('/:id/complete', validateId, completeTodo);

// PATCH /api/todos/:id/fail - Mark an active task as failed
router.patch('/:id/fail', validateId, failTodo);

// PATCH /api/todos/:id/reactivate - Re-activate a completed or failed task
router.patch('/:id/reactivate', validateId, reactivateTodo);

// DELETE /api/todos/:id - Delete single todo
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
