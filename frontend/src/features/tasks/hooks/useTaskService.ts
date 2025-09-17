import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceContainer } from "../../../infrastructure/container/ServiceContainer";
import type { CreateTaskRequest, UpdateTaskRequest, ReactivateTaskRequest } from "../../../domain/entities/Task";

export const useTaskService = () => {
  const queryClient = useQueryClient();
  const taskService = serviceContainer.taskApplicationService;

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskService.getAllTasks(),
    staleTime: 5 * 60 * 1000,
  });

  const createTaskMutation = useMutation({
    mutationFn: (request: CreateTaskRequest) => taskService.createTask(request),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateTaskRequest }) =>
      taskService.updateTask(id, request),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });

  const activateTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.activateTask(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.completeTask(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });

  const failTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.failTask(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });

  const reactivateTaskMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request?: ReactivateTaskRequest }) =>
      taskService.reactivateTask(id, request),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });

  const deleteCompletedTasksMutation = useMutation({
    mutationFn: () => taskService.deleteAllCompletedTasks(),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });

  const deleteFailedTasksMutation = useMutation({
    mutationFn: () => taskService.deleteAllFailedTasks(),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
  });

  return {
    // Queries
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,

    // Mutations
    createTask: createTaskMutation,
    updateTask: updateTaskMutation,
    deleteTask: deleteTaskMutation,
    activateTask: activateTaskMutation,
    completeTask: completeTaskMutation,
    failTask: failTaskMutation,
    reactivateTask: reactivateTaskMutation,
    deleteCompletedTasks: deleteCompletedTasksMutation,
    deleteFailedTasks: deleteFailedTasksMutation,
  };
};