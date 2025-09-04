import React, { useState, useMemo, useCallback } from "react";
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useToggleTodo,
  useDeleteTodo,
  useDeleteCompletedTodos,
} from "../hooks/useTodos";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { validateTodoText } from "../utils";
import type { Todo as TodoType } from "../services/api";
import type { AppError } from "../utils/errorUtils";
import { TodoItem } from "./TodoItem";
import { CompletedTodoItem } from "./CompletedTodoItem";
import { TodoInput } from "./TodoInput";
import { ErrorDisplay } from "./ErrorDisplay";

const Todo: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [itemErrors, setItemErrors] = useState<Record<string, AppError>>({});

  // React Query hooks
  const { data: allTodos = [], isLoading, error } = useTodos();

  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const deleteCompletedTodos = useDeleteCompletedTodos();

  // Error handling
  const { handleError, currentError, clearError, retryOperation } =
    useErrorHandler({
      onError: (error) => {
        console.error("Todo operation failed:", error);
      },
    });

  // Helper functions for item-specific error handling
  const setItemError = useCallback((todoId: string, error: AppError | null) => {
    setItemErrors((prev) => {
      if (error) {
        return { ...prev, [todoId]: error };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [todoId]: _, ...rest } = prev;
        return rest;
      }
    });
  }, []);

  const clearItemError = useCallback(
    (todoId: string) => {
      setItemError(todoId, null);
    },
    [setItemError]
  );

  // Memoized computed values for better performance
  const { activeTodos, completedTodos } = useMemo(() => {
    const active = allTodos.filter((todo) => !todo.completed);
    const completed = allTodos.filter((todo) => todo.completed);
    return { activeTodos: active, completedTodos: completed };
  }, [allTodos]);

  // Add new todo
  const handleAddTodo = useCallback(async () => {
    const validation = validateTodoText(inputValue);
    if (!validation.isValid) {
      handleError(new Error(validation.error));
      return;
    }

    try {
      await createTodo.mutateAsync({ text: inputValue.trim() });
      setInputValue("");
    } catch (error) {
      handleError(error);
    }
  }, [inputValue, createTodo, handleError]);

  // Edit todo
  const handleEditTodo = useCallback((todo: TodoType) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  }, []);

  // Save edit
  const handleSaveEdit = useCallback(
    async (id: string) => {
      const validation = validateTodoText(editValue);
      if (!validation.isValid) {
        handleError(new Error(validation.error));
        return;
      }

      try {
        await updateTodo.mutateAsync({
          id,
          updates: { text: editValue.trim() },
        });
        setEditingId(null);
        setEditValue("");
      } catch (error) {
        handleError(error);
      }
    },
    [editValue, updateTodo, handleError]
  );

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  // Complete todo
  const handleToggleTodo = useCallback(
    async (id: string) => {
      clearItemError(id);
      try {
        await toggleTodo.mutateAsync(id);
      } catch (error) {
        const appError = handleError(error);
        setItemError(id, appError);
      }
    },
    [toggleTodo, handleError, clearItemError, setItemError]
  );

  // Delete todo
  const handleDeleteTodo = useCallback(
    async (id: string) => {
      clearItemError(id);
      try {
        await deleteTodo.mutateAsync(id);
      } catch (error) {
        const appError = handleError(error);
        setItemError(id, appError);
      }
    },
    [deleteTodo, handleError, clearItemError, setItemError]
  );

  // Remove completed todos
  const handleRemoveCompleted = useCallback(async () => {
    try {
      await deleteCompletedTodos.mutateAsync();
    } catch (error) {
      handleError(error);
    }
  }, [deleteCompletedTodos, handleError]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleAddTodo();
      }
    },
    [handleAddTodo]
  );

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleEditValueChange = useCallback((value: string) => {
    setEditValue(value);
  }, []);

  // Retry handlers for item-specific operations
  const handleRetryToggle = useCallback(
    (id: string) => {
      retryOperation(() => handleToggleTodo(id));
    },
    [retryOperation, handleToggleTodo]
  );

  const handleRetryDelete = useCallback(
    (id: string) => {
      retryOperation(() => handleDeleteTodo(id));
    },
    [retryOperation, handleDeleteTodo]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading todos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Error Loading Todos
          </h2>
          <p className="text-slate-600 text-lg mb-4">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-2xl animate-float">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-3 tracking-tight">
            Tasks
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl font-medium">
            Organize your day with elegance
          </p>
        </div>

        {/* Global Error Display */}
        <ErrorDisplay
          error={currentError}
          onRetry={() => retryOperation(() => window.location.reload())}
          onDismiss={clearError}
          className="mb-6"
        />

        {/* Add Todo Section */}
        <div className="glass rounded-3xl shadow-2xl p-6 mb-8 animate-slide-up">
          <TodoInput
            value={inputValue}
            onChange={handleInputChange}
            onAdd={handleAddTodo}
            onKeyPress={handleKeyPress}
            isLoading={createTodo.isPending}
          />
        </div>

        {/* Actions */}
        {completedTodos.length > 0 && (
          <div className="flex justify-center mb-8 animate-fade-in">
            <button
              onClick={handleRemoveCompleted}
              disabled={deleteCompletedTodos.isPending}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteCompletedTodos.isPending
                ? "Clearing..."
                : `Clear Completed (${completedTodos.length})`}
            </button>
          </div>
        )}

        {/* Active Todos */}
        {activeTodos.length > 0 && (
          <div className="glass rounded-3xl shadow-2xl p-6 mb-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Active Tasks ({activeTodos.length})
            </h2>
            <div className="space-y-4">
              {activeTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="group bg-white/60 rounded-2xl p-5 hover:bg-white/80 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-white/40"
                >
                  <TodoItem
                    todo={todo}
                    isEditing={editingId === todo.id}
                    editValue={editValue}
                    onEdit={handleEditTodo}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    onToggle={handleToggleTodo}
                    onDelete={handleDeleteTodo}
                    onEditValueChange={handleEditValueChange}
                    isPending={{
                      update: updateTodo.isPending,
                      toggle: toggleTodo.isPending,
                      delete: deleteTodo.isPending,
                    }}
                    error={itemErrors[todo.id]}
                    onRetry={() => handleRetryToggle(todo.id)}
                    onDismissError={() => clearItemError(todo.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <div className="glass rounded-3xl shadow-2xl p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              Completed Tasks ({completedTodos.length})
            </h2>
            <div className="space-y-4">
              {completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/50"
                >
                  <CompletedTodoItem
                    todo={todo}
                    onToggle={handleToggleTodo}
                    onDelete={handleDeleteTodo}
                    isPending={{
                      toggle: toggleTodo.isPending,
                      delete: deleteTodo.isPending,
                    }}
                    error={itemErrors[todo.id]}
                    onRetry={() => handleRetryDelete(todo.id)}
                    onDismissError={() => clearItemError(todo.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allTodos.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="glass rounded-3xl shadow-2xl p-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
                <svg
                  className="w-12 h-12 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                No tasks yet
              </h3>
              <p className="text-slate-600 text-lg">
                Start by adding your first task above.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Todo;
