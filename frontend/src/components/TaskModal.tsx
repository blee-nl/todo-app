import React, { useState, useCallback } from "react";
import type { TaskType } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import { Button, Heading, Label, TextArea } from "../design-system";
import { TaskIcon, HabitIcon, XIcon } from "../assets/icons";
import { useTaskModalActions } from "./actions/TaskActions";
import { CancelButton, AddTaskButton } from "./TaskActionButtons";
import { TaskType as TaskTypeConstants, isOneTimeTask, getTaskPlaceholder } from "../constants/taskConstants";

// Constants
const PLACEHOLDERS = {
  TASK_DESCRIPTION: "What task needs to be done?",
  HABIT_DESCRIPTION: "What habit needs to be done?",
  DUE_DATE_TIME: "Select due date and time",
  ADD_TASK: "Add Task",
  ADDING: "Adding...",
  CANCEL: "Cancel",
} as const;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: TaskType;
  setTaskType: (taskType: TaskType) => void;
  onError?: (error: Error) => void;
  onTaskCreated?: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskType,
  setTaskType,
  onError,
  onTaskCreated,
}) => {
  const [text, setText] = useState("");
  const [dueAt, setDueAt] = useState("");

  const { handleCreate, isCreating } = useTaskModalActions(onError);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!text.trim()) return;

      try {
        const todoData = {
          text: text.trim(),
          type: taskType,
          ...(isOneTimeTask(taskType) && dueAt && { dueAt }),
        };

        await handleCreate(todoData);
        setText("");
        setDueAt("");
        onTaskCreated?.();
        onClose();
      } catch (error) {
        // Error is already handled by useTaskModalActions
        console.error("Failed to create todo:", error);
      }
    },
    [text, taskType, dueAt, handleCreate, onClose, onTaskCreated]
  );

  const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Heading level={3}>Add New Task</Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
              leftIcon={<XIcon size="sm" />}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Task Type */}
          <div>
            <Label className="mb-2">Task Type</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={taskType === TaskTypeConstants.ONE_TIME ? "primary" : "secondary"}
                size="md"
                className="flex-1"
                onClick={() => setTaskType(TaskTypeConstants.ONE_TIME)}
                leftIcon={<TaskIcon size="sm" />}
              >
                One-time
              </Button>
              <Button
                type="button"
                variant={taskType === TaskTypeConstants.DAILY ? "success" : "secondary"}
                size="md"
                className="flex-1"
                onClick={() => setTaskType(TaskTypeConstants.DAILY)}
                leftIcon={<HabitIcon size="sm" />}
              >
                Daily
              </Button>
            </div>
          </div>

          {/* Task Text */}
          <TextArea
            label="Task Description"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={getTaskPlaceholder(taskType)}
            rows={3}
            disabled={isCreating}
            maxLength={500}
            characterCount={{
              current: text.length,
              max: 500,
            }}
          />

          {/* Due Date for One-time Tasks */}
          {isOneTimeTask(taskType) && (
            <div>
              <Label htmlFor="modal-due-date" className="mb-2">
                Due Date & Time
              </Label>
              <CustomDateTimePicker
                id="modal-due-date"
                value={dueAt}
                onChange={setDueAt}
                min={getMinDate()}
                disabled={isCreating}
                placeholder={PLACEHOLDERS.DUE_DATE_TIME}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <CancelButton
              onClick={onClose}
              disabled={isCreating}
              className="flex-1"
            />
            <AddTaskButton
              type="submit"
              disabled={
                isCreating ||
                !text.trim() ||
                (isOneTimeTask(taskType) && !dueAt)
              }
              isLoading={isCreating}
              className="flex-1"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
