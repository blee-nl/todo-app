import { useMemo, useEffect } from "react";
import type { Task } from "../../../domain/entities/Task";
import { TaskDomainService } from "../../../domain/services/TaskDomainService";
import { TaskState } from "../../../constants/taskConstants";
import { useTaskService } from "../../tasks/hooks/useTaskService";
import { NotificationScheduler } from "../../../services/notificationScheduler";

export const useTaskManagement = () => {
  const taskService = useTaskService();

  // Initialize notification scheduler and schedule notifications for all tasks
  useEffect(() => {
    NotificationScheduler.initialize();

    if (taskService.tasks.length > 0) {
      NotificationScheduler.scheduleTaskNotifications(taskService.tasks);
    }

    // Cleanup on unmount
    return () => {
      NotificationScheduler.clearAll();
    };
  }, [taskService.tasks]);

  const tasksByState = useMemo(() => {
    const grouped = {
      pending: [] as Task[],
      active: [] as Task[],
      completed: [] as Task[],
      failed: [] as Task[],
    };

    taskService.tasks.forEach((task) => {
      switch (task.state) {
        case TaskState.PENDING:
          grouped.pending.push(task);
          break;
        case TaskState.ACTIVE:
          grouped.active.push(task);
          break;
        case TaskState.COMPLETED:
          grouped.completed.push(task);
          break;
        case TaskState.FAILED:
          grouped.failed.push(task);
          break;
      }
    });

    // Sort each group by priority
    Object.keys(grouped).forEach((key) => {
      const stateKey = key as keyof typeof grouped;
      grouped[stateKey].sort((a, b) =>
        TaskDomainService.getTaskPriority(a) - TaskDomainService.getTaskPriority(b)
      );
    });

    return grouped;
  }, [taskService.tasks]);

  const statistics = useMemo(() => {
    const overdueTasks = taskService.tasks.filter(task => TaskDomainService.isOverdue(task));
    const todayTasks = taskService.tasks.filter(task => {
      if (!task.dueAt) return false;
      const today = new Date();
      const taskDate = new Date(task.dueAt);
      return taskDate.toDateString() === today.toDateString();
    });

    return {
      total: taskService.tasks.length,
      pending: tasksByState.pending.length,
      active: tasksByState.active.length,
      completed: tasksByState.completed.length,
      failed: tasksByState.failed.length,
      overdue: overdueTasks.length,
      dueToday: todayTasks.length,
    };
  }, [taskService.tasks, tasksByState]);

  const taskActions = {
    createTask: async (request: Parameters<typeof taskService.createTask.mutateAsync>[0]) => {
      const result = await taskService.createTask.mutateAsync(request);
      if (result.success && result.task) {
        try {
          NotificationScheduler.scheduleTaskNotification(result.task);
        } catch (error) {
          console.warn('Failed to schedule notification for task:', error);
        }
      }
      return result;
    },

    updateTask: async (id: string, request: Parameters<typeof taskService.updateTask.mutateAsync>[0]['request']) => {
      const result = await taskService.updateTask.mutateAsync({ id, request });
      if (result.success && result.task) {
        try {
          NotificationScheduler.updateTaskNotification(result.task);
        } catch (error) {
          console.warn('Failed to update notification for task:', error);
        }
      }
      return result;
    },

    deleteTask: async (id: string) => {
      try {
        NotificationScheduler.clearTaskNotification(id);
      } catch (error) {
        console.warn('Failed to clear notification for task:', error);
      }
      const result = await taskService.deleteTask.mutateAsync(id);
      return result;
    },

    activateTask: async (id: string) => {
      const result = await taskService.activateTask.mutateAsync(id);
      if (result.success && result.task) {
        try {
          NotificationScheduler.handleTaskStateChange(result.task);
        } catch (error) {
          console.warn('Failed to handle notification state change for task:', error);
        }
      }
      return result;
    },

    completeTask: async (id: string) => {
      const result = await taskService.completeTask.mutateAsync(id);
      if (result.success && result.task) {
        try {
          NotificationScheduler.handleTaskStateChange(result.task);
        } catch (error) {
          console.warn('Failed to handle notification state change for task:', error);
        }
      }
      return result;
    },

    failTask: async (id: string) => {
      const result = await taskService.failTask.mutateAsync(id);
      if (result.success && result.task) {
        NotificationScheduler.handleTaskStateChange(result.task);
      }
      return result;
    },

    reactivateTask: async (id: string, request?: Parameters<typeof taskService.reactivateTask.mutateAsync>[0]['request']) => {
      const result = await taskService.reactivateTask.mutateAsync({ id, request });
      if (result.success && result.task) {
        NotificationScheduler.handleTaskStateChange(result.task);
      }
      return result;
    },

    deleteAllCompleted: async () => {
      // Clear notifications for completed tasks before deleting
      tasksByState.completed.forEach(task => {
        NotificationScheduler.clearTaskNotification(task.id);
      });
      const result = await taskService.deleteCompletedTasks.mutateAsync();
      return result;
    },

    deleteAllFailed: async () => {
      // Clear notifications for failed tasks before deleting
      tasksByState.failed.forEach(task => {
        NotificationScheduler.clearTaskNotification(task.id);
      });
      const result = await taskService.deleteFailedTasks.mutateAsync();
      return result;
    },
  };

  const domainHelpers = {
    isTaskOverdue: TaskDomainService.isOverdue,
    canTaskBeActivated: TaskDomainService.canBeActivated,
    canTaskBeCompleted: TaskDomainService.canBeCompleted,
    canTaskBeFailed: TaskDomainService.canBeFailed,
    canTaskBeReactivated: TaskDomainService.canBeReactivated,
    canTaskBeEdited: TaskDomainService.canBeEdited,
    getTaskBadges: TaskDomainService.getTaskDisplayBadges,
    validateTaskText: TaskDomainService.validateTaskText,
    validateDueDate: TaskDomainService.validateDueDate,
  };

  return {
    // Data
    tasksByState,
    statistics,
    isLoading: taskService.isLoading,
    error: taskService.error,

    // Actions
    actions: taskActions,

    // Domain helpers
    domain: domainHelpers,

    // Loading states
    isCreating: taskService.createTask.isPending,
    isUpdating: taskService.updateTask.isPending,
    isDeleting: taskService.deleteTask.isPending,
    isActivating: taskService.activateTask.isPending,
    isCompleting: taskService.completeTask.isPending,
    isFailing: taskService.failTask.isPending,
    isReactivating: taskService.reactivateTask.isPending,
    isDeletingCompleted: taskService.deleteCompletedTasks.isPending,
    isDeletingFailed: taskService.deleteFailedTasks.isPending,
  };
};