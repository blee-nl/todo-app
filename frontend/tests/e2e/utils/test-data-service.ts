import { DatabaseUtils, TodoDocument } from './database-utils';

export interface TestTodoData {
  text: string;
  type: 'one-time' | 'daily';
  state: 'pending' | 'active' | 'completed' | 'failed';
  dueAt?: Date;
  notification?: {
    enabled: boolean;
    reminderMinutes: number;
  };
}

export class TestDataService {
  constructor(private dbUtils: DatabaseUtils) {}

  /**
   * Create a simple pending todo
   */
  createSimpleTodo(text: string = 'Test Todo'): TestTodoData {
    return {
      text,
      type: 'one-time',
      state: 'pending',
      dueAt: this.createFutureDate(1), // 1 hour from now
    };
  }

  /**
   * Create a todo with notification
   */
  createTodoWithNotification(text: string = 'Test Todo with Notification'): TestTodoData {
    return {
      text,
      type: 'one-time',
      state: 'pending',
      dueAt: this.createFutureDate(2), // 2 hours from now
      notification: {
        enabled: true,
        reminderMinutes: 30,
      },
    };
  }

  /**
   * Create a daily task
   */
  createDailyTask(text: string = 'Daily Task'): TestTodoData {
    return {
      text,
      type: 'daily',
      state: 'pending',
    };
  }

  /**
   * Create an active todo
   */
  createActiveTodo(text: string = 'Active Todo'): TestTodoData {
    return {
      text,
      type: 'one-time',
      state: 'active',
      dueAt: this.createFutureDate(3), // 3 hours from now
    };
  }

  /**
   * Create a completed todo
   */
  createCompletedTodo(text: string = 'Completed Todo'): TestTodoData {
    return {
      text,
      type: 'one-time',
      state: 'completed',
      dueAt: this.createPastDate(1), // 1 hour ago
    };
  }

  /**
   * Create a failed todo
   */
  createFailedTodo(text: string = 'Failed Todo'): TestTodoData {
    return {
      text,
      type: 'one-time',
      state: 'failed',
      dueAt: this.createPastDate(2), // 2 hours ago
    };
  }

  /**
   * Create an overdue todo (should be automatically failed)
   */
  createOverdueTodo(text: string = 'Overdue Todo'): TestTodoData {
    return {
      text,
      type: 'one-time',
      state: 'active',
      dueAt: this.createPastDate(1), // 1 hour ago
    };
  }

  /**
   * Create a set of todos for comprehensive testing
   */
  createTestSuite(): TestTodoData[] {
    return [
      this.createSimpleTodo('Simple Pending Task'),
      this.createTodoWithNotification('Task with Notification'),
      this.createDailyTask('Daily Exercise'),
      this.createActiveTodo('Active Project Work'),
      this.createCompletedTodo('Finished Reading'),
      this.createFailedTodo('Missed Meeting'),
      this.createOverdueTodo('Overdue Assignment'),
    ];
  }

  /**
   * Create todos for state transition testing
   */
  createStateTransitionTestData(): TestTodoData[] {
    return [
      {
        text: 'Todo for Pending → Active',
        type: 'one-time',
        state: 'pending',
        dueAt: this.createFutureDate(1),
      },
      {
        text: 'Todo for Active → Completed',
        type: 'one-time',
        state: 'active',
        dueAt: this.createFutureDate(2),
      },
      {
        text: 'Todo for Active → Failed',
        type: 'one-time',
        state: 'active',
        dueAt: this.createFutureDate(3),
      },
      {
        text: 'Todo for Failed → Reactivated',
        type: 'one-time',
        state: 'failed',
        dueAt: this.createPastDate(1),
      },
    ];
  }

  /**
   * Create todos for search and filter testing
   */
  createSearchTestData(): TestTodoData[] {
    return [
      this.createSimpleTodo('Buy groceries for dinner'),
      this.createSimpleTodo('Call mom about weekend'),
      this.createSimpleTodo('Finish React project'),
      this.createDailyTask('Morning exercise routine'),
      this.createDailyTask('Check emails'),
      this.createActiveTodo('Write documentation'),
      this.createCompletedTodo('Complete unit tests'),
      this.createFailedTodo('Attend team meeting'),
    ];
  }

  /**
   * Create performance test data (many todos)
   */
  createPerformanceTestData(count: number = 50): TestTodoData[] {
    const todos: TestTodoData[] = [];

    for (let i = 1; i <= count; i++) {
      const type = i % 3 === 0 ? 'daily' : 'one-time';
      const states: Array<'pending' | 'active' | 'completed' | 'failed'> = ['pending', 'active', 'completed', 'failed'];
      const state = states[i % 4];

      todos.push({
        text: `Performance Test Todo ${i}`,
        type,
        state,
        dueAt: this.createFutureDate(Math.floor(Math.random() * 24)), // Random future hour
        notification: i % 5 === 0 ? {
          enabled: true,
          reminderMinutes: 15,
        } : undefined,
      });
    }

    return todos;
  }

  /**
   * Seed the database with test data
   */
  async seedDatabase(todos: TestTodoData[]): Promise<TodoDocument[]> {
    const todoDocuments: Partial<TodoDocument>[] = todos.map(todo => ({
      text: todo.text,
      type: todo.type,
      state: todo.state,
      dueAt: todo.dueAt,
      notification: todo.notification,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Set appropriate timestamps based on state
      ...(todo.state === 'active' && { activatedAt: new Date() }),
      ...(todo.state === 'completed' && { completedAt: new Date() }),
      ...(todo.state === 'failed' && { failedAt: new Date() }),
    }));

    return await this.dbUtils.createMultipleTodos(todoDocuments);
  }

  /**
   * Seed simple test scenario
   */
  async seedSimpleScenario(): Promise<TodoDocument[]> {
    const todos = [
      this.createSimpleTodo('Buy coffee beans'),
      this.createActiveTodo('Work on presentation'),
      this.createCompletedTodo('Morning workout'),
    ];

    return await this.seedDatabase(todos);
  }

  /**
   * Seed comprehensive test scenario
   */
  async seedComprehensiveScenario(): Promise<TodoDocument[]> {
    const todos = this.createTestSuite();
    return await this.seedDatabase(todos);
  }

  /**
   * Seed state transition test scenario
   */
  async seedStateTransitionScenario(): Promise<TodoDocument[]> {
    const todos = this.createStateTransitionTestData();
    return await this.seedDatabase(todos);
  }

  /**
   * Clear and seed fresh data
   */
  async clearAndSeed(todos: TestTodoData[]): Promise<TodoDocument[]> {
    await this.dbUtils.clearAllTodos();
    return await this.seedDatabase(todos);
  }

  /**
   * Helper: Create a future date (hours from now)
   */
  private createFutureDate(hoursFromNow: number): Date {
    const date = new Date();
    date.setHours(date.getHours() + hoursFromNow);
    return date;
  }

  /**
   * Helper: Create a past date (hours ago)
   */
  private createPastDate(hoursAgo: number): Date {
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    return date;
  }

  /**
   * Helper: Create a specific date/time
   */
  createSpecificDate(year: number, month: number, day: number, hour: number = 12, minute: number = 0): Date {
    return new Date(year, month - 1, day, hour, minute);
  }

  /**
   * Helper: Create date relative to today
   */
  createRelativeDate(daysOffset: number, hour: number = 12, minute: number = 0): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  /**
   * Helper: Create tomorrow at specific time
   */
  createTomorrow(hour: number = 12, minute: number = 0): Date {
    return this.createRelativeDate(1, hour, minute);
  }

  /**
   * Helper: Create yesterday at specific time
   */
  createYesterday(hour: number = 12, minute: number = 0): Date {
    return this.createRelativeDate(-1, hour, minute);
  }
}