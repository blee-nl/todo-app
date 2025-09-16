import React from "react";
import type { Todo, TaskState } from "../services/api";
import PendingTodoItem from "./PendingTodoItem";
import ActiveTodoItem from "./ActiveTodoItem";
import CompletedTodoItem from "./CompletedTodoItem";
import FailedTodoItem from "./FailedTodoItem";
import { useTaskListBulkActions } from "./actions/TaskActions";
import { Label } from "../design-system";
import { TaskIcon, SuccessIcon, ErrorIcon } from "../assets/icons";
import { DeleteAllButton } from "./TaskActionButtons";
import { TaskState as TaskStateConstants, isCompletedTask, isFailedTask } from "../constants/taskConstants";

interface TaskListProps {
  todos: Todo[];
  state: TaskState;
  onError?: (error: Error) => void;
}

const TaskList: React.FC<TaskListProps> = ({ todos, state, onError }) => {
  const { deleteAllTasksInCurrentState, isDeletingAllTasks } = useTaskListBulkActions(
    state as typeof TaskStateConstants.COMPLETED | typeof TaskStateConstants.FAILED,
    onError
  );

  const stateConfig = {
    [TaskStateConstants.PENDING]: {
      icon: <TaskIcon size="lg" className="text-blue-500 opacity-50" />,
      title: "No pending tasks",
      description: "Create a new task to get started",
    },
    [TaskStateConstants.ACTIVE]: {
      icon: <TaskIcon size="lg" className="text-green-500 opacity-50" />,
      title: "No active tasks",
      description: "Activate a pending task to begin working",
    },
    [TaskStateConstants.COMPLETED]: {
      icon: <SuccessIcon size="lg" className="text-gray-500 opacity-50" />,
      title: "No completed tasks",
      description: "Complete some tasks to see them here",
    },
    [TaskStateConstants.FAILED]: {
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
        {(isCompletedTask(state) || isFailedTask(state)) && (
          <div className="mb-6 flex justify-end">
            <DeleteAllButton
              onClick={deleteAllTasksInCurrentState}
              disabled={isDeletingAllTasks}
              isLoading={isDeletingAllTasks}
              count={todos.length}
              state={state as typeof TaskStateConstants.COMPLETED | typeof TaskStateConstants.FAILED}
            />
          </div>
        )}

        <div className="space-y-3">
          {todos.map((todo) => {
            switch (state) {
              case TaskStateConstants.PENDING:
                return (
                  <PendingTodoItem
                    key={todo.id}
                    todo={todo}
                    onError={onError}
                  />
                );
              case TaskStateConstants.ACTIVE:
                return (
                  <ActiveTodoItem key={todo.id} todo={todo} onError={onError} />
                );
              case TaskStateConstants.COMPLETED:
                return (
                  <CompletedTodoItem
                    key={todo.id}
                    todo={todo}
                    onError={onError}
                  />
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
      </div>
    </div>
  );
};

export default TaskList;
