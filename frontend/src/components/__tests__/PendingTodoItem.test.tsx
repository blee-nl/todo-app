import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PendingTodoItem from "../PendingTodoItem";
import type { Todo } from "../../services/api";

// Mock the TaskActions
const mockHandleCancel = vi.fn();
const mockHandleKeyDown = vi.fn();
const mockActivateTodo = vi.fn();
const mockDeleteTodo = vi.fn();
const mockUpdateTodo = vi.fn();

vi.mock("../actions/TaskActions", () => ({
  usePendingTodoActions: (_todo: Todo, onError?: (error: Error) => void) => ({
    handleActivate: async () => {
      try {
        await mockActivateTodo();
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
    handleKeyDown: mockHandleKeyDown,
    activateTodo: { mutateAsync: mockActivateTodo, isPending: false },
    deleteTodo: { mutateAsync: mockDeleteTodo, isPending: false },
    updateTodo: { mutateAsync: mockUpdateTodo, isPending: false },
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
    mockActivateTodo.mockResolvedValue({ id: "1" });
    mockDeleteTodo.mockResolvedValue({ id: "1" });
    mockUpdateTodo.mockResolvedValue({ id: "1" });
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
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const activateButton = screen.getByText("Activate");
    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(mockActivateTodo).toHaveBeenCalledTimes(1);
    });
  });

  it("should call deleteTodo when delete button is clicked", async () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledTimes(1);
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
      expect(mockActivateTodo).toHaveBeenCalledTimes(1);
    });

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
      expect(mockDeleteTodo).toHaveBeenCalledTimes(1);
    });

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
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const buttonContainer = screen.getByText("Activate").closest("div");
    expect(buttonContainer).toHaveClass(
      "flex",
      "flex-col",
      "space-y-2",
      "ml-4"
    );
  });

  it("should handle desktop layout", () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const buttonContainer = screen.getByText("Activate").closest("div");
    expect(buttonContainer).toHaveClass("flex-col", "space-y-2");
  });

  it("should enter edit mode when text is clicked", () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const textElement = screen.getByText("Test pending todo");
    fireEvent.click(textElement);

    expect(screen.getByDisplayValue("Test pending todo")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should save changes when save button is clicked", async () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    // Enter edit mode
    const textElement = screen.getByText("Test pending todo");
    fireEvent.click(textElement);

    // Change text
    const input = screen.getByDisplayValue("Test pending todo");
    fireEvent.change(input, { target: { value: "Updated text" } });

    // Save
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    });
  });

  it("should cancel changes when cancel button is clicked", async () => {
    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    // Enter edit mode
    const textElement = screen.getByText("Test pending todo");
    fireEvent.click(textElement);

    // Change text
    const input = screen.getByDisplayValue("Test pending todo");
    fireEvent.change(input, { target: { value: "Updated text" } });

    // Cancel
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockHandleCancel).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onError when update fails", async () => {
    const error = new Error("Update failed");
    mockUpdateTodo.mockRejectedValue(error);

    render(<PendingTodoItem todo={mockTodo} onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    // Enter edit mode
    const textElement = screen.getByText("Test pending todo");
    fireEvent.click(textElement);

    // Change text
    const input = screen.getByDisplayValue("Test pending todo");
    fireEvent.change(input, { target: { value: "Updated text" } });

    // Save
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });
});
