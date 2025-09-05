import React, { useState } from "react";
import { useTodos } from "../hooks/useTodos";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { ErrorDisplay } from "./ErrorDisplay";
import Layout from "./Layout";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import TaskList from "./TaskList";
import BottomTabBar from "./BottomTabBar";
import FloatingActionButton from "./FloatingActionButton";
import TaskModal from "./TaskModal";
import type { TaskType, TaskState } from "../services/api";

const TodoApp: React.FC = () => {
  const { data: groupedTodos, isLoading, error } = useTodos();
  const { handleError, currentError, clearError } = useErrorHandler();
  const [selectedTaskType, setSelectedTaskType] =
    useState<TaskType>("one-time");
  const [selectedState, setSelectedState] = useState<TaskState>("pending");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const todos = groupedTodos || {
    pending: [],
    active: [],
    completed: [],
    failed: [],
  };

  return (
    <Layout>
      <Sidebar
        selectedState={selectedState}
        onStateChange={setSelectedState}
        todos={todos}
      />
      <div className="flex-1 flex flex-col bg-white min-h-screen lg:min-h-0 lg:ml-64">
        <TopBar
          selectedState={selectedState}
          onAddTask={() => setIsTaskModalOpen(true)}
        />
        <div className="flex-1 pt-16 pb-20 lg:pt-0 lg:pb-0 bg-white overflow-hidden">
          {currentError && (
            <div className="p-4">
              <ErrorDisplay error={currentError} onDismiss={clearError} />
            </div>
          )}
          <div className="h-full overflow-y-auto">
            <TaskList
              todos={todos[selectedState]}
              state={selectedState}
              onError={handleError}
            />
          </div>
        </div>
      </div>
      <BottomTabBar
        selectedState={selectedState}
        onStateChange={setSelectedState}
      />
      <FloatingActionButton onClick={() => setIsTaskModalOpen(true)} />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskType={selectedTaskType}
        setTaskType={setSelectedTaskType}
        onError={handleError}
        onTaskCreated={() => setSelectedState("pending")}
      />
    </Layout>
  );
};

export default TodoApp;
