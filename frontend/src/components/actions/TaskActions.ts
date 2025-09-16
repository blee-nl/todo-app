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
import { TaskState, isOneTimeTask } from "../../constants/taskConstants";

// TaskList Bulk Actions
export const useTaskListBulkActions = (taskState: typeof TaskState.COMPLETED | typeof TaskState.FAILED, onError?: (error: Error) => void) => {
  const deleteCompletedTasksMutation = useDeleteCompletedTodos();
  const deleteFailedTasksMutation = useDeleteFailedTodos();

  const deleteAllTasksInCurrentState = async () => {
    try {
      if (taskState === TaskState.COMPLETED) {
        await deleteCompletedTasksMutation.mutateAsync();
      } else if (taskState === TaskState.FAILED) {
        await deleteFailedTasksMutation.mutateAsync();
      }
    } catch (error) {
      console.error(`Failed to delete all ${taskState} tasks:`, error);
      onError?.(error as Error);
    }
  };

  return {
    deleteAllTasksInCurrentState,
    isDeletingAllTasks: (taskState === TaskState.COMPLETED && deleteCompletedTasksMutation.isPending) ||
                        (taskState === TaskState.FAILED && deleteFailedTasksMutation.isPending),
  };
};

// Pending Task Actions
export const usePendingTaskActions = (task: Todo, onError?: (error: Error) => void) => {
  const activateTaskMutation = useActivateTodo();
  const deleteTaskMutation = useDeleteTodo();
  const updateTaskMutation = useUpdateTodo();

  const activateTask = async () => {
    try {
      await activateTaskMutation.mutateAsync(task.id);
    } catch (error) {
      console.error("Failed to activate task:", error);
      onError?.(error as Error);
    }
  };

  const deleteTask = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      onError?.(error as Error);
    }
  };

  const saveTaskEdits = async (editText: string, editDueAt: string, setIsEditing: (editing: boolean) => void) => {
    if (!editText.trim()) return;

    try {
      const updateData: { text: string; dueAt?: string } = { text: editText.trim() };
      if (isOneTimeTask(task.type) && editDueAt) {
        updateData.dueAt = editDueAt;
      }

      await updateTaskMutation.mutateAsync({
        id: task.id,
        updates: updateData,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
      onError?.(error as Error);
    }
  };

  const cancelTaskEdits = (setEditText: (text: string) => void, setEditDueAt: (dueAt: string) => void, setIsEditing: (editing: boolean) => void) => {
    setEditText(task.text);
    setEditDueAt(task.dueAt || "");
    setIsEditing(false);
  };

  const handleTaskEditKeyDown = (e: React.KeyboardEvent, handleSave: () => void, handleCancel: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return {
    activateTask,
    deleteTask,
    saveTaskEdits,
    cancelTaskEdits,
    handleTaskEditKeyDown,
    activateTaskMutation,
    deleteTaskMutation,
    updateTaskMutation,
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
          ...(isOneTimeTask(todo.type) && editDueAt && { dueAt: editDueAt }),
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

  const handleReactivate = async (newDueDateTime: string, setIsReactivateFormVisible: (show: boolean) => void, setNewDueDateTime: (dueAt: string) => void) => {
    try {
      const request = isOneTimeTask(todo.type) && newDueDateTime ? { newDueAt: newDueDateTime } : undefined;
      await reactivateTodo.mutateAsync({ id: todo.id, request });
      setIsReactivateFormVisible(false);
      setNewDueDateTime("");
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

  const handleCancelReactivate = (setIsReactivateFormVisible: (show: boolean) => void, setNewDueDateTime: (dueAt: string) => void) => {
    setIsReactivateFormVisible(false);
    setNewDueDateTime("");
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

  const handleReactivate = async (newDueDateTime: string, setIsReactivateFormVisible: (show: boolean) => void, setNewDueDateTime: (dueAt: string) => void) => {
    try {
      const request = isOneTimeTask(todo.type) && newDueDateTime ? { newDueAt: newDueDateTime } : undefined;
      await reactivateTodo.mutateAsync({ id: todo.id, request });
      setIsReactivateFormVisible(false);
      setNewDueDateTime("");
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

  const handleCancelReactivate = (setIsReactivateFormVisible: (show: boolean) => void, setNewDueDateTime: (dueAt: string) => void) => {
    setIsReactivateFormVisible(false);
    setNewDueDateTime("");
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
