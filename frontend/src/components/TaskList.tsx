import React from "react";
import type { Todo, TaskState } from "../services/api";
import PendingTodoItem from "./PendingTodoItem";
import ActiveTodoItem from "./ActiveTodoItem";
import CompletedTodoItem from "./CompletedTodoItem";
import FailedTodoItem from "./FailedTodoItem";
import {
  useDeleteCompletedTodos,
  useDeleteFailedTodos,
} from "../hooks/useTodos";
import { TrashIcon } from "@heroicons/react/24/outline";

interface TaskListProps {
  todos: Todo[];
  state: TaskState;
  onError?: (error: Error) => void;
}

const TaskList: React.FC<TaskListProps> = ({ todos, state, onError }) => {
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

  const isDeleteAllLoading =
    (state === "completed" && deleteCompletedTodos.isPending) ||
    (state === "failed" && deleteFailedTodos.isPending);

  if (todos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-50">
            {state === "pending" && "📋"}
            {state === "active" && "⚡"}
            {state === "completed" && "✅"}
            {state === "failed" && "❌"}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {state === "pending" && "No pending tasks"}
            {state === "active" && "No active tasks"}
            {state === "completed" && "No completed tasks"}
            {state === "failed" && "No failed tasks"}
          </h3>
          <p className="text-gray-500">
            {state === "pending" && "Create a new task to get started"}
            {state === "active" && "Activate a pending task to begin working"}
            {state === "completed" && "Complete some tasks to see them here"}
            {state === "failed" &&
              "Tasks that weren't completed will appear here"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Delete All Button for Completed and Failed */}
        {(state === "completed" || state === "failed") && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleDeleteAll}
              disabled={isDeleteAllLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 disabled:bg-gray-300 transition-colors duration-200 font-medium"
            >
              <TrashIcon className="w-4 h-4" />
              <span>
                {isDeleteAllLoading
                  ? `Deleting all ${state}...`
                  : `Delete All ${
                      state.charAt(0).toUpperCase() + state.slice(1)
                    }`}
              </span>
            </button>
          </div>
        )}

        <div className="space-y-3">
          {todos.map((todo) => {
            switch (state) {
              case "pending":
                return (
                  <PendingTodoItem
                    key={todo.id}
                    todo={todo}
                    onError={onError}
                    isMobile={false}
                  />
                );
              case "active":
                return (
                  <ActiveTodoItem
                    key={todo.id}
                    todo={todo}
                    onError={onError}
                    isMobile={false}
                  />
                );
              case "completed":
                return (
                  <CompletedTodoItem
                    key={todo.id}
                    todo={todo}
                    onError={onError}
                  />
                );
              case "failed":
                return (
                  <FailedTodoItem key={todo.id} todo={todo} onError={onError} />
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
