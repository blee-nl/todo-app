import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export interface TodoItem {
  id?: string;
  text: string;
  type: 'one-time' | 'daily';
  state: 'pending' | 'active' | 'completed' | 'failed';
  dueAt?: Date;
  notification?: {
    enabled: boolean;
    reminderMinutes: number;
  };
}

export class TodoPage extends BasePage {
  // Main app locators
  readonly todoApp: Locator;
  readonly loadingSpinner: Locator;
  readonly errorMessage: Locator;

  // Todo creation locators
  readonly addTodoButton: Locator;
  readonly todoInput: Locator;
  readonly todoTypeSelect: Locator;
  readonly dueDateInput: Locator;
  readonly dueTimeInput: Locator;
  readonly notificationToggle: Locator;
  readonly reminderMinutesInput: Locator;
  readonly submitTodoButton: Locator;
  readonly cancelTodoButton: Locator;

  // Todo list locators
  readonly todoList: Locator;
  readonly pendingTodos: Locator;
  readonly activeTodos: Locator;
  readonly completedTodos: Locator;
  readonly failedTodos: Locator;

  // Filter and view locators
  readonly allTodosTab: Locator;
  readonly pendingTab: Locator;
  readonly activeTab: Locator;
  readonly completedTab: Locator;
  readonly failedTab: Locator;

  // Search and sorting
  readonly searchInput: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);

    // Main app
    this.todoApp = page.locator('[data-testid="todo-app"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');

    // Todo creation (either desktop or mobile button that's visible)
    this.addTodoButton = page.locator('[data-testid="add-todo-button"], [data-testid="add-todo-button-mobile"]').first();
    this.todoInput = page.locator('[data-testid="todo-input"]');
    this.todoTypeSelect = page.locator('[data-testid="todo-type-select"]');
    this.dueDateInput = page.locator('[data-testid="due-date-input"]');
    this.dueTimeInput = page.locator('[data-testid="due-time-input"]');
    this.notificationToggle = page.locator('[data-testid="notification-toggle"]');
    this.reminderMinutesInput = page.locator('[data-testid="reminder-minutes-input"]');
    this.submitTodoButton = page.locator('[data-testid="submit-todo-button"]');
    this.cancelTodoButton = page.locator('[data-testid="cancel-todo-button"]');

    // Todo lists
    this.todoList = page.locator('[data-testid="todo-list"]');
    this.pendingTodos = page.locator('[data-testid="pending-todos"]');
    this.activeTodos = page.locator('[data-testid="active-todos"]');
    this.completedTodos = page.locator('[data-testid="completed-todos"]');
    this.failedTodos = page.locator('[data-testid="failed-todos"]');

    // Tabs (prefer desktop, fallback to mobile)
    this.allTodosTab = page.locator('[data-testid="all-todos-tab"]');
    this.pendingTab = page.locator('[data-testid="pending-tab"], [data-testid="pending-tab-mobile"]').first();
    this.activeTab = page.locator('[data-testid="active-tab"], [data-testid="active-tab-mobile"]').first();
    this.completedTab = page.locator('[data-testid="completed-tab"], [data-testid="completed-tab-mobile"]').first();
    this.failedTab = page.locator('[data-testid="failed-tab"], [data-testid="failed-tab-mobile"]').first();

    // Search and sort
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.sortDropdown = page.locator('[data-testid="sort-dropdown"]');
  }

  /**
   * Navigate to the todo application
   */
  async navigate(): Promise<void> {
    await this.navigateTo('/');
    await this.waitForAppToLoad();
  }

  /**
   * Wait for the todo app to fully load
   */
  async waitForAppToLoad(): Promise<void> {
    await this.waitForElement(this.todoApp);
    await this.waitForReactQueryToSettle();

    // Wait for loading spinner to disappear if it exists
    if (await this.elementExists(this.loadingSpinner)) {
      await expect(this.loadingSpinner).toBeHidden({ timeout: 30000 });
    }
  }

  /**
   * Create a new todo with comprehensive options
   */
  async createTodo(todo: Partial<TodoItem> & { text: string }): Promise<void> {
    await this.smartClick(this.addTodoButton);

    // Fill in todo text
    await this.smartFill(this.todoInput, todo.text);

    // Select todo type if specified
    if (todo.type) {
      await this.smartClick(this.todoTypeSelect);
      await this.smartClick(this.page.locator(`[data-testid="todo-type-${todo.type}"]`));
    }

    // Set due date/time if specified
    if (todo.dueAt) {
      // For now, skip date/time setting as it requires custom calendar interaction
      // TODO: Implement proper calendar interaction for CustomDateTimePicker
      console.log('Skipping date/time setting for custom date picker');
    }

    // Configure notifications if specified
    if (todo.notification) {
      // Skip notification configuration for now as it requires date to be set
      console.log('Skipping notification configuration');
    }

    // Submit the todo
    await this.smartClick(this.submitTodoButton);

    // Wait for the todo to appear in the list
    await this.waitForTodoInList(todo.text);
  }

  /**
   * Wait for a todo to appear in the list
   */
  async waitForTodoInList(todoText: string, timeout: number = 10000): Promise<void> {
    const todoLocator = this.getTodoByText(todoText);
    await this.waitForElement(todoLocator, { timeout });
  }

  /**
   * Get a todo item by its text content
   */
  getTodoByText(text: string): Locator {
    return this.page.locator(`[data-testid="todo-item"]:has-text("${text}")`);
  }

  /**
   * Get a todo item by its ID
   */
  getTodoById(id: string): Locator {
    return this.page.locator(`[data-testid="todo-item-${id}"]`);
  }

  /**
   * Activate a todo (move from pending to active)
   */
  async activateTodo(todoText: string): Promise<void> {
    const todoItem = this.getTodoByText(todoText);
    const activateButton = todoItem.locator('[data-testid="activate-todo-button"]');
    await this.smartClick(activateButton);

    // Wait for API response
    await this.waitForAPIResponse(/\/api\/todos\/.*\/activate/);
    await this.waitForReactQueryToSettle();
  }

  /**
   * Complete a todo (move to completed state)
   */
  async completeTodo(todoText: string): Promise<void> {
    const todoItem = this.getTodoByText(todoText);
    const completeButton = todoItem.locator('[data-testid="complete-todo-button"]');
    await this.smartClick(completeButton);

    // Wait for API response
    await this.waitForAPIResponse(/\/api\/todos\/.*\/complete/);
    await this.waitForReactQueryToSettle();
  }

  /**
   * Fail a todo (move to failed state)
   */
  async failTodo(todoText: string): Promise<void> {
    const todoItem = this.getTodoByText(todoText);
    const failButton = todoItem.locator('[data-testid="fail-todo-button"]');
    await this.smartClick(failButton);

    // Wait for API response
    await this.waitForAPIResponse(/\/api\/todos\/.*\/fail/);
    await this.waitForReactQueryToSettle();
  }

  /**
   * Delete a todo
   */
  async deleteTodo(todoText: string): Promise<void> {
    const todoItem = this.getTodoByText(todoText);
    const deleteButton = todoItem.locator('[data-testid="delete-todo-button"]');
    await this.smartClick(deleteButton);

    // Confirm deletion if modal appears
    const confirmButton = this.page.locator('[data-testid="confirm-delete-button"]');
    if (await this.elementExists(confirmButton)) {
      await this.smartClick(confirmButton);
    }

    // Wait for API response
    await this.waitForAPIResponse(/\/api\/todos\/.*/);
    await this.waitForReactQueryToSettle();
  }

  /**
   * Edit a todo
   */
  async editTodo(todoText: string, newText: string): Promise<void> {
    const todoItem = this.getTodoByText(todoText);
    const editButton = todoItem.locator('[data-testid="edit-todo-button"]');
    await this.smartClick(editButton);

    // Wait for edit form to appear
    const editInput = todoItem.locator('[data-testid="edit-todo-input"]');
    await this.smartFill(editInput, newText);

    // Save changes
    const saveButton = todoItem.locator('[data-testid="save-todo-button"]');
    await this.smartClick(saveButton);

    // Wait for API response
    await this.waitForAPIResponse(/\/api\/todos\/.*/);
    await this.waitForReactQueryToSettle();
  }

  /**
   * Reactivate a failed todo
   */
  async reactivateTodo(todoText: string, newDueDate?: Date): Promise<void> {
    const todoItem = this.getTodoByText(todoText);
    const reactivateButton = todoItem.locator('[data-testid="reactivate-todo-button"]');
    await this.smartClick(reactivateButton);

    // Set new due date if provided
    if (newDueDate) {
      const dueDateStr = newDueDate.toISOString().split('T')[0];
      const dueTimeStr = newDueDate.toTimeString().slice(0, 5);

      await this.smartFill(this.dueDateInput, dueDateStr);
      await this.smartFill(this.dueTimeInput, dueTimeStr);
    }

    // Confirm reactivation
    const confirmButton = this.page.locator('[data-testid="confirm-reactivate-button"]');
    await this.smartClick(confirmButton);

    // Wait for API response
    await this.waitForAPIResponse(/\/api\/todos\/.*\/reactivate/);
    await this.waitForReactQueryToSettle();
  }

  /**
   * Switch to a specific tab/view
   */
  async switchToTab(tab: 'all' | 'pending' | 'active' | 'completed' | 'failed'): Promise<void> {
    const tabLocators = {
      all: this.allTodosTab,
      pending: this.pendingTab,
      active: this.activeTab,
      completed: this.completedTab,
      failed: this.failedTab,
    };

    await this.smartClick(tabLocators[tab]);
    await this.waitForReactQueryToSettle();
  }

  /**
   * Search for todos
   */
  async searchTodos(searchTerm: string): Promise<void> {
    await this.smartFill(this.searchInput, searchTerm);
    await this.waitForReactQueryToSettle();
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.waitForReactQueryToSettle();
  }

  /**
   * Get all visible todos
   */
  async getVisibleTodos(): Promise<string[]> {
    const todoItems = this.page.locator('[data-testid="todo-item"]');
    const count = await todoItems.count();
    const todos: string[] = [];

    for (let i = 0; i < count; i++) {
      const todoText = await todoItems.nth(i).locator('[data-testid="todo-text"]').textContent();
      if (todoText) {
        todos.push(todoText.trim());
      }
    }

    return todos;
  }

  /**
   * Get todos by state
   */
  async getTodosByState(state: 'pending' | 'active' | 'completed' | 'failed'): Promise<string[]> {
    const stateLocators = {
      pending: this.pendingTodos,
      active: this.activeTodos,
      completed: this.completedTodos,
      failed: this.failedTodos,
    };

    const todoItems = stateLocators[state].locator('[data-testid="todo-item"]');
    const count = await todoItems.count();
    const todos: string[] = [];

    for (let i = 0; i < count; i++) {
      const todoText = await todoItems.nth(i).locator('[data-testid="todo-text"]').textContent();
      if (todoText) {
        todos.push(todoText.trim());
      }
    }

    return todos;
  }

  /**
   * Verify todo exists in specific state
   */
  async expectTodoInState(todoText: string, state: 'pending' | 'active' | 'completed' | 'failed'): Promise<void> {
    await this.switchToTab(state);
    const todoItem = this.getTodoByText(todoText);
    await this.waitForElement(todoItem);
    await expect(todoItem).toBeVisible();
  }

  /**
   * Verify todo does not exist
   */
  async expectTodoNotExists(todoText: string): Promise<void> {
    const todoItem = this.getTodoByText(todoText);
    await expect(todoItem).toBeHidden();
  }

  /**
   * Wait for specific number of todos to be visible
   */
  async waitForTodoCount(count: number, timeout: number = 10000): Promise<void> {
    await this.waitForCondition(
      async () => {
        const todos = await this.getVisibleTodos();
        return todos.length === count;
      },
      { timeout, timeoutMessage: `Expected ${count} todos, but count did not match within ${timeout}ms` }
    );
  }

  /**
   * Get todo state from UI
   */
  async getTodoState(todoText: string): Promise<string> {
    const todoItem = this.getTodoByText(todoText);
    const stateElement = todoItem.locator('[data-testid="todo-state"]');
    return await this.getTextContent(stateElement);
  }

  /**
   * Check if todo has notification enabled
   */
  async isTodoNotificationEnabled(todoText: string): Promise<boolean> {
    const todoItem = this.getTodoByText(todoText);
    const notificationIcon = todoItem.locator('[data-testid="notification-icon"]');
    return await this.elementExists(notificationIcon);
  }

  /**
   * Verify error message is displayed
   */
  async expectErrorMessage(message?: string): Promise<void> {
    await this.waitForElement(this.errorMessage);
    if (message) {
      await this.waitForTextContent(this.errorMessage, message);
    }
  }

  /**
   * Clear all todos (for cleanup)
   */
  async clearAllTodos(): Promise<void> {
    const todos = await this.getVisibleTodos();
    for (const todoText of todos) {
      await this.deleteTodo(todoText);
    }
  }
}