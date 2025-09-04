import React, { useState, useCallback } from "react";
import { useCreateTodo } from "../hooks/useTodos";
import type { TaskType } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import { FlagIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: TaskType;
  setTaskType: (taskType: TaskType) => void;
  onError?: (error: Error) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskType,
  setTaskType,
  onError,
}) => {
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
        onClose();
      } catch (error) {
        console.error("Failed to create todo:", error);
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [text, taskType, dueAt, createTodo, onClose, onError]
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
            <h2 className="text-lg font-semibold text-gray-900">
              Add New Task
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Type
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-xl border transition-colors duration-200 flex items-center justify-center ${
                  taskType === "one-time"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setTaskType("one-time")}
              >
                <FlagIcon className="w-4 h-4 mr-2" />
                One-time
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-xl border transition-colors duration-200 flex items-center justify-center ${
                  taskType === "daily"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setTaskType("daily")}
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Daily
              </button>
            </div>
          </div>

          {/* Task Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Description
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`What ${
                taskType === "one-time" ? "task" : "habit"
              } needs to be done?`}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
              disabled={isLoading}
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {text.length}/500
            </div>
          </div>

          {/* Due Date for One-time Tasks */}
          {taskType === "one-time" && (
            <div>
              <label
                htmlFor="modal-due-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Due Date & Time
              </label>
              <CustomDateTimePicker
                id="modal-due-date"
                value={dueAt}
                onChange={setDueAt}
                min={getMinDate()}
                disabled={isLoading}
                placeholder="Select due date and time"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isLoading || !text.trim() || (taskType === "one-time" && !dueAt)
              }
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Add Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
