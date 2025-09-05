import React from "react";
import type { Todo, TaskState } from "../services/api";
import PendingTodoItem from "./PendingTodoItem";
import ActiveTodoItem from "./ActiveTodoItem";
import CompletedTodoItem from "./CompletedTodoItem";
import FailedTodoItem from "./FailedTodoItem";
import { useTaskListActions } from "./actions/TaskActions";
import { Label } from "../design-system";
import { TaskIcon, SuccessIcon, ErrorIcon } from "../assets/icons";
import { DeleteAllButton } from "./TaskActionButtons";

interface TaskListProps {
  todos: Todo[];
  state: TaskState;
  onError?: (error: Error) => void;
}

const TaskList: React.FC<TaskListProps> = ({ todos, state, onError }) => {
  const { handleDeleteAll, isDeleteAllLoading } = useTaskListActions(
    state as "completed" | "failed",
    onError
  );

  const stateConfig = {
    pending: {
      icon: <TaskIcon size="lg" className="text-blue-500 opacity-50" />,
      title: "No pending tasks",
      description: "Create a new task to get started",
    },
    active: {
      icon: <TaskIcon size="lg" className="text-green-500 opacity-50" />,
      title: "No active tasks",
      description: "Activate a pending task to begin working",
    },
    completed: {
      icon: <SuccessIcon size="lg" className="text-gray-500 opacity-50" />,
      title: "No completed tasks",
      description: "Complete some tasks to see them here",
    },
    failed: {
      icon: <ErrorIcon size="lg" className="text-red-500 opacity-50" />,
      title: "No failed tasks",
      description: "Tasks that weren't completed will appear here",
    },
  };

  const taskState = stateConfig[state];

  if (todos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4">{taskState.icon}</div>
          <Label className="text-lg font-medium text-gray-900 mb-2">
            {taskState.title}
          </Label>
          <p className="text-gray-500">{taskState.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Delete All Button for Completed and Failed */}
        {(state === "completed" || state === "failed") && (
          <div className="mb-6 flex justify-end">
            <DeleteAllButton
              onClick={handleDeleteAll}
              disabled={isDeleteAllLoading}
              isLoading={isDeleteAllLoading}
              count={todos.length}
              state={state as "completed" | "failed"}
            />
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
                  />
                );
              case "active":
                return (
                  <ActiveTodoItem key={todo.id} todo={todo} onError={onError} />
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
