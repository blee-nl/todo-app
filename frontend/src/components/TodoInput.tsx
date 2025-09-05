import React, { useState, useCallback } from "react";
import { useCreateTodo } from "../hooks/useTodos";
import type { TaskType } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import { Button, Input, Label, Text } from "../design-system";
import { PlusIcon } from "../assets/icons";

interface TodoInputProps {
  taskType: TaskType;
  onError?: (error: Error) => void;
}

const TodoInput: React.FC<TodoInputProps> = ({ taskType, onError }) => {
  const [text, setText] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createTodo = useCreateTodo();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!text.trim()) return;

      setIsLoading(true);

      try {
        const todoData = {
          text: text.trim(),
          type: taskType,
          ...(taskType === "one-time" && dueAt && { dueAt }),
        };

        await createTodo.mutateAsync(todoData);
        setText("");
        setDueAt("");
      } catch (error) {
        console.error("Failed to create todo:", error);
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [text, taskType, dueAt, createTodo, onError]
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

  const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // At least 1 minute in the future
    return now.toISOString().slice(0, 16);
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
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`What ${
              taskType === "one-time" ? "task" : "habit"
            } needs to be done?`}
            disabled={isLoading}
            maxLength={500}
          />
          <div className="text-right mt-1">
            <Text variant="muted" className="text-sm">
              {text.length}/500
            </Text>
          </div>
        </div>

        {taskType === "one-time" && (
          <div>
            <Label htmlFor="due-date" className="mb-2">
              Due Date & Time
            </Label>
            <CustomDateTimePicker
              id="due-date"
              value={dueAt}
              onChange={setDueAt}
              min={getMinDate()}
              disabled={isLoading}
              placeholder="Select due date and time"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Text variant="muted" className="text-sm">
            {taskType === "one-time"
              ? "One-time tasks have a specific deadline"
              : "Daily tasks repeat every day at midnight"}
          </Text>

          <Button
            type="submit"
            disabled={
              isLoading || !text.trim() || (taskType === "one-time" && !dueAt)
            }
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={<PlusIcon size="sm" />}
          >
            {isLoading ? "Adding..." : "Add Task"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TodoInput;
