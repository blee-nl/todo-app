import { ITodo } from '../models/Todo';

// Mock data for testing
export const mockTodos: ITodo[] = [
  {
    _id: '507f1f77bcf86cd799439011',
    text: 'Test todo 1',
    type: 'one-time',
    state: 'pending',
    dueAt: new Date('2024-12-31T23:59:59.000Z'),
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  } as ITodo,
  {
    _id: '507f1f77bcf86cd799439012',
    text: 'Test todo 2',
    type: 'daily',
    state: 'completed',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T01:00:00.000Z'),
    activatedAt: new Date('2024-01-01T00:00:00.000Z'),
    completedAt: new Date('2024-01-01T01:00:00.000Z'),
  } as ITodo,
  {
    _id: '507f1f77bcf86cd799439013',
    text: 'Test todo 3',
    type: 'one-time',
    state: 'active',
    dueAt: new Date('2024-12-31T23:59:59.000Z'),
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    activatedAt: new Date('2024-01-01T00:00:00.000Z'),
  } as ITodo,
  {
    _id: '507f1f77bcf86cd799439014',
    text: 'Test todo 4',
    type: 'daily',
    state: 'failed',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T01:00:00.000Z'),
    activatedAt: new Date('2024-01-01T00:00:00.000Z'),
    failedAt: new Date('2024-01-01T01:00:00.000Z'),
  } as ITodo,
];

export const mockGroupedTodos = {
  pending: [mockTodos[0]],
  active: [mockTodos[2]],
  completed: [mockTodos[1]],
  failed: [mockTodos[3]],
};

export const mockCreateTodoRequest = {
  text: 'New test todo',
  type: 'one-time',
  dueAt: '2024-12-31T23:59:59.000Z',
};

export const mockCreateDailyTodoRequest = {
  text: 'New daily todo',
  type: 'daily',
};

export const mockUpdateTodoRequest = {
  text: 'Updated test todo',
};

export const mockReactivateTodoRequest = {
  newDueAt: '2024-12-31T23:59:59.000Z',
};

// Helper function to create a mock request
export const createMockRequest = (body: any = {}, params: any = {}, query: any = {}) => ({
  body,
  params,
  query,
  user: null,
});

// Helper function to create a mock response
export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Helper function to create a mock next function
export const createMockNext = () => jest.fn();

// Helper function to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
