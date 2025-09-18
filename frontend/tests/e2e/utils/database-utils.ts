import { MongoClient, Db, Collection } from 'mongodb';

export interface TodoDocument {
  _id?: string;
  text: string;
  type: 'one-time' | 'daily';
  state: 'pending' | 'active' | 'completed' | 'failed';
  dueAt?: Date;
  notification?: {
    enabled: boolean;
    reminderMinutes: number;
    notifiedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  originalId?: string;
  isReactivation?: boolean;
}

export class DatabaseUtils {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private todosCollection: Collection<TodoDocument> | null = null;

  constructor(
    private mongoUri: string = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app-test'
  ) {}

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.mongoUri);
      await this.client.connect();
      this.db = this.client.db();
      this.todosCollection = this.db.collection<TodoDocument>('todos');
      console.log('📦 Connected to test database');
    } catch (error) {
      console.error('❌ Failed to connect to test database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.todosCollection = null;
      console.log('📦 Disconnected from test database');
    }
  }

  async clearAllTodos(): Promise<void> {
    if (!this.todosCollection) {
      throw new Error('Database not connected');
    }

    await this.todosCollection.deleteMany({});
    console.log('🧹 Cleared all todos from test database');
  }

  async createTodo(todo: Partial<TodoDocument>): Promise<TodoDocument> {
    if (!this.todosCollection) {
      throw new Error('Database not connected');
    }

    const now = new Date();
    const todoDocument: TodoDocument = {
      text: todo.text || 'Test Todo',
      type: todo.type || 'one-time',
      state: todo.state || 'pending',
      dueAt: todo.dueAt,
      notification: todo.notification,
      createdAt: todo.createdAt || now,
      updatedAt: todo.updatedAt || now,
      activatedAt: todo.activatedAt,
      completedAt: todo.completedAt,
      failedAt: todo.failedAt,
      originalId: todo.originalId,
      isReactivation: todo.isReactivation || false,
    };

    const result = await this.todosCollection.insertOne(todoDocument);
    const insertedTodo = await this.todosCollection.findOne({ _id: result.insertedId });

    if (!insertedTodo) {
      throw new Error('Failed to create todo');
    }

    return insertedTodo;
  }

  async createMultipleTodos(todos: Partial<TodoDocument>[]): Promise<TodoDocument[]> {
    const createdTodos: TodoDocument[] = [];

    for (const todo of todos) {
      const createdTodo = await this.createTodo(todo);
      createdTodos.push(createdTodo);
    }

    return createdTodos;
  }

  async updateTodoState(todoId: string, state: 'pending' | 'active' | 'completed' | 'failed'): Promise<TodoDocument | null> {
    if (!this.todosCollection) {
      throw new Error('Database not connected');
    }

    const now = new Date();
    const updateData: any = {
      state,
      updatedAt: now,
    };

    // Set appropriate timestamp based on state
    switch (state) {
      case 'active':
        updateData.activatedAt = now;
        break;
      case 'completed':
        updateData.completedAt = now;
        break;
      case 'failed':
        updateData.failedAt = now;
        break;
    }

    await this.todosCollection.updateOne(
      { _id: todoId },
      { $set: updateData }
    );

    return await this.todosCollection.findOne({ _id: todoId });
  }

  async getTodosByState(state: 'pending' | 'active' | 'completed' | 'failed'): Promise<TodoDocument[]> {
    if (!this.todosCollection) {
      throw new Error('Database not connected');
    }

    return await this.todosCollection.find({ state }).sort({ createdAt: -1 }).toArray();
  }

  async getTodosByType(type: 'one-time' | 'daily'): Promise<TodoDocument[]> {
    if (!this.todosCollection) {
      throw new Error('Database not connected');
    }

    return await this.todosCollection.find({ type }).sort({ createdAt: -1 }).toArray();
  }

  async getAllTodos(): Promise<TodoDocument[]> {
    if (!this.todosCollection) {
      throw new Error('Database not connected');
    }

    return await this.todosCollection.find({}).sort({ createdAt: -1 }).toArray();
  }

  async deleteTodo(todoId: string): Promise<void> {
    if (!this.todosCollection) {
      throw new Error('Database not connected');
    }

    await this.todosCollection.deleteOne({ _id: todoId });
  }

  async waitForTodoInState(todoId: string, state: 'pending' | 'active' | 'completed' | 'failed', timeoutMs: number = 10000): Promise<TodoDocument> {
    if (!this.todosCollection) {
      throw new Error('Database not connected');
    }

    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const todo = await this.todosCollection.findOne({ _id: todoId });

      if (todo && todo.state === state) {
        return todo;
      }

      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Timeout waiting for todo ${todoId} to reach state ${state}`);
  }

  async waitForTodoCount(count: number, timeoutMs: number = 10000): Promise<TodoDocument[]> {
    if (!this.todosCollection) {
      throw new Error('Database not connected');
    }

    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const todos = await this.getAllTodos();

      if (todos.length === count) {
        return todos;
      }

      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Timeout waiting for todo count to reach ${count}`);
  }
}