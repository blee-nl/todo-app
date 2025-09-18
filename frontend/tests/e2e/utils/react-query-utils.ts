import { Page } from '@playwright/test';

export class ReactQueryUtils {
  constructor(private page: Page) {}

  /**
   * Wait for all React Query queries to finish loading
   */
  async waitForQueriesToSettle(timeoutMs: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      () => {
        // Check if React Query devtools are available
        const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
        if (devtools && devtools.client) {
          const client = devtools.client;
          const queryCache = client.getQueryCache();
          const queries = queryCache.getAll();

          // Check if any queries are fetching
          const isFetching = queries.some((query: any) => query.state.isFetching);
          return !isFetching;
        }

        // Fallback: Check for loading states in the DOM
        const loadingSpinners = document.querySelectorAll('[data-testid="loading-spinner"]');
        const loadingStates = document.querySelectorAll('[data-loading="true"]');

        return loadingSpinners.length === 0 && loadingStates.length === 0;
      },
      { timeout: timeoutMs }
    );

    // Additional wait for any async operations to complete
    await this.page.waitForTimeout(100);
  }

  /**
   * Wait for a specific query to finish loading by key
   */
  async waitForQueryToSettle(queryKey: string[], timeoutMs: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      (key) => {
        const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
        if (devtools && devtools.client) {
          const client = devtools.client;
          const queryCache = client.getQueryCache();
          const query = queryCache.find(key);

          return !query || !query.state.isFetching;
        }
        return true;
      },
      queryKey,
      { timeout: timeoutMs }
    );
  }

  /**
   * Invalidate all queries to force refetch
   */
  async invalidateAllQueries(): Promise<void> {
    await this.page.evaluate(() => {
      const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
      if (devtools && devtools.client) {
        const client = devtools.client;
        client.invalidateQueries();
      }
    });

    await this.waitForQueriesToSettle();
  }

  /**
   * Invalidate specific query by key
   */
  async invalidateQuery(queryKey: string[]): Promise<void> {
    await this.page.evaluate((key) => {
      const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
      if (devtools && devtools.client) {
        const client = devtools.client;
        client.invalidateQueries(key);
      }
    }, queryKey);

    await this.waitForQueryToSettle(queryKey);
  }

  /**
   * Clear React Query cache
   */
  async clearQueryCache(): Promise<void> {
    await this.page.evaluate(() => {
      const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
      if (devtools && devtools.client) {
        const client = devtools.client;
        client.clear();
      }
    });
  }

  /**
   * Get query state for debugging
   */
  async getQueryState(queryKey: string[]): Promise<any> {
    return await this.page.evaluate((key) => {
      const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
      if (devtools && devtools.client) {
        const client = devtools.client;
        const queryCache = client.getQueryCache();
        const query = queryCache.find(key);

        if (query) {
          return {
            status: query.state.status,
            isFetching: query.state.isFetching,
            isLoading: query.state.isLoading,
            error: query.state.error,
            data: query.state.data,
          };
        }
      }
      return null;
    }, queryKey);
  }

  /**
   * Wait for mutation to complete
   */
  async waitForMutationToComplete(timeoutMs: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
        if (devtools && devtools.client) {
          const client = devtools.client;
          const mutationCache = client.getMutationCache();
          const mutations = mutationCache.getAll();

          // Check if any mutations are loading
          const isLoading = mutations.some((mutation: any) => mutation.state.status === 'loading');
          return !isLoading;
        }
        return true;
      },
      { timeout: timeoutMs }
    );
  }

  /**
   * Wait for specific network request to complete
   */
  async waitForNetworkRequest(urlPattern: string | RegExp, options?: { method?: string; timeout?: number }): Promise<void> {
    const timeout = options?.timeout || 10000;
    const method = options?.method?.toUpperCase();

    await this.page.waitForResponse(
      (response) => {
        const url = response.url();
        const responseMethod = response.request().method();

        const urlMatches = typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);

        const methodMatches = !method || responseMethod === method;

        return urlMatches && methodMatches;
      },
      { timeout }
    );

    // Wait for React Query to process the response
    await this.waitForQueriesToSettle();
  }

  /**
   * Wait for API response and React Query update
   */
  async waitForAPIResponse(endpoint: string, method: string = 'GET'): Promise<void> {
    await this.waitForNetworkRequest(endpoint, { method });
  }

  /**
   * Mock API response for testing error states
   */
  async mockAPIResponse(urlPattern: string | RegExp, response: any, status: number = 200): Promise<void> {
    await this.page.route(urlPattern, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Mock API error for testing error handling
   */
  async mockAPIError(urlPattern: string | RegExp, status: number = 500, message: string = 'Internal Server Error'): Promise<void> {
    await this.page.route(urlPattern, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: message }),
      });
    });
  }

  /**
   * Enable network offline mode
   */
  async goOffline(): Promise<void> {
    await this.page.context().setOffline(true);
  }

  /**
   * Disable network offline mode
   */
  async goOnline(): Promise<void> {
    await this.page.context().setOffline(false);
    await this.waitForQueriesToSettle();
  }

  /**
   * Simulate slow network conditions
   */
  async setSlowNetwork(): Promise<void> {
    await this.page.context().setExtraHTTPHeaders({});
    await this.page.context().addInitScript(() => {
      // Slow down all network requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
        return originalFetch(...args);
      };
    });
  }

  /**
   * Reset network conditions to normal
   */
  async resetNetwork(): Promise<void> {
    await this.page.context().clearCookies();
    await this.page.context().clearPermissions();
  }

  /**
   * Check if React Query is in error state
   */
  async hasQueryError(queryKey?: string[]): Promise<boolean> {
    return await this.page.evaluate((key) => {
      const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
      if (devtools && devtools.client) {
        const client = devtools.client;
        const queryCache = client.getQueryCache();

        if (key) {
          const query = queryCache.find(key);
          return query && query.state.status === 'error';
        } else {
          // Check if any query has error
          const queries = queryCache.getAll();
          return queries.some((query: any) => query.state.status === 'error');
        }
      }
      return false;
    }, queryKey);
  }

  /**
   * Get all query keys currently in cache
   */
  async getAllQueryKeys(): Promise<string[][]> {
    return await this.page.evaluate(() => {
      const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
      if (devtools && devtools.client) {
        const client = devtools.client;
        const queryCache = client.getQueryCache();
        const queries = queryCache.getAll();
        return queries.map((query: any) => query.queryKey);
      }
      return [];
    });
  }

  /**
   * Force React Query to retry a failed query
   */
  async retryQuery(queryKey: string[]): Promise<void> {
    await this.page.evaluate((key) => {
      const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
      if (devtools && devtools.client) {
        const client = devtools.client;
        const queryCache = client.getQueryCache();
        const query = queryCache.find(key);
        if (query) {
          query.fetch();
        }
      }
    }, queryKey);

    await this.waitForQueryToSettle(queryKey);
  }

  /**
   * Debug: Log all query states to console
   */
  async debugQueryStates(): Promise<void> {
    const states = await this.page.evaluate(() => {
      const devtools = (window as any).__REACT_QUERY_DEVTOOLS__;
      if (devtools && devtools.client) {
        const client = devtools.client;
        const queryCache = client.getQueryCache();
        const queries = queryCache.getAll();

        return queries.map((query: any) => ({
          queryKey: query.queryKey,
          status: query.state.status,
          isFetching: query.state.isFetching,
          isLoading: query.state.isLoading,
          error: query.state.error?.message,
        }));
      }
      return [];
    });

    console.log('React Query States:', states);
  }
}