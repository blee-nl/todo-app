import { test, expect } from './fixtures/todo-fixtures';

test.describe('Todo Application - 4-State Workflow', () => {
  test.beforeEach(async ({ todoPage }) => {
    // Navigate to the application and wait for it to load
    await todoPage.navigate();
  });

  test('should handle complete todo lifecycle: pending → active → completed @critical @smoke', async ({
    todoPage,
    testDataService,
    reactQueryUtils,
  }) => {
    const todoText = 'Complete E2E testing implementation';
    const dueDate = testDataService.createTomorrow(14, 30); // Tomorrow at 2:30 PM

    await test.step('Create a new todo in pending state', async () => {
      await todoPage.createTodo({
        text: todoText,
        type: 'one-time',
        dueAt: dueDate,
        notification: {
          enabled: true,
          reminderMinutes: 30,
        },
      });

      // Verify todo appears in pending state
      await todoPage.expectTodoInState(todoText, 'pending');
      expect(await todoPage.isTodoNotificationEnabled(todoText)).toBe(true);
    });

    await test.step('Activate the todo (pending → active)', async () => {
      await todoPage.activateTodo(todoText);

      // Verify state transition
      await todoPage.expectTodoInState(todoText, 'active');

      // Verify React Query cache is updated
      await reactQueryUtils.waitForQueriesToSettle();
    });

    await test.step('Complete the todo (active → completed)', async () => {
      await todoPage.completeTodo(todoText);

      // Verify state transition
      await todoPage.expectTodoInState(todoText, 'completed');

      // Verify React Query cache is updated
      await reactQueryUtils.waitForQueriesToSettle();
    });

    await test.step('Verify persistence after page reload', async () => {
      await todoPage.reload();
      await todoPage.waitForAppToLoad();

      // Todo should still be in completed state
      await todoPage.expectTodoInState(todoText, 'completed');
    });
  });

  test('should handle todo failure workflow: pending → active → failed @critical', async ({
    todoPage,
    testDataService,
    reactQueryUtils,
  }) => {
    const todoText = 'Task that will fail';
    const dueDate = testDataService.createTomorrow(10, 0); // Tomorrow at 10:00 AM

    await test.step('Create and activate todo', async () => {
      await todoPage.createTodo({
        text: todoText,
        type: 'one-time',
        dueAt: dueDate,
      });

      await todoPage.activateTodo(todoText);
      await todoPage.expectTodoInState(todoText, 'active');
    });

    await test.step('Mark todo as failed (active → failed)', async () => {
      await todoPage.failTodo(todoText);

      // Verify state transition
      await todoPage.expectTodoInState(todoText, 'failed');

      // Verify React Query cache is updated
      await reactQueryUtils.waitForQueriesToSettle();
    });

    await test.step('Verify failed todo can be viewed', async () => {
      await todoPage.switchToTab('failed');
      const failedTodos = await todoPage.getTodosByState('failed');
      expect(failedTodos).toContain(todoText);
    });
  });

  test('should handle todo reactivation workflow: failed → active @critical', async ({
    todoPage,
    testDataService,
    reactQueryUtils,
    dbUtils,
  }) => {
    const originalTodoText = 'Failed task to reactivate';
    const newDueDate = testDataService.createTomorrow(16, 0); // Tomorrow at 4:00 PM

    await test.step('Setup a failed todo via database', async () => {
      // Create a failed todo directly in database for faster setup
      await testDataService.clearAndSeed([
        testDataService.createFailedTodo(originalTodoText),
      ]);

      // Refresh page to load the seeded data
      await todoPage.reload();
      await todoPage.waitForAppToLoad();

      // Verify the failed todo exists
      await todoPage.expectTodoInState(originalTodoText, 'failed');
    });

    await test.step('Reactivate the failed todo', async () => {
      await todoPage.reactivateTodo(originalTodoText, newDueDate);

      // Wait for the reactivation to complete
      await reactQueryUtils.waitForQueriesToSettle();

      // The reactivated todo should be in active state
      // Note: Reactivation creates a new todo, so we need to look for it in active state
      await todoPage.switchToTab('active');
      const activeTodos = await todoPage.getTodosByState('active');
      expect(activeTodos).toContain(originalTodoText);
    });

    await test.step('Verify reactivated todo can be completed', async () => {
      await todoPage.completeTodo(originalTodoText);
      await todoPage.expectTodoInState(originalTodoText, 'completed');
    });
  });

  test('should handle daily task workflow @priority-medium', async ({
    todoPage,
    testDataService,
    reactQueryUtils,
  }) => {
    const dailyTaskText = 'Daily exercise routine';

    await test.step('Create a daily task', async () => {
      await todoPage.createTodo({
        text: dailyTaskText,
        type: 'daily',
      });

      // Daily tasks should start in pending state
      await todoPage.expectTodoInState(dailyTaskText, 'pending');
    });

    await test.step('Complete daily task workflow', async () => {
      // Activate daily task
      await todoPage.activateTodo(dailyTaskText);
      await todoPage.expectTodoInState(dailyTaskText, 'active');

      // Complete daily task
      await todoPage.completeTodo(dailyTaskText);
      await todoPage.expectTodoInState(dailyTaskText, 'completed');

      await reactQueryUtils.waitForQueriesToSettle();
    });

    await test.step('Verify daily task behavior', async () => {
      // Daily tasks should be completable multiple times
      // This would typically involve checking if a new instance can be created
      // The exact behavior depends on your application's daily task logic
      await todoPage.switchToTab('completed');
      const completedTodos = await todoPage.getTodosByState('completed');
      expect(completedTodos).toContain(dailyTaskText);
    });
  });

  test('should handle multiple todos with different states simultaneously @integration', async ({
    todoPage,
    testDataService,
    reactQueryUtils,
    dbUtils,
  }) => {
    const testTodos = [
      { text: 'Pending Task 1', state: 'pending' as const },
      { text: 'Pending Task 2', state: 'pending' as const },
      { text: 'Active Task 1', state: 'active' as const },
      { text: 'Active Task 2', state: 'active' as const },
      { text: 'Completed Task 1', state: 'completed' as const },
      { text: 'Failed Task 1', state: 'failed' as const },
    ];

    await test.step('Setup multiple todos in different states', async () => {
      const todos = testTodos.map(todo => ({
        ...testDataService.createSimpleTodo(todo.text),
        state: todo.state,
      }));

      await testDataService.clearAndSeed(todos);
      await todoPage.reload();
      await todoPage.waitForAppToLoad();
    });

    await test.step('Verify all todos appear in correct tabs', async () => {
      for (const { text, state } of testTodos) {
        await todoPage.expectTodoInState(text, state);
      }
    });

    await test.step('Perform state transitions on multiple todos', async () => {
      // Activate a pending todo
      await todoPage.activateTodo('Pending Task 1');
      await todoPage.expectTodoInState('Pending Task 1', 'active');

      // Complete an active todo
      await todoPage.completeTodo('Active Task 1');
      await todoPage.expectTodoInState('Active Task 1', 'completed');

      // Fail an active todo
      await todoPage.failTodo('Active Task 2');
      await todoPage.expectTodoInState('Active Task 2', 'failed');

      await reactQueryUtils.waitForQueriesToSettle();
    });

    await test.step('Verify final state counts', async () => {
      await todoPage.switchToTab('pending');
      const pendingTodos = await todoPage.getTodosByState('pending');
      expect(pendingTodos).toHaveLength(1); // Only 'Pending Task 2' should remain

      await todoPage.switchToTab('active');
      const activeTodos = await todoPage.getTodosByState('active');
      expect(activeTodos).toHaveLength(1); // Only 'Pending Task 1' (now active) should be here

      await todoPage.switchToTab('completed');
      const completedTodos = await todoPage.getTodosByState('completed');
      expect(completedTodos).toHaveLength(2); // 'Completed Task 1' + 'Active Task 1'

      await todoPage.switchToTab('failed');
      const failedTodos = await todoPage.getTodosByState('failed');
      expect(failedTodos).toHaveLength(2); // 'Failed Task 1' + 'Active Task 2'
    });
  });

  test('should handle todo editing during different states @functionality', async ({
    todoPage,
    testDataService,
    reactQueryUtils,
  }) => {
    const originalText = 'Original todo text';
    const updatedText = 'Updated todo text';

    await test.step('Create and edit todo in pending state', async () => {
      await todoPage.createTodo({
        text: originalText,
        type: 'one-time',
        dueAt: testDataService.createTomorrow(),
      });

      await todoPage.editTodo(originalText, updatedText);
      await todoPage.expectTodoInState(updatedText, 'pending');
      await todoPage.expectTodoNotExists(originalText);
    });

    await test.step('Edit todo in active state', async () => {
      const activeText = 'Active task text';

      await todoPage.activateTodo(updatedText);
      await todoPage.editTodo(updatedText, activeText);

      await todoPage.expectTodoInState(activeText, 'active');
      await reactQueryUtils.waitForQueriesToSettle();
    });
  });

  test('should handle error scenarios gracefully @error-handling', async ({
    todoPage,
    reactQueryUtils,
  }) => {
    await test.step('Handle network error during todo creation', async () => {
      // Simulate network failure
      await reactQueryUtils.goOffline();

      // Attempt to create todo (should handle gracefully)
      await todoPage.createTodo({
        text: 'This should fail to create',
        type: 'one-time',
        dueAt: new Date(Date.now() + 3600000), // 1 hour from now
      });

      // Verify error handling
      await todoPage.expectErrorMessage();
    });

    await test.step('Recover from network error', async () => {
      // Restore network
      await reactQueryUtils.goOnline();

      // Now todo creation should work
      await todoPage.createTodo({
        text: 'This should succeed',
        type: 'one-time',
        dueAt: new Date(Date.now() + 3600000),
      });

      await todoPage.expectTodoInState('This should succeed', 'pending');
    });
  });

  test('should maintain data consistency across browser sessions @persistence', async ({
    todoPage,
    testDataService,
    page,
  }) => {
    const persistentTodoText = 'Persistent todo across sessions';

    await test.step('Create todo and perform state transitions', async () => {
      await todoPage.createTodo({
        text: persistentTodoText,
        type: 'one-time',
        dueAt: testDataService.createTomorrow(),
      });

      await todoPage.activateTodo(persistentTodoText);
      await todoPage.expectTodoInState(persistentTodoText, 'active');
    });

    await test.step('Simulate browser session restart', async () => {
      // Clear browser storage and reload
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await todoPage.reload();
      await todoPage.waitForAppToLoad();

      // Todo should still exist in active state (persisted in database)
      await todoPage.expectTodoInState(persistentTodoText, 'active');
    });

    await test.step('Complete workflow after session restart', async () => {
      await todoPage.completeTodo(persistentTodoText);
      await todoPage.expectTodoInState(persistentTodoText, 'completed');
    });
  });
});