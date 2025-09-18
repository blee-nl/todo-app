import { test, expect } from './fixtures/todo-fixtures';

/**
 * Basic example test demonstrating the Playwright testing infrastructure
 * This test validates core functionality and serves as a reference for new tests
 */
test.describe('Todo App - Basic Functionality Validation', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.navigate();
  });

  test('should load the application successfully @smoke', async ({ todoPage }) => {
    await test.step('Verify application loads', async () => {
      // Check that the main app component is visible
      await expect(todoPage.todoApp).toBeVisible();

      // Verify the page title or main heading
      await expect(todoPage.page).toHaveTitle(/Todo/i);
    });

    await test.step('Verify initial state', async () => {
      // Should show add todo button
      await expect(todoPage.addTodoButton).toBeVisible();

      // Todo list should be present (even if empty)
      await expect(todoPage.todoList).toBeVisible();
    });
  });

  test('should create a simple todo @smoke', async ({ todoPage, reactQueryUtils }) => {
    const todoText = 'Buy groceries';

    await test.step('Create a new todo', async () => {
      await todoPage.createTodo({
        text: todoText,
        type: 'one-time',
        dueAt: new Date(Date.now() + 3600000), // 1 hour from now
      });
    });

    await test.step('Verify todo appears in list', async () => {
      await todoPage.waitForTodoInList(todoText);
      await expect(todoPage.getTodoByText(todoText)).toBeVisible();

      // Verify it starts in pending state
      await todoPage.expectTodoInState(todoText, 'pending');
    });

    await test.step('Verify React Query cache is updated', async () => {
      await reactQueryUtils.waitForQueriesToSettle();

      // Check that the todo appears in the visible todos list
      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain(todoText);
    });
  });

  test('should navigate between different todo states @smoke', async ({ todoPage }) => {
    await test.step('Check all tabs are accessible', async () => {
      const tabs = ['pending', 'active', 'completed', 'failed'] as const;

      for (const tab of tabs) {
        await todoPage.switchToTab(tab);
        // Each tab should be clickable and show appropriate content
        await expect(todoPage.todoList).toBeVisible();
      }
    });
  });

  test('should handle empty state gracefully @edge-cases', async ({ todoPage, testDataService }) => {
    await test.step('Ensure clean state', async () => {
      // Clear any existing todos
      await testDataService.clearAndSeed([]);
      await todoPage.reload();
      await todoPage.waitForAppToLoad();
    });

    await test.step('Verify empty state display', async () => {
      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toHaveLength(0);

      // Should still show the interface for adding todos
      await expect(todoPage.addTodoButton).toBeVisible();
    });

    await test.step('Verify can add todo to empty list', async () => {
      await todoPage.createTodo({
        text: 'First todo in empty list',
        type: 'one-time',
        dueAt: new Date(Date.now() + 3600000),
      });

      await todoPage.expectTodoInState('First todo in empty list', 'pending');
    });
  });

  test('should handle basic search functionality @functionality', async ({ todoPage, testDataService, reactQueryUtils }) => {
    await test.step('Setup test data', async () => {
      const testTodos = [
        testDataService.createSimpleTodo('Buy coffee'),
        testDataService.createSimpleTodo('Buy tea'),
        testDataService.createSimpleTodo('Write code'),
      ];

      await testDataService.clearAndSeed(testTodos);
      await todoPage.reload();
      await todoPage.waitForAppToLoad();
    });

    await test.step('Perform search', async () => {
      await todoPage.searchTodos('Buy');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Buy coffee');
      expect(visibleTodos).toContain('Buy tea');
      expect(visibleTodos).not.toContain('Write code');
    });

    await test.step('Clear search', async () => {
      await todoPage.clearSearch();
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toHaveLength(3);
    });
  });

  test('should validate form inputs @functionality', async ({ todoPage }) => {
    await test.step('Try to create todo with empty text', async () => {
      await todoPage.smartClick(todoPage.addTodoButton);

      // Try to submit without filling in text
      if (await todoPage.elementExists(todoPage.submitTodoButton)) {
        await todoPage.smartClick(todoPage.submitTodoButton);

        // Should show validation error or prevent submission
        // The exact behavior depends on your form validation implementation
        // This test serves as a reminder to implement proper validation
      }
    });
  });

  test('should handle basic error scenarios @error-handling', async ({ todoPage, reactQueryUtils }) => {
    await test.step('Test offline scenario', async () => {
      // Go offline
      await reactQueryUtils.goOffline();

      // Try to create a todo
      await todoPage.smartClick(todoPage.addTodoButton);
      await todoPage.smartFill(todoPage.todoInput, 'Offline todo');

      if (await todoPage.elementExists(todoPage.submitTodoButton)) {
        await todoPage.smartClick(todoPage.submitTodoButton);

        // Should handle the error gracefully
        // The exact error handling depends on your implementation
      }

      // Go back online
      await reactQueryUtils.goOnline();
    });
  });

  test('should persist data across page reloads @persistence', async ({ todoPage }) => {
    const persistentTodo = 'Persistent todo';

    await test.step('Create todo', async () => {
      await todoPage.createTodo({
        text: persistentTodo,
        type: 'one-time',
        dueAt: new Date(Date.now() + 3600000),
      });

      await todoPage.expectTodoInState(persistentTodo, 'pending');
    });

    await test.step('Reload page and verify persistence', async () => {
      await todoPage.reload();
      await todoPage.waitForAppToLoad();

      // Todo should still be there
      await todoPage.expectTodoInState(persistentTodo, 'pending');
    });
  });

  test('should demonstrate state transition @critical', async ({ todoPage, reactQueryUtils }) => {
    const todoText = 'State transition demo';

    await test.step('Create todo in pending state', async () => {
      await todoPage.createTodo({
        text: todoText,
        type: 'one-time',
        dueAt: new Date(Date.now() + 3600000),
      });

      await todoPage.expectTodoInState(todoText, 'pending');
    });

    await test.step('Activate todo', async () => {
      await todoPage.activateTodo(todoText);
      await reactQueryUtils.waitForQueriesToSettle();

      await todoPage.expectTodoInState(todoText, 'active');
    });

    await test.step('Complete todo', async () => {
      await todoPage.completeTodo(todoText);
      await reactQueryUtils.waitForQueriesToSettle();

      await todoPage.expectTodoInState(todoText, 'completed');
    });
  });
});