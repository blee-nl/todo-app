import React, { useState } from "react";
import type { Todo } from "../services/api";
import { useReactivateTodo, useDeleteTodo } from "../hooks/useTodos";
import { formatDate, formatFullDate } from "../utils/dateUtils";
import CustomDateTimePicker from "./CustomDateTimePicker";

interface CompletedTodoItemProps {
  todo: Todo;
  onError?: (error: Error) => void;
}

const CompletedTodoItem: React.FC<CompletedTodoItemProps> = ({
  todo,
  onError,
}) => {
  const [showReactivateForm, setShowReactivateForm] = useState(false);
  const [newDueAt, setNewDueAt] = useState("");

  const reactivateTodo = useReactivateTodo();
  const deleteTodo = useDeleteTodo();

  const handleReactivate = async () => {
    try {
      const request =
        todo.type === "one-time" && newDueAt ? { newDueAt } : undefined;
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

  const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
              {todo.type}
            </span>
            {todo.isReactivation && (
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Re-activated
              </span>
            )}
          </div>

          <p className="text-gray-600 line-through mb-3 leading-relaxed">
            {todo.text}
          </p>

          {todo.dueAt && (
            <div className="text-sm text-gray-500 mb-3 flex items-center">
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
              <span className="font-medium">Was due:</span>{" "}
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
            {todo.completedAt && (
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Completed {formatDate(todo.completedAt)}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          {!showReactivateForm ? (
            <>
              <button
                onClick={() => setShowReactivateForm(true)}
                disabled={reactivateTodo.isPending}
                className="px-3 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 disabled:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Re-activate
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteTodo.isPending}
                className="px-3 py-2 bg-gray-500 text-white text-sm rounded-xl hover:bg-gray-600 disabled:bg-gray-300 transition-colors duration-200 font-medium"
              >
                {deleteTodo.isPending ? "Deleting..." : "Delete"}
              </button>
            </>
          ) : (
            <div className="space-y-2">
              {todo.type === "one-time" && (
                <div>
                  <CustomDateTimePicker
                    value={newDueAt}
                    onChange={setNewDueAt}
                    min={getMinDate()}
                    placeholder="Select new due date"
                  />
                </div>
              )}

              <div className="flex space-x-1">
                <button
                  onClick={handleReactivate}
                  disabled={
                    reactivateTodo.isPending ||
                    (todo.type === "one-time" && !newDueAt)
                  }
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded-xl hover:bg-blue-600 disabled:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  {reactivateTodo.isPending ? "Re-activating..." : "Confirm"}
                </button>

                <button
                  onClick={() => {
                    setShowReactivateForm(false);
                    setNewDueAt("");
                  }}
                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded-xl hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedTodoItem;
