import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { TaskState } from "../services/api";

interface TopBarProps {
  selectedState: TaskState;
  onAddTask: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ selectedState, onAddTask }) => {
  const getTitle = (state: TaskState) => {
    switch (state) {
      case "pending":
        return "Pending Tasks";
      case "active":
        return "Active Tasks";
      case "completed":
        return "Completed Tasks";
      case "failed":
        return "Failed Tasks";
      default:
        return "Tasks";
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between lg:relative lg:z-auto">
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
          {getTitle(selectedState)}
        </h1>
        <p className="text-sm text-gray-500 hidden sm:block">
          Manage your tasks
        </p>
      </div>
      <button
        onClick={onAddTask}
        className="hidden lg:flex bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 items-center space-x-2"
      >
        <PlusIcon className="w-5 h-5" />
        <span>Add Task</span>
      </button>
    </div>
  );
};

export default TopBar;
