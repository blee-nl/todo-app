import React, { useState, useCallback } from "react";
import { useCreateTodo } from "../hooks/useTodos";
import type { TaskType } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";

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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Type:{" "}
            <span className="font-semibold capitalize">{taskType}</span>
          </label>
        </div>

        <div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`What ${
              taskType === "one-time" ? "task" : "habit"
            } needs to be done?`}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isLoading}
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {text.length}/500
          </div>
        </div>

        {taskType === "one-time" && (
          <div>
            <label
              htmlFor="due-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Due Date & Time
            </label>
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
          <div className="text-sm text-gray-500">
            {taskType === "one-time"
              ? "One-time tasks have a specific deadline"
              : "Daily tasks repeat every day at midnight"}
          </div>

          <button
            type="submit"
            disabled={
              isLoading || !text.trim() || (taskType === "one-time" && !dueAt)
            }
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <span>+</span>
                <span>Add Task</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodoInput;
