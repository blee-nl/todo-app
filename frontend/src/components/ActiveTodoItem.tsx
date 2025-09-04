import React, { useState, useCallback } from "react";
import type { Todo } from "../services/api";
import {
  useUpdateTodo,
  useCompleteTodo,
  useFailTodo,
  useDeleteTodo,
} from "../hooks/useTodos";
import { formatDate, formatFullDate } from "../utils/dateUtils";

interface ActiveTodoItemProps {
  todo: Todo;
  onError?: (error: Error) => void;
  isMobile?: boolean;
}

const ActiveTodoItem: React.FC<ActiveTodoItemProps> = ({
  todo,
  onError,
  isMobile = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const updateTodo = useUpdateTodo();
  const completeTodo = useCompleteTodo();
  const failTodo = useFailTodo();
  const deleteTodo = useDeleteTodo();

  const handleSave = useCallback(async () => {
    if (editText.trim() === todo.text) {
      setIsEditing(false);
      return;
    }

    try {
      await updateTodo.mutateAsync({
        id: todo.id,
        updates: { text: editText.trim() },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
      onError?.(error as Error);
    }
  }, [todo.id, todo.text, editText, updateTodo, onError]);

  const handleCancel = useCallback(() => {
    setEditText(todo.text);
    setIsEditing(false);
  }, [todo.text]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

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
      console.error("Failed to mark todo as failed:", error);
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

  const isOverdue = todo.dueAt && new Date(todo.dueAt) < new Date();

  return (
    <div
      className={`bg-white border rounded-2xl p-4 hover:shadow-md transition-all duration-200 ${
        isOverdue ? "border-red-200" : "border-green-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {todo.type}
            </span>
            {todo.isReactivation && (
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Re-activated
              </span>
            )}
            {isOverdue && (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                Overdue
              </span>
            )}
          </div>

          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoFocus
              maxLength={500}
            />
          ) : (
            <p
              className="text-gray-900 font-medium mb-3 leading-relaxed cursor-pointer hover:text-green-600 transition-colors duration-200"
              onClick={() => setIsEditing(true)}
            >
              {todo.text}
            </p>
          )}

          {todo.dueAt && (
            <div
              className={`text-sm mb-3 flex items-center ${
                isOverdue ? "text-red-600" : "text-gray-600"
              }`}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">Due:</span>{" "}
              <span className="ml-1">{formatFullDate(todo.dueAt)}</span>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Created {formatDate(todo.createdAt)}
            </div>
            {todo.activatedAt && (
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Activated {formatDate(todo.activatedAt)}
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <div
            className={`flex ${
              isMobile ? "flex-row space-x-2" : "flex-col space-y-2"
            } ml-4`}
          >
            <button
              onClick={handleComplete}
              disabled={completeTodo.isPending}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 disabled:bg-gray-300 transition-colors duration-200 font-medium"
            >
              {completeTodo.isPending ? "Completing..." : "Complete"}
            </button>

            <button
              onClick={handleFail}
              disabled={failTodo.isPending}
              className="px-3 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 disabled:bg-gray-300 transition-colors duration-200 font-medium"
            >
              {failTodo.isPending ? "Failing..." : "Fail"}
            </button>

            <button
              onClick={handleDelete}
              disabled={deleteTodo.isPending}
              className="px-3 py-2 bg-gray-500 text-white text-sm rounded-xl hover:bg-gray-600 disabled:bg-gray-300 transition-colors duration-200 font-medium"
            >
              {deleteTodo.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveTodoItem;
