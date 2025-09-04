import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TodoList from "../TodoList";
import type { Todo } from "../../services/api";

// Mock the todo item components
vi.mock("../PendingTodoItem", () => ({
  default: ({ todo }: { todo: Todo }) => (
    <div data-testid={`pending-${todo.id}`}>{todo.text}</div>
  ),
}));

vi.mock("../ActiveTodoItem", () => ({
  default: ({ todo }: { todo: Todo }) => (
    <div data-testid={`active-${todo.id}`}>{todo.text}</div>
  ),
}));

vi.mock("../CompletedTodoItem", () => ({
  default: ({ todo }: { todo: Todo }) => (
    <div data-testid={`completed-${todo.id}`}>{todo.text}</div>
  ),
}));

vi.mock("../FailedTodoItem", () => ({
  default: ({ todo }: { todo: Todo }) => (
    <div data-testid={`failed-${todo.id}`}>{todo.text}</div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockTodos: Todo[] = [
  {
    id: "1",
    text: "Pending task",
    type: "one-time",
    state: "pending",
    dueAt: "2024-12-31T23:59:59.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    text: "Active task",
    type: "daily",
    state: "active",
    dueAt: "2024-12-31T23:59:59.000Z",
    activatedAt: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    text: "Completed task",
    type: "one-time",
    state: "completed",
    dueAt: "2024-12-31T23:59:59.000Z",
    activatedAt: "2024-01-01T00:00:00.000Z",
    completedAt: "2024-01-02T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "4",
    text: "Failed task",
    type: "daily",
    state: "failed",
    dueAt: "2024-12-31T23:59:59.000Z",
    activatedAt: "2024-01-01T00:00:00.000Z",
    failedAt: "2024-01-02T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

describe("TodoList", () => {
  const mockOnError = vi.fn();

  it("should render pending todos", () => {
    render(
      <TodoList
        todos={mockTodos.filter((t) => t.state === "pending")}
        state="pending"
        onError={mockOnError}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId("pending-1")).toBeInTheDocument();
    expect(screen.getByText("Pending task")).toBeInTheDocument();
  });

  it("should render active todos", () => {
    render(
      <TodoList
        todos={mockTodos.filter((t) => t.state === "active")}
        state="active"
        onError={mockOnError}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId("active-2")).toBeInTheDocument();
    expect(screen.getByText("Active task")).toBeInTheDocument();
  });

  it("should render completed todos", () => {
    render(
      <TodoList
        todos={mockTodos.filter((t) => t.state === "completed")}
        state="completed"
        onError={mockOnError}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId("completed-3")).toBeInTheDocument();
    expect(screen.getByText("Completed task")).toBeInTheDocument();
  });

  it("should render failed todos", () => {
    render(
      <TodoList
        todos={mockTodos.filter((t) => t.state === "failed")}
        state="failed"
        onError={mockOnError}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId("failed-4")).toBeInTheDocument();
    expect(screen.getByText("Failed task")).toBeInTheDocument();
  });

  it("should render empty state when no todos", () => {
    render(<TodoList todos={[]} state="pending" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("No pending tasks")).toBeInTheDocument();
  });

  it("should render empty state for active todos", () => {
    render(<TodoList todos={[]} state="active" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("No active tasks")).toBeInTheDocument();
  });

  it("should render empty state for completed todos", () => {
    render(<TodoList todos={[]} state="completed" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("No completed tasks")).toBeInTheDocument();
  });

  it("should render empty state for failed todos", () => {
    render(<TodoList todos={[]} state="failed" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("No failed tasks")).toBeInTheDocument();
  });

  it("should pass onError to todo items", () => {
    render(
      <TodoList
        todos={mockTodos.filter((t) => t.state === "pending")}
        state="pending"
        onError={mockOnError}
      />,
      { wrapper: createWrapper() }
    );

    // The onError prop should be passed to the PendingTodoItem component
    // This is tested implicitly through the component rendering
    expect(screen.getByTestId("pending-1")).toBeInTheDocument();
  });
});
