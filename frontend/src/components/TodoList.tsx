import React from "react";
import type { Todo, TaskState } from "../services/api";
import PendingTodoItem from "./PendingTodoItem";
import ActiveTodoItem from "./ActiveTodoItem";
import CompletedTodoItem from "./CompletedTodoItem";
import FailedTodoItem from "./FailedTodoItem";

interface TodoListProps {
  todos: Todo[];
  state: TaskState;
  onError?: (error: Error) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, state, onError }) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">
          {state === "pending" && "📋"}
          {state === "active" && "⚡"}
          {state === "completed" && "✅"}
          {state === "failed" && "❌"}
        </div>
        <p className="text-sm">
          {state === "pending" && "No pending tasks"}
          {state === "active" && "No active tasks"}
          {state === "completed" && "No completed tasks"}
          {state === "failed" && "No failed tasks"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
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
              <CompletedTodoItem key={todo.id} todo={todo} onError={onError} />
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
  );
};

export default TodoList;
