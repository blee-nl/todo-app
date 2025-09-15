import React, { useState, useCallback } from "react";
import { useCreateTodo } from "../hooks/useTodos";
import type { TaskType } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import { Button, Input, Label, Text } from "../design-system";
import { PlusIcon } from "../assets/icons";
import {
  LoadingText,
  TASK_TYPE_CONFIG,
  isOneTimeTask,
  getTaskPlaceholder,
} from "../constants/taskConstants";

interface TodoInputProps {
  taskType: TaskType;
  onError?: (error: Error) => void;
}

const TodoInput: React.FC<TodoInputProps> = ({ taskType, onError }) => {
  const [taskText, setTaskText] = useState("");
  const [dueDateTime, setDueDateTime] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createTodo = useCreateTodo();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!taskText.trim()) return;

      setIsCreating(true);

      try {
        const todoData = {
          text: taskText.trim(),
          type: taskType,
          ...(isOneTimeTask(taskType) && dueDateTime && { dueAt: dueDateTime }),
        };

        await createTodo.mutateAsync(todoData);
        setTaskText("");
        setDueDateTime("");
      } catch (error) {
        console.error("Failed to create todo:", error);
        onError?.(error as Error);
      } finally {
        setIsCreating(false);
      }
    },
    [taskText, taskType, dueDateTime, createTodo, onError]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const getMinimumDateTime = () => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 1); // At least 1 minute in the future
    return currentTime.toISOString().slice(0, 16);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-2">
            Task Type:{" "}
            <Text weight="semibold" className="capitalize">
              {taskType}
            </Text>
          </Label>
        </div>

        <div>
          <Input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getTaskPlaceholder(taskType)}
            disabled={isCreating}
            maxLength={500}
          />
          <div className="text-right mt-1">
            <Text variant="muted" className="text-sm">
              {taskText.length}/500
            </Text>
          </div>
        </div>

        {isOneTimeTask(taskType) && (
          <div>
            <Label htmlFor="due-date" className="mb-2">
              Due Date & Time
            </Label>
            <CustomDateTimePicker
              id="due-date"
              value={dueDateTime}
              onChange={setDueDateTime}
              min={getMinimumDateTime()}
              disabled={isCreating}
              placeholder="Select due date and time"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Text variant="muted" className="text-sm">
            {TASK_TYPE_CONFIG[taskType].description}
          </Text>

          <Button
            type="submit"
            disabled={
              isCreating ||
              !taskText.trim() ||
              (isOneTimeTask(taskType) && !dueDateTime)
            }
            variant="primary"
            size="md"
            isLoading={isCreating}
            leftIcon={<PlusIcon size="sm" />}
          >
            {isCreating ? LoadingText.ADDING : LoadingText.ADD_TASK}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TodoInput;
