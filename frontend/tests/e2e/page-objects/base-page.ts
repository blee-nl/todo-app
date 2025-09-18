import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific URL and wait for the page to load
   */
  async navigateTo(path: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; timeout?: number }): Promise<void> {
    await this.page.goto(path, {
      waitUntil: options?.waitUntil || 'networkidle',
      timeout: options?.timeout || 30000,
    });
  }

  /**
   * Wait for React Query to finish loading
   */
  async waitForReactQueryToSettle(timeoutMs: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      () => {
        // Check if React Query devtools are available and no queries are fetching
        const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
        if (devtools) {
          const client = devtools.client;
          if (client) {
            const queryCache = client.getQueryCache();
            const queries = queryCache.getAll();
            return queries.every((query: any) => !query.state.isFetching);
          }
        }

        // Fallback: wait for network to be idle
        return document.readyState === 'complete';
      },
      { timeout: timeoutMs }
    );
  }

  /**
   * Wait for an element to be visible with retry logic
   */
  async waitForElement(locator: Locator, options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' | 'detached' }): Promise<void> {
    await expect(locator).toBeVisible({
      timeout: options?.timeout || 10000,
    });
  }

  /**
   * Smart click with wait and retry logic
   */
  async smartClick(locator: Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    await this.waitForElement(locator, { timeout: options?.timeout });
    await locator.click({
      timeout: options?.timeout || 10000,
      force: options?.force,
    });
  }

  /**
   * Smart fill with wait and clear logic
   */
  async smartFill(locator: Locator, text: string, options?: { timeout?: number; clear?: boolean }): Promise<void> {
    await this.waitForElement(locator, { timeout: options?.timeout });

    if (options?.clear !== false) {
      await locator.clear();
    }

    await locator.fill(text, {
      timeout: options?.timeout || 10000,
    });
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(timeoutMs: number = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: timeoutMs });
  }

  /**
   * Take a screenshot with automatic naming
   */
  async takeScreenshot(name?: string): Promise<void> {
    const screenshotName = name || `${Date.now()}-screenshot.png`;
    await this.page.screenshot({ path: `test-results/screenshots/${screenshotName}` });
  }

  /**
   * Get text content from an element
   */
  async getTextContent(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    const text = await locator.textContent();
    return text?.trim() || '';
  }

  /**
   * Check if element exists without waiting
   */
  async elementExists(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'attached', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(urlPattern: string | RegExp, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForResponse(urlPattern, {
      timeout: options?.timeout || 30000,
    });
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Reload the page and wait for it to load
   */
  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.waitForReactQueryToSettle();
  }

  /**
   * Wait for page to be ready (DOM + React Query)
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForReactQueryToSettle();
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Wait for element to contain specific text
   */
  async waitForTextContent(locator: Locator, expectedText: string | RegExp, timeout: number = 10000): Promise<void> {
    await expect(locator).toContainText(expectedText, { timeout });
  }

  /**
   * Custom wait with retry logic
   */
  async waitForCondition(
    condition: () => Promise<boolean> | boolean,
    options?: { timeout?: number; interval?: number; timeoutMessage?: string }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    const interval = options?.interval || 100;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.page.waitForTimeout(interval);
    }

    throw new Error(options?.timeoutMessage || `Condition not met within ${timeout}ms`);
  }
}