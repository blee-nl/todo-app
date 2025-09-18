import { test, expect } from './fixtures/todo-fixtures';

test.describe('Todo Application - Search and Filter Features', () => {
  test.beforeEach(async ({ todoPage, testDataService }) => {
    // Navigate to the application
    await todoPage.navigate();

    // Seed test data for search/filter tests
    await testDataService.clearAndSeed(testDataService.createSearchTestData());
    await todoPage.reload();
    await todoPage.waitForAppToLoad();
  });

  test('should filter todos by state tabs @functionality', async ({ todoPage }) => {
    await test.step('View all todos', async () => {
      await todoPage.switchToTab('all');
      const allTodos = await todoPage.getVisibleTodos();
      expect(allTodos.length).toBeGreaterThan(0);
    });

    await test.step('Filter by pending todos', async () => {
      await todoPage.switchToTab('pending');
      const pendingTodos = await todoPage.getTodosByState('pending');

      // Should contain specific pending todos
      expect(pendingTodos).toContain('Buy groceries for dinner');
      expect(pendingTodos).toContain('Call mom about weekend');
      expect(pendingTodos).toContain('Finish React project');
    });

    await test.step('Filter by active todos', async () => {
      await todoPage.switchToTab('active');
      const activeTodos = await todoPage.getTodosByState('active');

      expect(activeTodos).toContain('Write documentation');
    });

    await test.step('Filter by completed todos', async () => {
      await todoPage.switchToTab('completed');
      const completedTodos = await todoPage.getTodosByState('completed');

      expect(completedTodos).toContain('Complete unit tests');
    });

    await test.step('Filter by failed todos', async () => {
      await todoPage.switchToTab('failed');
      const failedTodos = await todoPage.getTodosByState('failed');

      expect(failedTodos).toContain('Attend team meeting');
    });
  });

  test('should search todos by text content @functionality', async ({ todoPage, reactQueryUtils }) => {
    await test.step('Search for specific keyword', async () => {
      await todoPage.searchTodos('React');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Finish React project');
      expect(visibleTodos).not.toContain('Buy groceries for dinner');
    });

    await test.step('Search for partial match', async () => {
      await todoPage.searchTodos('mom');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Call mom about weekend');
      expect(visibleTodos.length).toBe(1);
    });

    await test.step('Search with no results', async () => {
      await todoPage.searchTodos('nonexistent task');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos.length).toBe(0);
    });

    await test.step('Clear search to show all todos', async () => {
      await todoPage.clearSearch();
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos.length).toBeGreaterThan(1);
    });
  });

  test('should combine search with state filtering @integration', async ({ todoPage, reactQueryUtils }) => {
    await test.step('Search within specific state', async () => {
      // Switch to pending tab first
      await todoPage.switchToTab('pending');

      // Then search for 'groceries'
      await todoPage.searchTodos('groceries');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Buy groceries for dinner');

      // Should not show todos from other states even if they match search
      expect(visibleTodos).not.toContain('Complete unit tests'); // This is completed
    });

    await test.step('Search in different state tab', async () => {
      await todoPage.switchToTab('completed');
      await todoPage.searchTodos('unit');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Complete unit tests');
      expect(visibleTodos.length).toBe(1);
    });
  });

  test('should handle real-time search updates @performance', async ({ todoPage, reactQueryUtils }) => {
    await test.step('Search updates as user types', async () => {
      // Type search gradually to test real-time updates
      await todoPage.searchTodos('e');
      await reactQueryUtils.waitForQueriesToSettle();

      let visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos.length).toBeGreaterThan(0);

      // Add more characters
      await todoPage.searchTodos('ex');
      await reactQueryUtils.waitForQueriesToSettle();

      visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Morning exercise routine');
    });

    await test.step('Search is case insensitive', async () => {
      await todoPage.searchTodos('REACT');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Finish React project');
    });
  });

  test('should maintain search state across tab switches @usability', async ({ todoPage, reactQueryUtils }) => {
    await test.step('Set search term', async () => {
      await todoPage.searchTodos('exercise');
      await reactQueryUtils.waitForQueriesToSettle();
    });

    await test.step('Switch tabs and verify search persists', async () => {
      await todoPage.switchToTab('pending');
      await reactQueryUtils.waitForQueriesToSettle();

      // Search should still be active
      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Morning exercise routine');

      // Switch to another tab
      await todoPage.switchToTab('all');
      await reactQueryUtils.waitForQueriesToSettle();

      // Search should still filter results
      const allVisibleTodos = await todoPage.getVisibleTodos();
      expect(allVisibleTodos).toContain('Morning exercise routine');
      expect(allVisibleTodos).not.toContain('Buy groceries for dinner');
    });
  });

  test('should handle empty states gracefully @edge-cases', async ({ todoPage, testDataService, reactQueryUtils }) => {
    await test.step('Clear all todos', async () => {
      await testDataService.clearAndSeed([]);
      await todoPage.reload();
      await todoPage.waitForAppToLoad();
    });

    await test.step('Search in empty todo list', async () => {
      await todoPage.searchTodos('anything');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos.length).toBe(0);
    });

    await test.step('Switch tabs in empty state', async () => {
      await todoPage.switchToTab('pending');
      const pendingTodos = await todoPage.getTodosByState('pending');
      expect(pendingTodos.length).toBe(0);

      await todoPage.switchToTab('active');
      const activeTodos = await todoPage.getTodosByState('active');
      expect(activeTodos.length).toBe(0);
    });
  });

  test('should handle special characters in search @edge-cases', async ({ todoPage, reactQueryUtils }) => {
    await test.step('Create todo with special characters', async () => {
      const specialTodo = 'Fix bug in @component #123 (high priority!)';
      await todoPage.createTodo({
        text: specialTodo,
        type: 'one-time',
        dueAt: new Date(Date.now() + 3600000),
      });
    });

    await test.step('Search for special characters', async () => {
      await todoPage.searchTodos('@component');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Fix bug in @component #123 (high priority!)');
    });

    await test.step('Search for hash tags', async () => {
      await todoPage.searchTodos('#123');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Fix bug in @component #123 (high priority!)');
    });

    await test.step('Search for parentheses content', async () => {
      await todoPage.searchTodos('high priority');
      await reactQueryUtils.waitForQueriesToSettle();

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos).toContain('Fix bug in @component #123 (high priority!)');
    });
  });

  test('should perform well with large todo lists @performance', async ({ todoPage, testDataService, reactQueryUtils }) => {
    await test.step('Load large number of todos', async () => {
      const performanceData = testDataService.createPerformanceTestData(50);
      await testDataService.clearAndSeed(performanceData);
      await todoPage.reload();
      await todoPage.waitForAppToLoad();
    });

    await test.step('Search should be responsive with many todos', async () => {
      const startTime = Date.now();

      await todoPage.searchTodos('Performance');
      await reactQueryUtils.waitForQueriesToSettle();

      const endTime = Date.now();
      const searchTime = endTime - startTime;

      // Search should complete within reasonable time (adjust threshold as needed)
      expect(searchTime).toBeLessThan(2000); // 2 seconds max

      const visibleTodos = await todoPage.getVisibleTodos();
      expect(visibleTodos.length).toBeGreaterThan(0);

      // All visible todos should contain the search term
      for (const todo of visibleTodos) {
        expect(todo).toContain('Performance');
      }
    });

    await test.step('Tab switching should be fast with many todos', async () => {
      const startTime = Date.now();

      await todoPage.switchToTab('active');
      await reactQueryUtils.waitForQueriesToSettle();

      const endTime = Date.now();
      const switchTime = endTime - startTime;

      expect(switchTime).toBeLessThan(1500); // 1.5 seconds max

      const activeTodos = await todoPage.getTodosByState('active');
      expect(activeTodos.length).toBeGreaterThan(0);
    });
  });
});