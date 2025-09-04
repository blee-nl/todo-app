import React from "react";
import { formatDate } from "../utils";
import { InlineErrorDisplay } from "./InlineErrorDisplay";
import type { Todo as TodoType } from "../services/api";
import type { AppError } from "../utils/errorUtils";

interface CompletedTodoItemProps {
  todo: TodoType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isPending: {
    toggle: boolean;
    delete: boolean;
  };
  error?: AppError | null;
  onRetry?: () => void;
  onDismissError?: () => void;
}

export const CompletedTodoItem: React.FC<CompletedTodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  isPending,
  error,
  onRetry,
  onDismissError,
}) => {
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            disabled={isPending.toggle}
            className="w-6 h-6 text-green-600 bg-white border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Mark todo as incomplete"
          />
        </div>
        <span className="flex-1 text-lg text-slate-500 line-through font-medium">
          {todo.text}
        </span>
        <button
          onClick={() => onDelete(todo.id)}
          disabled={isPending.delete}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Delete completed todo"
        >
          {isPending.delete ? "Deleting..." : "Delete"}
        </button>
      </div>
      {/* Timestamp info for completed todos */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
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
          <span>Created {formatDate(todo.createdAt)}</span>
        </div>
        {todo.completedAt && (
          <div className="flex items-center gap-1 text-green-600">
            <svg
              className="w-4 h-4"
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
            <span>Completed {formatDate(todo.completedAt)}</span>
          </div>
        )}
        {todo.updatedAt !== todo.createdAt && (
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Updated {formatDate(todo.updatedAt)}</span>
          </div>
        )}
      </div>
      {/* Error display */}
      <InlineErrorDisplay
        error={error || null}
        onRetry={onRetry}
        onDismiss={onDismissError}
      />
    </>
  );
};
