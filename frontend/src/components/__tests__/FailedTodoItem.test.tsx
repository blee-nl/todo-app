import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FailedTodoItem from "../FailedTodoItem";
import type { Todo } from "../../services/api";

// Mock the hooks
const mockReactivateTodo = vi.fn();
const mockDeleteTodo = vi.fn();

vi.mock("../../hooks/useTodos", () => ({
  useReactivateTodo: () => ({
    mutateAsync: mockReactivateTodo,
    isPending: false,
  }),
  useDeleteTodo: () => ({
    mutateAsync: mockDeleteTodo,
    isPending: false,
  }),
}));

// Mock CustomDateTimePicker
vi.mock("../CustomDateTimePicker", () => ({
  default: ({ value, onChange, placeholder, id }: any) => (
    <input
      id={id}
      data-testid="custom-datetime-picker"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
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

const mockTodo: Todo = {
  id: "1",
  text: "Test failed todo",
  type: "one-time",
  state: "failed",
  dueAt: "2024-12-31T23:59:59.000Z",
  activatedAt: "2024-01-01T00:00:00.000Z",
  failedAt: "2024-01-02T00:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
};

describe("FailedTodoItem", () => {
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render todo text", () => {
    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Test failed todo")).toBeInTheDocument();
  });

  it("should render task type", () => {
    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("one-time")).toBeInTheDocument();
  });

  it("should render due date", () => {
    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Was due:")).toBeInTheDocument();
  });

  it("should render failed date", () => {
    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Failed/)).toBeInTheDocument();
  });

  it("should render reactivate button", () => {
    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Re-activate")).toBeInTheDocument();
  });

  it("should render delete button", () => {
    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should call reactivateTodo when reactivate button is clicked", async () => {
    mockReactivateTodo.mockResolvedValue({});

    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const reactivateButton = screen.getByText("Re-activate");
    fireEvent.click(reactivateButton);

    // For one-time tasks, we need to set a due date and click confirm
    const dueDateInput = screen.getByTestId("custom-datetime-picker");
    fireEvent.change(dueDateInput, { target: { value: "2025-12-31T23:59" } });

    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockReactivateTodo).toHaveBeenCalledWith({
        id: "1",
        request: { newDueAt: "2025-12-31T23:59" },
      });
    });
  });

  it("should call deleteTodo when delete button is clicked", async () => {
    mockDeleteTodo.mockResolvedValue({});

    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledWith("1");
    });
  });

  it("should call onError when reactivation fails", async () => {
    const error = new Error("Reactivation failed");
    mockReactivateTodo.mockRejectedValue(error);

    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const reactivateButton = screen.getByText("Re-activate");
    fireEvent.click(reactivateButton);

    // For one-time tasks, we need to set a due date and click confirm
    const dueDateInput = screen.getByTestId("custom-datetime-picker");
    fireEvent.change(dueDateInput, { target: { value: "2025-12-31T23:59" } });

    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it("should call onError when deletion fails", async () => {
    const error = new Error("Deletion failed");
    mockDeleteTodo.mockRejectedValue(error);

    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
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

    render(<FailedTodoItem todo={reactivatedTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Re-activated")).toBeInTheDocument();
  });

  it("should handle mobile layout", () => {
    render(<FailedTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const buttonContainer = screen.getByText("Re-activate").closest("div");
    expect(buttonContainer).toHaveClass(
      "flex",
      "flex-col",
      "space-y-2",
      "ml-4"
    );
  });
});
