import React from "react";
import {
  ClipboardDocumentListIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { TaskState } from "../services/api";

interface BottomTabBarProps {
  selectedState: TaskState;
  onStateChange: (state: TaskState) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({
  selectedState,
  onStateChange,
}) => {
  const tabs = [
    {
      state: "pending" as TaskState,
      label: "Pending",
      icon: ClipboardDocumentListIcon,
    },
    {
      state: "active" as TaskState,
      label: "Active",
      icon: BoltIcon,
    },
    {
      state: "completed" as TaskState,
      label: "Done",
      icon: CheckCircleIcon,
    },
    {
      state: "failed" as TaskState,
      label: "Failed",
      icon: XCircleIcon,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.state}
            onClick={() => onStateChange(tab.state)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
              selectedState === tab.state
                ? "text-blue-600 bg-blue-50 shadow-md scale-105"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:scale-105"
            }`}
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
