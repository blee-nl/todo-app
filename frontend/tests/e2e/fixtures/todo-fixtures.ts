import { test as base, Page } from '@playwright/test';
import { TodoPage } from '../page-objects/todo-page';
import { DatabaseUtils } from '../utils/database-utils';
import { TestDataService } from '../utils/test-data-service';
import { ReactQueryUtils } from '../utils/react-query-utils';

export interface TodoFixtures {
  todoPage: TodoPage;
  dbUtils: DatabaseUtils;
  testDataService: TestDataService;
  reactQueryUtils: ReactQueryUtils;
}

export const test = base.extend<TodoFixtures>({
  /**
   * Todo Page Object - Provides high-level todo operations
   */
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await use(todoPage);
  },

  /**
   * Database Utils - Direct database operations for setup/verification
   */
  dbUtils: async ({}, use) => {
    const dbUtils = new DatabaseUtils();
    await dbUtils.connect();

    // Clean database before each test
    await dbUtils.clearAllTodos();

    await use(dbUtils);

    // Clean up after test
    await dbUtils.clearAllTodos();
    await dbUtils.disconnect();
  },

  /**
   * Test Data Service - Provides pre-configured test data
   */
  testDataService: async ({ dbUtils }, use) => {
    const testDataService = new TestDataService(dbUtils);
    await use(testDataService);
  },

  /**
   * React Query Utils - Handles React Query cache operations
   */
  reactQueryUtils: async ({ page }, use) => {
    const reactQueryUtils = new ReactQueryUtils(page);
    await use(reactQueryUtils);
  },
});

export { expect } from '@playwright/test';