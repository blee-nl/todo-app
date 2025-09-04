import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TaskList from "../TaskList";
import type { Todo } from "../../services/api";

// Mock the hooks
const mockDeleteCompletedTodos = vi.fn();
const mockDeleteFailedTodos = vi.fn();

vi.mock("../../hooks/useTodos", () => ({
  useDeleteCompletedTodos: () => ({
    mutateAsync: mockDeleteCompletedTodos,
    isPending: false,
  }),
  useDeleteFailedTodos: () => ({
    mutateAsync: mockDeleteFailedTodos,
    isPending: false,
  }),
}));

// Mock the todo item components
vi.mock("../PendingTodoItem", () => ({
  default: ({ todo }: { todo: Todo }) => (
    <div data-testid={`pending-${todo.id}`}>Pending: {todo.text}</div>
  ),
}));

vi.mock("../ActiveTodoItem", () => ({
  default: ({ todo }: { todo: Todo }) => (
    <div data-testid={`active-${todo.id}`}>Active: {todo.text}</div>
  ),
}));

vi.mock("../CompletedTodoItem", () => ({
  default: ({ todo }: { todo: Todo }) => (
    <div data-testid={`completed-${todo.id}`}>Completed: {todo.text}</div>
  ),
}));

vi.mock("../FailedTodoItem", () => ({
  default: ({ todo }: { todo: Todo }) => (
    <div data-testid={`failed-${todo.id}`}>Failed: {todo.text}</div>
  ),
}));

const mockTodos: Todo[] = [
  {
    id: "1",
    text: "Test todo 1",
    type: "one-time",
    state: "pending",
    dueAt: "2024-12-31T23:59:59.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    text: "Test todo 2",
    type: "daily",
    state: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    activatedAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("TaskList", () => {
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteCompletedTodos.mockResolvedValue({ deletedCount: 1 });
    mockDeleteFailedTodos.mockResolvedValue({ deletedCount: 1 });
  });

  it("should render empty state for pending tasks", () => {
    render(<TaskList todos={[]} state="pending" onError={mockOnError} />);

    expect(screen.getByText("📋")).toBeInTheDocument();
    expect(screen.getByText("No pending tasks")).toBeInTheDocument();
    expect(
      screen.getByText("Create a new task to get started")
    ).toBeInTheDocument();
  });

  it("should render empty state for active tasks", () => {
    render(<TaskList todos={[]} state="active" onError={mockOnError} />);

    expect(screen.getByText("⚡")).toBeInTheDocument();
    expect(screen.getByText("No active tasks")).toBeInTheDocument();
    expect(
      screen.getByText("Activate a pending task to begin working")
    ).toBeInTheDocument();
  });

  it("should render empty state for completed tasks", () => {
    render(<TaskList todos={[]} state="completed" onError={mockOnError} />);

    expect(screen.getByText("✅")).toBeInTheDocument();
    expect(screen.getByText("No completed tasks")).toBeInTheDocument();
    expect(
      screen.getByText("Complete some tasks to see them here")
    ).toBeInTheDocument();
  });

  it("should render empty state for failed tasks", () => {
    render(<TaskList todos={[]} state="failed" onError={mockOnError} />);

    expect(screen.getByText("❌")).toBeInTheDocument();
    expect(screen.getByText("No failed tasks")).toBeInTheDocument();
    expect(
      screen.getByText("Tasks that weren't completed will appear here")
    ).toBeInTheDocument();
  });

  it("should render pending todo items", () => {
    const pendingTodos = mockTodos.filter((todo) => todo.state === "pending");

    render(
      <TaskList todos={pendingTodos} state="pending" onError={mockOnError} />
    );

    expect(screen.getByTestId("pending-1")).toBeInTheDocument();
    expect(screen.getByText("Pending: Test todo 1")).toBeInTheDocument();
  });

  it("should render active todo items", () => {
    const activeTodos = mockTodos.filter((todo) => todo.state === "active");

    render(
      <TaskList todos={activeTodos} state="active" onError={mockOnError} />
    );

    expect(screen.getByTestId("active-2")).toBeInTheDocument();
    expect(screen.getByText("Active: Test todo 2")).toBeInTheDocument();
  });

  it("should render completed todo items", () => {
    const completedTodo: Todo = {
      id: "3",
      text: "Completed todo",
      type: "one-time",
      state: "completed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
      completedAt: "2024-01-01T01:00:00.000Z",
    };

    render(
      <TaskList
        todos={[completedTodo]}
        state="completed"
        onError={mockOnError}
      />
    );

    expect(screen.getByTestId("completed-3")).toBeInTheDocument();
    expect(screen.getByText("Completed: Completed todo")).toBeInTheDocument();
  });

  it("should render failed todo items", () => {
    const failedTodo: Todo = {
      id: "4",
      text: "Failed todo",
      type: "daily",
      state: "failed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
      failedAt: "2024-01-01T01:00:00.000Z",
    };

    render(
      <TaskList todos={[failedTodo]} state="failed" onError={mockOnError} />
    );

    expect(screen.getByTestId("failed-4")).toBeInTheDocument();
    expect(screen.getByText("Failed: Failed todo")).toBeInTheDocument();
  });

  it("should have correct container styling", () => {
    const { container } = render(
      <TaskList todos={[]} state="pending" onError={mockOnError} />
    );

    const taskList = container.firstChild as HTMLElement;
    expect(taskList).toHaveClass(
      "flex-1",
      "flex",
      "items-center",
      "justify-center",
      "p-8"
    );
  });

  it("should show delete all button for completed tasks", () => {
    const completedTodo: Todo = {
      id: "3",
      text: "Completed todo",
      type: "one-time",
      state: "completed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
      completedAt: "2024-01-01T01:00:00.000Z",
    };

    render(
      <TaskList
        todos={[completedTodo]}
        state="completed"
        onError={mockOnError}
      />
    );

    expect(screen.getByText("Delete All Completed")).toBeInTheDocument();
  });

  it("should show delete all button for failed tasks", () => {
    const failedTodo: Todo = {
      id: "4",
      text: "Failed todo",
      type: "daily",
      state: "failed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
      failedAt: "2024-01-01T01:00:00.000Z",
    };

    render(
      <TaskList todos={[failedTodo]} state="failed" onError={mockOnError} />
    );

    expect(screen.getByText("Delete All Failed")).toBeInTheDocument();
  });

  it("should not show delete all button for pending tasks", () => {
    const pendingTodos = mockTodos.filter((todo) => todo.state === "pending");

    render(
      <TaskList todos={pendingTodos} state="pending" onError={mockOnError} />
    );

    expect(screen.queryByText("Delete All Pending")).not.toBeInTheDocument();
  });

  it("should not show delete all button for active tasks", () => {
    const activeTodos = mockTodos.filter((todo) => todo.state === "active");

    render(
      <TaskList todos={activeTodos} state="active" onError={mockOnError} />
    );

    expect(screen.queryByText("Delete All Active")).not.toBeInTheDocument();
  });

  it("should call deleteCompletedTodos when delete all completed button is clicked", async () => {
    const completedTodo: Todo = {
      id: "3",
      text: "Completed todo",
      type: "one-time",
      state: "completed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
      completedAt: "2024-01-01T01:00:00.000Z",
    };

    render(
      <TaskList
        todos={[completedTodo]}
        state="completed"
        onError={mockOnError}
      />
    );

    const deleteAllButton = screen.getByText("Delete All Completed");
    fireEvent.click(deleteAllButton);

    await waitFor(() => {
      expect(mockDeleteCompletedTodos).toHaveBeenCalledTimes(1);
    });
  });

  it("should call deleteFailedTodos when delete all failed button is clicked", async () => {
    const failedTodo: Todo = {
      id: "4",
      text: "Failed todo",
      type: "daily",
      state: "failed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
      failedAt: "2024-01-01T01:00:00.000Z",
    };

    render(
      <TaskList todos={[failedTodo]} state="failed" onError={mockOnError} />
    );

    const deleteAllButton = screen.getByText("Delete All Failed");
    fireEvent.click(deleteAllButton);

    await waitFor(() => {
      expect(mockDeleteFailedTodos).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onError when delete all completed fails", async () => {
    const completedTodo: Todo = {
      id: "3",
      text: "Completed todo",
      type: "one-time",
      state: "completed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
      completedAt: "2024-01-01T01:00:00.000Z",
    };

    const error = new Error("Delete failed");
    mockDeleteCompletedTodos.mockRejectedValue(error);

    render(
      <TaskList
        todos={[completedTodo]}
        state="completed"
        onError={mockOnError}
      />
    );

    const deleteAllButton = screen.getByText("Delete All Completed");
    fireEvent.click(deleteAllButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it("should call onError when delete all failed fails", async () => {
    const failedTodo: Todo = {
      id: "4",
      text: "Failed todo",
      type: "daily",
      state: "failed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
      failedAt: "2024-01-01T01:00:00.000Z",
    };

    const error = new Error("Delete failed");
    mockDeleteFailedTodos.mockRejectedValue(error);

    render(
      <TaskList todos={[failedTodo]} state="failed" onError={mockOnError} />
    );

    const deleteAllButton = screen.getByText("Delete All Failed");
    fireEvent.click(deleteAllButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });
});
