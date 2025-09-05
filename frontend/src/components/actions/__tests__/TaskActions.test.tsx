import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Todo } from "../../../services/api";
import {
  useTaskListActions,
  usePendingTodoActions,
  useActiveTodoActions,
  useCompletedTodoActions,
  useFailedTodoActions,
} from "../TaskActions";

// Mock the hooks
vi.mock("../../../hooks/useTodos", () => ({
  useActivateTodo: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteTodo: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateTodo: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useCompleteTodo: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useFailTodo: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useReactivateTodo: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteCompletedTodos: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteFailedTodos: () => ({
    mutateAsync: vi.fn(),
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
  text: "Test todo",
  type: "one-time",
  state: "pending",
  dueAt: "2024-01-01T10:00:00.000Z",
  createdAt: "2024-01-01T09:00:00.000Z",
  activatedAt: undefined,
  completedAt: undefined,
  failedAt: undefined,
  updatedAt: "2024-01-01T09:00:00.000Z",
  isReactivation: false,
};

describe("TaskActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useTaskListActions", () => {
    it("should return handleDeleteAll function and loading state for completed tasks", () => {
      const mockOnError = vi.fn();
      const { result } = renderHook(
        () => useTaskListActions("completed", mockOnError),
        { wrapper: createWrapper() }
      );

      expect(result.current.handleDeleteAll).toBeDefined();
      expect(result.current.isDeleteAllLoading).toBe(false);
    });

    it("should return handleDeleteAll function and loading state for failed tasks", () => {
      const mockOnError = vi.fn();
      const { result } = renderHook(
        () => useTaskListActions("failed", mockOnError),
        { wrapper: createWrapper() }
      );

      expect(result.current.handleDeleteAll).toBeDefined();
      expect(result.current.isDeleteAllLoading).toBe(false);
    });
  });

  describe("usePendingTodoActions", () => {
    it("should return all pending todo action functions", () => {
      const mockOnError = vi.fn();
      const { result } = renderHook(
        () => usePendingTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      expect(result.current.handleActivate).toBeDefined();
      expect(result.current.handleDelete).toBeDefined();
      expect(result.current.handleSave).toBeDefined();
      expect(result.current.handleCancel).toBeDefined();
      expect(result.current.handleKeyDown).toBeDefined();
      expect(result.current.activateTodo).toBeDefined();
      expect(result.current.deleteTodo).toBeDefined();
      expect(result.current.updateTodo).toBeDefined();
    });

    it("should handle save action with proper parameters", async () => {
      const mockOnError = vi.fn();
      const mockSetIsEditing = vi.fn();
      const { result } = renderHook(
        () => usePendingTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSave(
          "New text",
          "2024-01-02T10:00:00.000Z",
          mockSetIsEditing
        );
      });

      expect(mockSetIsEditing).toHaveBeenCalledWith(false);
    });

    it("should handle cancel action with proper parameters", () => {
      const mockOnError = vi.fn();
      const mockSetEditText = vi.fn();
      const mockSetEditDueAt = vi.fn();
      const mockSetIsEditing = vi.fn();
      const { result } = renderHook(
        () => usePendingTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.handleCancel(
          mockSetEditText,
          mockSetEditDueAt,
          mockSetIsEditing
        );
      });

      expect(mockSetEditText).toHaveBeenCalledWith(mockTodo.text);
      expect(mockSetEditDueAt).toHaveBeenCalledWith(mockTodo.dueAt || "");
      expect(mockSetIsEditing).toHaveBeenCalledWith(false);
    });

    it("should handle keyboard events correctly", () => {
      const mockOnError = vi.fn();
      const mockHandleSave = vi.fn();
      const mockHandleCancel = vi.fn();
      const { result } = renderHook(
        () => usePendingTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
      const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });

      act(() => {
        result.current.handleKeyDown(
          enterEvent as any,
          mockHandleSave,
          mockHandleCancel
        );
      });

      act(() => {
        result.current.handleKeyDown(
          escapeEvent as any,
          mockHandleSave,
          mockHandleCancel
        );
      });

      expect(mockHandleSave).toHaveBeenCalled();
      expect(mockHandleCancel).toHaveBeenCalled();
    });
  });

  describe("useActiveTodoActions", () => {
    it("should return all active todo action functions", () => {
      const mockOnError = vi.fn();
      const { result } = renderHook(
        () => useActiveTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      expect(result.current.handleSave).toBeDefined();
      expect(result.current.handleCancel).toBeDefined();
      expect(result.current.handleComplete).toBeDefined();
      expect(result.current.handleFail).toBeDefined();
      expect(result.current.handleDelete).toBeDefined();
      expect(result.current.handleKeyDown).toBeDefined();
      expect(result.current.updateTodo).toBeDefined();
      expect(result.current.completeTodo).toBeDefined();
      expect(result.current.failTodo).toBeDefined();
      expect(result.current.deleteTodo).toBeDefined();
    });

    it("should handle save action with proper parameters", async () => {
      const mockOnError = vi.fn();
      const mockSetIsEditing = vi.fn();
      const { result } = renderHook(
        () => useActiveTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleSave(
          "New text",
          "2024-01-02T10:00:00.000Z",
          mockSetIsEditing
        );
      });

      expect(mockSetIsEditing).toHaveBeenCalledWith(false);
    });

    it("should handle cancel action with proper parameters", () => {
      const mockOnError = vi.fn();
      const mockSetEditText = vi.fn();
      const mockSetEditDueAt = vi.fn();
      const mockSetIsEditing = vi.fn();
      const { result } = renderHook(
        () => useActiveTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.handleCancel(
          mockSetEditText,
          mockSetEditDueAt,
          mockSetIsEditing
        );
      });

      expect(mockSetEditText).toHaveBeenCalledWith(mockTodo.text);
      expect(mockSetEditDueAt).toHaveBeenCalledWith(mockTodo.dueAt || "");
      expect(mockSetIsEditing).toHaveBeenCalledWith(false);
    });
  });

  describe("useCompletedTodoActions", () => {
    it("should return all completed todo action functions", () => {
      const mockOnError = vi.fn();
      const { result } = renderHook(
        () => useCompletedTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      expect(result.current.handleReactivate).toBeDefined();
      expect(result.current.handleDelete).toBeDefined();
      expect(result.current.handleCancelReactivate).toBeDefined();
      expect(result.current.reactivateTodo).toBeDefined();
      expect(result.current.deleteTodo).toBeDefined();
    });

    it("should handle reactivate action with proper parameters", async () => {
      const mockOnError = vi.fn();
      const mockSetShowReactivateForm = vi.fn();
      const mockSetNewDueAt = vi.fn();
      const { result } = renderHook(
        () => useCompletedTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleReactivate(
          "2024-01-02T10:00:00.000Z",
          mockSetShowReactivateForm,
          mockSetNewDueAt
        );
      });

      expect(mockSetShowReactivateForm).toHaveBeenCalledWith(false);
      expect(mockSetNewDueAt).toHaveBeenCalledWith("");
    });

    it("should handle cancel reactivate action with proper parameters", () => {
      const mockOnError = vi.fn();
      const mockSetShowReactivateForm = vi.fn();
      const mockSetNewDueAt = vi.fn();
      const { result } = renderHook(
        () => useCompletedTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.handleCancelReactivate(
          mockSetShowReactivateForm,
          mockSetNewDueAt
        );
      });

      expect(mockSetShowReactivateForm).toHaveBeenCalledWith(false);
      expect(mockSetNewDueAt).toHaveBeenCalledWith("");
    });
  });

  describe("useFailedTodoActions", () => {
    it("should return all failed todo action functions", () => {
      const mockOnError = vi.fn();
      const { result } = renderHook(
        () => useFailedTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      expect(result.current.handleReactivate).toBeDefined();
      expect(result.current.handleDelete).toBeDefined();
      expect(result.current.handleCancelReactivate).toBeDefined();
      expect(result.current.reactivateTodo).toBeDefined();
      expect(result.current.deleteTodo).toBeDefined();
    });

    it("should handle reactivate action with proper parameters", async () => {
      const mockOnError = vi.fn();
      const mockSetShowReactivateForm = vi.fn();
      const mockSetNewDueAt = vi.fn();
      const { result } = renderHook(
        () => useFailedTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleReactivate(
          "2024-01-02T10:00:00.000Z",
          mockSetShowReactivateForm,
          mockSetNewDueAt
        );
      });

      expect(mockSetShowReactivateForm).toHaveBeenCalledWith(false);
      expect(mockSetNewDueAt).toHaveBeenCalledWith("");
    });

    it("should handle cancel reactivate action with proper parameters", () => {
      const mockOnError = vi.fn();
      const mockSetShowReactivateForm = vi.fn();
      const mockSetNewDueAt = vi.fn();
      const { result } = renderHook(
        () => useFailedTodoActions(mockTodo, mockOnError),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.handleCancelReactivate(
          mockSetShowReactivateForm,
          mockSetNewDueAt
        );
      });

      expect(mockSetShowReactivateForm).toHaveBeenCalledWith(false);
      expect(mockSetNewDueAt).toHaveBeenCalledWith("");
    });
  });
});
