import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ActiveTodoItem from "../ActiveTodoItem";
import type { Todo } from "../../services/api";

// Mock the TaskActions
const mockHandleCancel = vi.fn();
const mockHandleKeyDown = vi.fn();
const mockUpdateTodo = vi.fn();
const mockCompleteTodo = vi.fn();
const mockFailTodo = vi.fn();
const mockDeleteTodo = vi.fn();

vi.mock("../actions/TaskActions", () => ({
  useActiveTodoActions: (_todo: Todo, onError?: (error: Error) => void) => ({
    handleSave: async (
      _editText: string,
      _editDueAt: string,
      _setIsEditing: (editing: boolean) => void
    ) => {
      void _editText;
      void _editDueAt;
      void _setIsEditing;
      try {
        await mockUpdateTodo();
      } catch (error) {
        onError?.(error as Error);
      }
    },
    handleCancel: mockHandleCancel,
    handleComplete: async () => {
      try {
        await mockCompleteTodo();
      } catch (error) {
        onError?.(error as Error);
      }
    },
    handleFail: async () => {
      try {
        await mockFailTodo();
      } catch (error) {
        onError?.(error as Error);
      }
    },
    handleDelete: async () => {
      try {
        await mockDeleteTodo();
      } catch (error) {
        onError?.(error as Error);
      }
    },
    handleKeyDown: mockHandleKeyDown,
    updateTodo: { mutateAsync: mockUpdateTodo, isPending: false },
    completeTodo: { mutateAsync: mockCompleteTodo, isPending: false },
    failTodo: { mutateAsync: mockFailTodo, isPending: false },
    deleteTodo: { mutateAsync: mockDeleteTodo, isPending: false },
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
  text: "Test active todo",
  type: "one-time",
  state: "active",
  dueAt: "2024-12-31T23:59:59.000Z",
  activatedAt: "2024-01-01T00:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("ActiveTodoItem", () => {
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render todo text", () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Test active todo")).toBeInTheDocument();
  });

  it("should render task type", () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("one-time")).toBeInTheDocument();
  });

  it("should render due date", () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Due:")).toBeInTheDocument();
  });

  it("should render activated date", () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Activated/)).toBeInTheDocument();
  });

  it("should render complete button", () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("should render fail button", () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Fail")).toBeInTheDocument();
  });

  it("should render delete button", () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should call completeTodo when complete button is clicked", async () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const completeButton = screen.getByText("Complete");
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockCompleteTodo).toHaveBeenCalledTimes(1);
    });
  });

  it("should call failTodo when fail button is clicked", async () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const failButton = screen.getByText("Fail");
    fireEvent.click(failButton);

    await waitFor(() => {
      expect(mockFailTodo).toHaveBeenCalledTimes(1);
    });
  });

  it("should call deleteTodo when delete button is clicked", async () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onError when completion fails", async () => {
    const error = new Error("Completion failed");
    mockCompleteTodo.mockRejectedValue(error);

    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const completeButton = screen.getByText("Complete");
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockCompleteTodo).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it("should call onError when failure fails", async () => {
    const error = new Error("Failure failed");
    mockFailTodo.mockRejectedValue(error);

    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const failButton = screen.getByText("Fail");
    fireEvent.click(failButton);

    await waitFor(() => {
      expect(mockFailTodo).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it("should call onError when deletion fails", async () => {
    const error = new Error("Deletion failed");
    mockDeleteTodo.mockRejectedValue(error);

    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it("should show overdue status for overdue todos", () => {
    const overdueTodo: Todo = {
      ...mockTodo,
      dueAt: "2020-01-01T00:00:00.000Z", // Past date
    };

    render(<ActiveTodoItem todo={overdueTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("should handle mobile layout", () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const buttonContainer = screen.getByText("Complete").closest("div");
    expect(buttonContainer).toHaveClass(
      "flex",
      "flex-col",
      "space-y-2",
      "ml-4"
    );
  });

  it("should handle desktop layout", () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const buttonContainer = screen.getByText("Complete").closest("div");
    expect(buttonContainer).toHaveClass("flex-col", "space-y-2");
  });

  it("should save changes with date when save button is clicked", async () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    // Enter edit mode
    const textElement = screen.getByText("Test active todo");
    fireEvent.click(textElement);

    // Change text
    const input = screen.getByDisplayValue("Test active todo");
    fireEvent.change(input, { target: { value: "Updated text" } });

    // Save
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    });
  });

  it("should show date picker in edit mode for one-time tasks", () => {
    render(<ActiveTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    // Enter edit mode
    const textElement = screen.getByText("Test active todo");
    fireEvent.click(textElement);

    // Should show date picker
    expect(screen.getByTestId("custom-datetime-picker")).toBeInTheDocument();
  });

  it("should not show date picker in edit mode for daily tasks", () => {
    const dailyTodo: Todo = {
      ...mockTodo,
      type: "daily",
      dueAt: undefined,
    };

    render(<ActiveTodoItem todo={dailyTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    // Enter edit mode
    const textElement = screen.getByText("Test active todo");
    fireEvent.click(textElement);

    // Should not show date picker for daily tasks
    expect(
      screen.queryByTestId("custom-datetime-picker")
    ).not.toBeInTheDocument();
  });
});
