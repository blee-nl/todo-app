import React from "react";
import type { Task } from "../../../domain/entities/Task";
import { TaskState } from "../../../constants/taskConstants";
import { useTaskService } from "../hooks/useTaskService";
import PendingTaskItem from "../../../components/PendingTodoItem";
import ActiveTodoItem from "../../../components/ActiveTodoItem";
import CompletedTodoItem from "../../../components/CompletedTodoItem";
import FailedTodoItem from "../../../components/FailedTodoItem";
import { Label } from "../../../design-system";
import { TaskIcon, SuccessIcon, ErrorIcon } from "../../../assets/icons";
import { DeleteAllButton } from "../../../components/TaskActionButtons";

interface TaskListFeatureProps {
  state: string;
  onError?: (error: Error) => void;
}

const TaskListFeature: React.FC<TaskListFeatureProps> = ({ state, onError }) => {
  const { tasks, deleteCompletedTasks, deleteFailedTasks } = useTaskService();

  const filteredTasks = tasks.filter(task => task.state === state);

  const stateConfig = {
    [TaskState.PENDING]: {
      icon: <TaskIcon size="lg" className="text-blue-500 opacity-50" />,
      title: "No pending tasks",
      description: "Create a new task to get started",
    },
    [TaskState.ACTIVE]: {
      icon: <TaskIcon size="lg" className="text-green-500 opacity-50" />,
      title: "No active tasks",
      description: "Activate a pending task to begin working",
    },
    [TaskState.COMPLETED]: {
      icon: <SuccessIcon size="lg" className="text-gray-500 opacity-50" />,
      title: "No completed tasks",
      description: "Complete some tasks to see them here",
    },
    [TaskState.FAILED]: {
      icon: <ErrorIcon size="lg" className="text-red-500 opacity-50" />,
      title: "No failed tasks",
      description: "Tasks that weren't completed will appear here",
    },
  };

  const taskState = stateConfig[state as keyof typeof stateConfig];

  const handleDeleteAllCompleted = async () => {
    try {
      const result = await deleteCompletedTasks.mutateAsync();
      if (!result.success && result.error) {
        onError?.(new Error(result.error));
      }
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleDeleteAllFailed = async () => {
    try {
      const result = await deleteFailedTasks.mutateAsync();
      if (!result.success && result.error) {
        onError?.(new Error(result.error));
      }
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const renderTaskItem = (task: Task) => {
    // Convert Task to Todo for compatibility with existing components
    const todo = {
      id: task.id,
      text: task.text,
      type: task.type,
      state: task.state,
      dueAt: task.dueAt,
      createdAt: task.createdAt,
      activatedAt: task.activatedAt,
      completedAt: task.completedAt,
      failedAt: task.failedAt,
      updatedAt: task.updatedAt,
      isReactivation: task.isReactivation,
    };

    switch (task.state) {
      case TaskState.PENDING:
        return <PendingTaskItem key={task.id} todo={todo} onError={onError} />;
      case TaskState.ACTIVE:
        return <ActiveTodoItem key={task.id} todo={todo} onError={onError} />;
      case TaskState.COMPLETED:
        return <CompletedTodoItem key={task.id} todo={todo} onError={onError} />;
      case TaskState.FAILED:
        return <FailedTodoItem key={task.id} todo={todo} onError={onError} />;
      default:
        return null;
    }
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4">{taskState?.icon}</div>
          <Label className="text-lg font-medium text-gray-900 mb-2">
            {taskState?.title}
          </Label>
          <p className="text-gray-500">{taskState?.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Delete All Button for Completed and Failed */}
        {(state === TaskState.COMPLETED || state === TaskState.FAILED) && (
          <div className="mb-6 flex justify-end">
            <DeleteAllButton
              onClick={state === TaskState.COMPLETED ? handleDeleteAllCompleted : handleDeleteAllFailed}
              disabled={deleteCompletedTasks.isPending || deleteFailedTasks.isPending}
              isLoading={deleteCompletedTasks.isPending || deleteFailedTasks.isPending}
              count={filteredTasks.length}
              state={state as "completed" | "failed"}
            />
          </div>
        )}

        <div className="space-y-3">
          {filteredTasks.map(renderTaskItem)}
        </div>
      </div>
    </div>
  );
};

export default TaskListFeature;