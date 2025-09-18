import React, { useState, useEffect } from "react";
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
import type { AppError } from "../utils/errorUtils";
import { DEFAULT_VALUES, TaskState as TaskStateConstants } from "../constants/taskConstants";
import { NotificationScheduler } from "../services/notificationScheduler";

const TodoApp: React.FC = () => {
  const { data: groupedTodos, isLoading, error } = useTodos();
  const { handleError, currentError, clearError } = useErrorHandler();
  const [selectedTaskType, setSelectedTaskType] =
    useState<TaskType>(DEFAULT_VALUES.TASK_TYPE);
  const [selectedState, setSelectedState] = useState<TaskState>(DEFAULT_VALUES.TASK_STATE);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleOpenTaskModal = () => {
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
  };

  const handleTaskCreated = () => {
    setSelectedState(TaskStateConstants.PENDING);
  };

  // Initialize notification system on app start
  useEffect(() => {
    // Initialize notification scheduler
    NotificationScheduler.initialize();

    // Check for notification permission on app start (non-intrusive)
    if (NotificationScheduler.getNotificationStatus('dummy').browserSupported) {
      const permission = NotificationScheduler.getNotificationStatus('dummy').permissionGranted;
      if (!permission) {
        console.log('Notifications are supported but permission not granted. User can enable in task creation.');
      }
    }
  }, []);

  if (error) {
    return <ErrorDisplay error={error as AppError} />;
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
    <Layout data-testid="todo-app">
      <Sidebar
        selectedState={selectedState}
        onStateChange={setSelectedState}
        todos={todos}
      />
      <div className="flex-1 flex flex-col bg-white min-h-screen lg:min-h-0 lg:ml-64">
        <TopBar
          selectedState={selectedState}
          onAddTask={handleOpenTaskModal}
        />
        <div className="flex-1 pt-16 pb-20 lg:pt-0 lg:pb-0 bg-white flex flex-col">
          {currentError && (
            <div className="p-4 flex-shrink-0">
              <ErrorDisplay error={currentError} onDismiss={clearError} />
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
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
      <FloatingActionButton onClick={handleOpenTaskModal} />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        taskType={selectedTaskType}
        setTaskType={setSelectedTaskType}
        onError={handleError}
        onTaskCreated={handleTaskCreated}
      />
    </Layout>
  );
};

export default TodoApp;
