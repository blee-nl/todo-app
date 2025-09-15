import React from "react";
import type { Todo, TaskState } from "../services/api";
import PendingTodoItem from "./PendingTodoItem";
import ActiveTodoItem from "./ActiveTodoItem";
import CompletedTodoItem from "./CompletedTodoItem";
import FailedTodoItem from "./FailedTodoItem";
import { TaskIcon, SuccessIcon, ErrorIcon } from "../assets/icons";
import { TaskState as TaskStateConstants } from "../constants/taskConstants";

interface TodoListProps {
  todos: Todo[];
  state: TaskState;
  onError?: (error: Error) => void;
}

const stateConfig = {
  [TaskStateConstants.PENDING]: {
    icon: <TaskIcon size="lg" className="text-blue-500" />,
    contextText: "No pending tasks",
  },
  [TaskStateConstants.ACTIVE]: {
    icon: <TaskIcon size="lg" className="text-green-500" />,
    contextText: "No active tasks",
  },
  [TaskStateConstants.COMPLETED]: {
    icon: <SuccessIcon size="lg" className="text-gray-500" />,
    contextText: "No completed tasks",
  },
  [TaskStateConstants.FAILED]: {
    icon: <ErrorIcon size="lg" className="text-red-500" />,
    contextText: "No failed tasks",
  },
};

const TodoList: React.FC<TodoListProps> = ({ todos, state, onError }) => {
  const taskState = stateConfig[state];

  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="mb-2">{taskState.icon}</div>
        <p className="text-sm">{taskState.contextText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {todos.map((todo) => {
        switch (state) {
          case TaskStateConstants.PENDING:
            return (
              <PendingTodoItem key={todo.id} todo={todo} onError={onError} />
            );
          case TaskStateConstants.ACTIVE:
            return (
              <ActiveTodoItem key={todo.id} todo={todo} onError={onError} />
            );
          case TaskStateConstants.COMPLETED:
            return (
              <CompletedTodoItem key={todo.id} todo={todo} onError={onError} />
            );
          case TaskStateConstants.FAILED:
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
