import React, { useState } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { TaskState } from "../services/api";
import { Button, Heading, Text, Input } from "../design-system";

interface TopBarProps {
  selectedState: TaskState;
  onAddTask: () => void;
}

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

const TopBar: React.FC<TopBarProps> = ({ selectedState, onAddTask }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between lg:relative lg:z-auto">
      <div className="flex-1">
        <Heading level={1} className="text-xl lg:text-2xl">
          {getTitle(selectedState)}
        </Heading>
        <Text variant="muted" className="text-sm hidden sm:block">
          Manage your tasks
        </Text>
      </div>

      {/* Search Input */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <Input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
          data-testid="search-input"
          className="w-full"
        />
      </div>

      <Button
        onClick={onAddTask}
        variant="primary"
        size="md"
        leftIcon={<PlusIcon className="w-5 h-5" />}
        className="hidden lg:flex"
        data-testid="add-todo-button"
      >
        Add Task
      </Button>
    </div>
  );
};

export default TopBar;
