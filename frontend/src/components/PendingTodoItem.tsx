import React from "react";
import type { Todo } from "../services/api";
import { useActivateTodo, useDeleteTodo } from "../hooks/useTodos";
import { formatDate, formatFullDate } from "../utils/dateUtils";

interface PendingTodoItemProps {
  todo: Todo;
  onError?: (error: Error) => void;
  isMobile?: boolean;
}

const PendingTodoItem: React.FC<PendingTodoItemProps> = ({
  todo,
  onError,
  isMobile = false,
}) => {
  const activateTodo = useActivateTodo();
  const deleteTodo = useDeleteTodo();

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

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {todo.type}
            </span>
            {todo.isReactivation && (
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Re-activated
              </span>
            )}
          </div>

          <p className="text-gray-900 font-medium mb-3 leading-relaxed">
            {todo.text}
          </p>

          {todo.dueAt && (
            <div className="text-sm text-gray-600 mb-3 flex items-center">
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

          <div className="text-xs text-gray-500 flex items-center">
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
        </div>

        <div
          className={`flex ${
            isMobile ? "flex-row space-x-2" : "flex-col space-y-2"
          } ml-4`}
        >
          <button
            onClick={handleActivate}
            disabled={activateTodo.isPending}
            className="px-3 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 disabled:bg-gray-300 transition-colors duration-200 font-medium"
          >
            {activateTodo.isPending ? "Activating..." : "Activate"}
          </button>

          <button
            onClick={handleDelete}
            disabled={deleteTodo.isPending}
            className="px-3 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 disabled:bg-gray-300 transition-colors duration-200 font-medium"
          >
            {deleteTodo.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingTodoItem;
