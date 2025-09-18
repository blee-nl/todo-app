import React from "react";
import {
  ClipboardDocumentListIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { TaskState } from "../services/api";
import {
  TaskState as TaskStateConstants,
  TASK_STATE_CONFIG,
} from "../constants/taskConstants";

interface BottomTabBarProps {
  selectedState: TaskState;
  onStateChange: (state: TaskState) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({
  selectedState,
  onStateChange,
}) => {
  const handleStateChange = (state: TaskState) => {
    onStateChange(state);
  };
  const tabs = [
    {
      state: TaskStateConstants.PENDING,
      label: TASK_STATE_CONFIG[TaskStateConstants.PENDING].label,
      icon: ClipboardDocumentListIcon,
    },
    {
      state: TaskStateConstants.ACTIVE,
      label: TASK_STATE_CONFIG[TaskStateConstants.ACTIVE].label,
      icon: BoltIcon,
    },
    {
      state: TaskStateConstants.COMPLETED,
      label: TASK_STATE_CONFIG[TaskStateConstants.COMPLETED].label,
      icon: CheckCircleIcon,
    },
    {
      state: TaskStateConstants.FAILED,
      label: TASK_STATE_CONFIG[TaskStateConstants.FAILED].label,
      icon: XCircleIcon,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.state}
            onClick={() => handleStateChange(tab.state)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
              selectedState === tab.state
                ? "text-blue-600 bg-blue-50 shadow-md scale-105"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:scale-105"
            }`}
            data-testid={`${tab.state}-tab-mobile`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomTabBar;
