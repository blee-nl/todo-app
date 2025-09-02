import { Router, IRouter } from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  getTodosByStatus,
  deleteCompletedTodos
} from '../controllers/todoController';

const router: IRouter = Router();

// GET /api/todos - Get all todos
router.get('/', getAllTodos);

// GET /api/todos/status?completed=true - Get todos by completion status
router.get('/status', getTodosByStatus);

// GET /api/todos/:id - Get single todo by ID
router.get('/:id', getTodoById);

// POST /api/todos - Create new todo
router.post('/', createTodo);

// PUT /api/todos/:id - Update todo
router.put('/:id', updateTodo);

// PATCH /api/todos/:id/toggle - Toggle todo completion
router.patch('/:id/toggle', toggleTodo);

// DELETE /api/todos/:id - Delete single todo
router.delete('/:id', deleteTodo);

// DELETE /api/todos/completed - Delete all completed todos
router.delete('/completed', deleteCompletedTodos);

export default router;
