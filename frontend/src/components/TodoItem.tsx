import React from "react";
import { formatDate } from "../utils";
import { InlineErrorDisplay } from "./InlineErrorDisplay";
import type { Todo as TodoType } from "../services/api";
import type { AppError } from "../utils/errorUtils";

interface TodoItemProps {
  todo: TodoType;
  isEditing: boolean;
  editValue: string;
  onEdit: (todo: TodoType) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEditValueChange: (value: string) => void;
  isPending: {
    update: boolean;
    toggle: boolean;
    delete: boolean;
  };
  error?: AppError | null;
  onRetry?: () => void;
  onDismissError?: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  isEditing,
  editValue,
  onEdit,
  onSave,
  onCancel,
  onToggle,
  onDelete,
  onEditValueChange,
  isPending,
  error,
  onRetry,
  onDismissError,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSave(todo.id);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-3 bg-white border-2 border-blue-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 font-medium input-focus"
          autoFocus
          disabled={isPending.update}
          aria-label="Edit todo text"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onSave(todo.id)}
            disabled={isPending.update}
            className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Save changes"
          >
            {isPending.update ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            disabled={isPending.update}
            className="px-5 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-xl transition-colors duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            disabled={isPending.toggle}
            className="w-6 h-6 text-blue-600 bg-white border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 cursor-pointer transition-all duration-200 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Mark todo as ${
              todo.completed ? "incomplete" : "complete"
            }`}
          />
        </div>
        <span className="flex-1 text-lg text-slate-800 font-medium">
          {todo.text}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onEdit(todo)}
            disabled={isPending.toggle || isPending.delete}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Edit todo"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            disabled={isPending.toggle || isPending.delete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete todo"
          >
            {isPending.delete ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
      {/* Timestamp info */}
      <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
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
