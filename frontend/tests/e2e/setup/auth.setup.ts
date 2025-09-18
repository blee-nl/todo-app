import { test as setup, expect } from '@playwright/test';
import { TestDataService } from '../utils/test-data-service';
import { DatabaseUtils } from '../utils/database-utils';

const authFile = 'tests/e2e/.auth/user.json';

setup('authenticate and setup test environment', async ({ page }) => {
  console.log('🔧 Setting up test environment...');

  // Initialize database utilities
  const dbUtils = new DatabaseUtils();
  await dbUtils.connect();

  // Clean database before tests
  await dbUtils.clearAllTodos();

  // Initialize test data service
  const testDataService = new TestDataService(dbUtils);

  // Navigate to the application
  await page.goto('/');

  // Wait for the application to load
  await expect(page.locator('[data-testid="todo-app"]')).toBeVisible({ timeout: 30000 });

  // Wait for React Query to initialize
  await page.waitForFunction(() => {
    return window.localStorage.getItem('react-query-cache') !== null ||
           document.querySelector('[data-testid="todo-list"]') !== null;
  }, { timeout: 10000 });

  console.log('✅ Test environment setup completed');

  // Store authentication state (if needed in the future)
  // For now, the todo app doesn't have authentication, but this is where we'd store auth tokens
  await page.context().storageState({ path: authFile });

  // Clean up
  await dbUtils.disconnect();
});

export { authFile };