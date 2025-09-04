import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PendingTodoItem from "../PendingTodoItem";
import type { Todo } from "../../services/api";

// Mock the hooks
const mockActivateTodo = vi.fn();
const mockDeleteTodo = vi.fn();

vi.mock("../../hooks/useTodos", () => ({
  useActivateTodo: () => ({
    mutateAsync: mockActivateTodo,
    isPending: false,
  }),
  useDeleteTodo: () => ({
    mutateAsync: mockDeleteTodo,
    isPending: false,
  }),
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

const mockTodo: Todo = {
  id: "1",
  text: "Test pending todo",
  type: "one-time",
  state: "pending",
  dueAt: "2024-12-31T23:59:59.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("PendingTodoItem", () => {
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render todo text", () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Test pending todo")).toBeInTheDocument();
  });

  it("should render task type", () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("one-time")).toBeInTheDocument();
  });

  it("should render due date", () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Due:")).toBeInTheDocument();
  });

  it("should render created date", () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Created/)).toBeInTheDocument();
  });

  it("should render activate button", () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Activate")).toBeInTheDocument();
  });

  it("should render delete button", () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should call activateTodo when activate button is clicked", async () => {
    mockActivateTodo.mockResolvedValue({});

    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const activateButton = screen.getByText("Activate");
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(mockActivateTodo).toHaveBeenCalledWith("1");
    });
  });

  it("should call deleteTodo when delete button is clicked", async () => {
    mockDeleteTodo.mockResolvedValue({});

    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledWith("1");
    });
  });

  it("should call onError when activation fails", async () => {
    const error = new Error("Activation failed");
    mockActivateTodo.mockRejectedValue(error);

    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const activateButton = screen.getByText("Activate");
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it("should call onError when deletion fails", async () => {
    const error = new Error("Deletion failed");
    mockDeleteTodo.mockRejectedValue(error);

    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it("should show re-activation status for reactivated todos", () => {
    const reactivatedTodo: Todo = {
      ...mockTodo,
      isReactivation: true,
    };

    render(<PendingTodoItem todo={reactivatedTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Re-activated")).toBeInTheDocument();
  });

  it("should handle mobile layout", () => {
    render(
      <PendingTodoItem todo={mockTodo} onError={mockOnError} isMobile={true} />,
      { wrapper: createWrapper() }
    );

    const buttonContainer = screen.getByText("Activate").closest("div");
    expect(buttonContainer).toHaveClass("flex-row", "space-x-2");
  });

  it("should handle desktop layout", () => {
    render(
      <PendingTodoItem
        todo={mockTodo}
        onError={mockOnError}
        isMobile={false}
      />,
      { wrapper: createWrapper() }
    );

    const buttonContainer = screen.getByText("Activate").closest("div");
    expect(buttonContainer).toHaveClass("flex-col", "space-y-2");
  });
});
