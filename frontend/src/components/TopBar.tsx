import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { TaskState } from "../services/api";
import { Button, Heading, Text } from "../design-system";

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
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between lg:relative lg:z-auto">
      <div>
        <Heading level={1} className="text-xl lg:text-2xl">
          {getTitle(selectedState)}
        </Heading>
        <Text variant="muted" className="text-sm hidden sm:block">
          Manage your tasks
        </Text>
      </div>
      <Button
        onClick={onAddTask}
        variant="primary"
        size="md"
        leftIcon={<PlusIcon className="w-5 h-5" />}
        className="hidden lg:flex"
      >
        Add Task
      </Button>
    </div>
  );
};

export default TopBar;
