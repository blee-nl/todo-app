import React from "react";
import { 
  ClipboardDocumentListIcon, 
  BoltIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ChartBarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import type { TaskState, GroupedTodos } from "../services/api";

interface SidebarProps {
  selectedState: TaskState;
  onStateChange: (state: TaskState) => void;
  todos: GroupedTodos;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedState,
  onStateChange,
  todos,
}) => {
  const navigationItems = [
    {
      state: "pending" as TaskState,
      label: "Pending",
      icon: ClipboardDocumentListIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      activeBgColor: "bg-blue-100",
    },
    {
      state: "active" as TaskState,
      label: "Active",
      icon: BoltIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      activeBgColor: "bg-green-100",
    },
    {
      state: "completed" as TaskState,
      label: "Completed",
      icon: CheckCircleIcon,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      activeBgColor: "bg-gray-100",
    },
    {
      state: "failed" as TaskState,
      label: "Failed",
      icon: XCircleIcon,
      color: "text-red-600",
      bgColor: "bg-red-50",
      activeBgColor: "bg-red-100",
    },
  ];

  const totalCount =
    todos.pending.length +
    todos.active.length +
    todos.completed.length +
    todos.failed.length;

  return (
    <div className="hidden lg:flex lg:w-64 bg-white border-r border-gray-200 flex-col">
      {/* App Logo/Name */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">TodoApp</h1>
            <p className="text-sm text-gray-500">{totalCount} tasks</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.state}
              onClick={() => onStateChange(item.state)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                selectedState === item.state
                  ? `${item.activeBgColor} ${item.color} shadow-sm`
                  : `${item.bgColor} text-gray-600 hover:${item.activeBgColor}`
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${
                  selectedState === item.state
                    ? "bg-white text-gray-600"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {todos[item.state].length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom: Timezone/Statistics Widget */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <ChartBarIcon className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-700">Statistics</h3>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Completion Rate</span>
              <span className="font-medium">
                {totalCount > 0
                  ? Math.round((todos.completed.length / totalCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Tasks</span>
              <span className="font-medium">{todos.active.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-3 h-3" />
                <span>Timezone</span>
              </div>
              <span className="font-medium">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
