import React, { useState } from "react";
import type { TaskType } from "../../../services/api";
import TaskModal from "../../../components/TaskModal";
import { TaskType as TaskTypeConstants } from "../../../constants/taskConstants";

interface TaskCreationFeatureProps {
  onError?: (error: Error) => void;
  onTaskCreated?: () => void;
}

export const TaskCreationFeature: React.FC<TaskCreationFeatureProps> = ({
  onError,
  onTaskCreated
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>(TaskTypeConstants.ONE_TIME);

  const handleTaskCreated = () => {
    setIsModalOpen(false);
    onTaskCreated?.();
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full p-4 text-left text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        + Add new task
      </button>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskType={taskType}
        setTaskType={setTaskType}
        onError={onError}
        onTaskCreated={handleTaskCreated}
      />
    </>
  );
};