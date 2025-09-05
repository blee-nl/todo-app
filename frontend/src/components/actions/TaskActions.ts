import type { Todo, CreateTodoRequest } from "../../services/api";
import {
  useActivateTodo,
  useDeleteTodo,
  useUpdateTodo,
  useCompleteTodo,
  useFailTodo,
  useReactivateTodo,
  useDeleteCompletedTodos,
  useDeleteFailedTodos,
  useCreateTodo,
} from "../../hooks/useTodos";

// TaskList Actions
export const useTaskListActions = (state: "completed" | "failed", onError?: (error: Error) => void) => {
  const deleteCompletedTodos = useDeleteCompletedTodos();
  const deleteFailedTodos = useDeleteFailedTodos();

  const handleDeleteAll = async () => {
    try {
      if (state === "completed") {
        await deleteCompletedTodos.mutateAsync();
      } else if (state === "failed") {
        await deleteFailedTodos.mutateAsync();
      }
    } catch (error) {
      console.error(`Failed to delete all ${state} todos:`, error);
      onError?.(error as Error);
    }
  };

  return {
    handleDeleteAll,
    isDeleteAllLoading: (state === "completed" && deleteCompletedTodos.isPending) ||
                       (state === "failed" && deleteFailedTodos.isPending),
  };
};

// PendingTodoItem Actions
export const usePendingTodoActions = (todo: Todo, onError?: (error: Error) => void) => {
  const activateTodo = useActivateTodo();
  const deleteTodo = useDeleteTodo();
  const updateTodo = useUpdateTodo();

  const handleActivate = async () => {
    try {
      await activateTodo.mutateAsync(todo.id);
    } catch (error) {
      console.error("Failed to activate todo:", error);
      onError?.(error as Error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo.mutateAsync(todo.id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
      onError?.(error as Error);
    }
  };

  const handleSave = async (editText: string, editDueAt: string, setIsEditing: (editing: boolean) => void) => {
    if (!editText.trim()) return;

    try {
      const updateData: { text: string; dueAt?: string } = { text: editText.trim() };
      if (todo.type === "one-time" && editDueAt) {
        updateData.dueAt = editDueAt;
      }

      await updateTodo.mutateAsync({
        id: todo.id,
        updates: updateData,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
      onError?.(error as Error);
    }
  };

  const handleCancel = (setEditText: (text: string) => void, setEditDueAt: (dueAt: string) => void, setIsEditing: (editing: boolean) => void) => {
    setEditText(todo.text);
    setEditDueAt(todo.dueAt || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, handleSave: () => void, handleCancel: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return {
    handleActivate,
    handleDelete,
    handleSave,
    handleCancel,
    handleKeyDown,
    activateTodo,
    deleteTodo,
    updateTodo,
  };
};

// ActiveTodoItem Actions
export const useActiveTodoActions = (todo: Todo, onError?: (error: Error) => void) => {
  const updateTodo = useUpdateTodo();
  const completeTodo = useCompleteTodo();
  const failTodo = useFailTodo();
  const deleteTodo = useDeleteTodo();

  const handleSave = async (editText: string, editDueAt: string, setIsEditing: (editing: boolean) => void) => {
    if (editText.trim() === todo.text && editDueAt === (todo.dueAt || "")) {
      setIsEditing(false);
      return;
    }

    try {
      await updateTodo.mutateAsync({
        id: todo.id,
        updates: {
          text: editText.trim(),
          ...(todo.type === "one-time" && editDueAt && { dueAt: editDueAt }),
        },
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
      onError?.(error as Error);
    }
  };

  const handleCancel = (setEditText: (text: string) => void, setEditDueAt: (dueAt: string) => void, setIsEditing: (editing: boolean) => void) => {
    setEditText(todo.text);
    setEditDueAt(todo.dueAt || "");
    setIsEditing(false);
  };

  const handleComplete = async () => {
    try {
      await completeTodo.mutateAsync(todo.id);
    } catch (error) {
      console.error("Failed to complete todo:", error);
      onError?.(error as Error);
    }
  };

  const handleFail = async () => {
    try {
      await failTodo.mutateAsync(todo.id);
    } catch (error) {
      console.error("Failed to fail todo:", error);
      onError?.(error as Error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo.mutateAsync(todo.id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
      onError?.(error as Error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, handleSave: () => void, handleCancel: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return {
    handleSave,
    handleCancel,
    handleComplete,
    handleFail,
    handleDelete,
    handleKeyDown,
    updateTodo,
    completeTodo,
    failTodo,
    deleteTodo,
  };
};

// CompletedTodoItem Actions
export const useCompletedTodoActions = (todo: Todo, onError?: (error: Error) => void) => {
  const reactivateTodo = useReactivateTodo();
  const deleteTodo = useDeleteTodo();

  const handleReactivate = async (newDueAt: string, setShowReactivateForm: (show: boolean) => void, setNewDueAt: (dueAt: string) => void) => {
    try {
      const request = todo.type === "one-time" && newDueAt ? { newDueAt } : undefined;
      await reactivateTodo.mutateAsync({ id: todo.id, request });
      setShowReactivateForm(false);
      setNewDueAt("");
    } catch (error) {
      console.error("Failed to reactivate todo:", error);
      onError?.(error as Error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo.mutateAsync(todo.id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
      onError?.(error as Error);
    }
  };

  const handleCancelReactivate = (setShowReactivateForm: (show: boolean) => void, setNewDueAt: (dueAt: string) => void) => {
    setShowReactivateForm(false);
    setNewDueAt("");
  };

  return {
    handleReactivate,
    handleDelete,
    handleCancelReactivate,
    reactivateTodo,
    deleteTodo,
  };
};

// FailedTodoItem Actions
export const useFailedTodoActions = (todo: Todo, onError?: (error: Error) => void) => {
  const reactivateTodo = useReactivateTodo();
  const deleteTodo = useDeleteTodo();

  const handleReactivate = async (newDueAt: string, setShowReactivateForm: (show: boolean) => void, setNewDueAt: (dueAt: string) => void) => {
    try {
      const request = todo.type === "one-time" && newDueAt ? { newDueAt } : undefined;
      await reactivateTodo.mutateAsync({ id: todo.id, request });
      setShowReactivateForm(false);
      setNewDueAt("");
    } catch (error) {
      console.error("Failed to reactivate todo:", error);
      onError?.(error as Error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo.mutateAsync(todo.id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
      onError?.(error as Error);
    }
  };

  const handleCancelReactivate = (setShowReactivateForm: (show: boolean) => void, setNewDueAt: (dueAt: string) => void) => {
    setShowReactivateForm(false);
    setNewDueAt("");
  };

  return {
    handleReactivate,
    handleDelete,
    handleCancelReactivate,
    reactivateTodo,
    deleteTodo,
  };
};

// TaskModal Actions
export const useTaskModalActions = (onError?: (error: Error) => void) => {
  const createTodo = useCreateTodo();

  const handleCreate = async (todoData: CreateTodoRequest) => {
    try {
      await createTodo.mutateAsync(todoData);
    } catch (error) {
      console.error("Failed to create todo:", error);
      onError?.(error as Error);
      throw error; // Re-throw to allow component to handle loading state
    }
  };

  return {
    handleCreate,
    isCreating: createTodo.isPending,
    createTodo,
  };
};
