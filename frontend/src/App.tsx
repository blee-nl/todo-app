import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import TodoApp from "./components/TodoApp";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        if (error && typeof error === "object" && "response" in error) {
          const response = (error as { response?: { status?: number } })
            .response;
          if (
            response?.status &&
            response.status >= 400 &&
            response.status < 500
          ) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        // Don't retry mutations on 4xx errors
        if (error && typeof error === "object" && "response" in error) {
          const response = (error as { response?: { status?: number } })
            .response;
          if (
            response?.status &&
            response.status >= 400 &&
            response.status < 500
          ) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <TodoApp />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
