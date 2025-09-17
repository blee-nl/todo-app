import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskApplicationService } from "../TaskApplicationService";
import { TaskDomainService } from "../../../domain/services/TaskDomainService";
import type { TaskRepository } from "../../../domain/repositories/TaskRepository";
import type { Task, CreateTaskRequest, UpdateTaskRequest, ReactivateTaskRequest } from "../../../domain/entities/Task";

// Mock the TaskDomainService
vi.mock("../../../domain/services/TaskDomainService", () => ({
  TaskDomainService: {
    validateTaskText: vi.fn(),
    validateDueDate: vi.fn(),
    canBeEdited: vi.fn(),
    canBeActivated: vi.fn(),
    canBeCompleted: vi.fn(),
    canBeFailed: vi.fn(),
    canBeReactivated: vi.fn(),
  },
}));

const mockTaskDomainService = TaskDomainService as any;

describe("TaskApplicationService", () => {
  let service: TaskApplicationService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;

  const mockTask: Task = {
    id: "1",
    text: "Test task",
    type: "one-time",
    state: "active",
    dueAt: "2025-01-01T10:00:00Z",
    createdAt: "2025-01-01T08:00:00Z",
    updatedAt: "2025-01-01T08:00:00Z",
    activatedAt: "2025-01-01T08:30:00Z",
    completedAt: undefined,
    failedAt: undefined,
    isReactivation: false,
    notification: {
      enabled: true,
      reminderMinutes: 30,
      notifiedAt: new Date("2025-01-01T09:00:00Z"),
    },
  };

  beforeEach(() => {
    mockTaskRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      activate: vi.fn(),
      complete: vi.fn(),
      fail: vi.fn(),
      reactivate: vi.fn(),
      deleteCompleted: vi.fn(),
      deleteFailed: vi.fn(),
    } as jest.Mocked<TaskRepository>;

    service = new TaskApplicationService(mockTaskRepository);
    vi.clearAllMocks();
  });

  describe("getAllTasks", () => {
    it("should return all tasks from repository", async () => {
      const tasks = [mockTask];
      mockTaskRepository.findAll.mockResolvedValue(tasks);

      const result = await service.getAllTasks();

      expect(result).toEqual(tasks);
      expect(mockTaskRepository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe("getTaskById", () => {
    it("should return task when found", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await service.getTaskById("1");

      expect(result).toEqual(mockTask);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should return null when task not found", async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await service.getTaskById("999");

      expect(result).toBeNull();
      expect(mockTaskRepository.findById).toHaveBeenCalledWith("999");
    });
  });

  describe("createTask", () => {
    const createRequest: CreateTaskRequest = {
      text: "New task",
      type: "one-time",
      dueAt: "2025-01-02T10:00:00Z",
      notification: {
        enabled: true,
        reminderMinutes: 15,
      },
    };

    it("should create task successfully", async () => {
      mockTaskDomainService.validateTaskText.mockReturnValue({ isValid: true });
      mockTaskDomainService.validateDueDate.mockReturnValue({ isValid: true });
      mockTaskRepository.create.mockResolvedValue(mockTask);

      const result = await service.createTask(createRequest);

      expect(result).toEqual({ success: true, task: mockTask });
      expect(mockTaskDomainService.validateTaskText).toHaveBeenCalledWith("New task");
      expect(mockTaskDomainService.validateDueDate).toHaveBeenCalledWith("2025-01-02T10:00:00Z", "one-time");
      expect(mockTaskRepository.create).toHaveBeenCalledWith(createRequest);
    });

    it("should return error when text validation fails", async () => {
      mockTaskDomainService.validateTaskText.mockReturnValue({
        isValid: false,
        error: "Task text cannot be empty"
      });

      const result = await service.createTask(createRequest);

      expect(result).toEqual({ success: false, error: "Task text cannot be empty" });
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it("should return error when due date validation fails", async () => {
      mockTaskDomainService.validateTaskText.mockReturnValue({ isValid: true });
      mockTaskDomainService.validateDueDate.mockReturnValue({
        isValid: false,
        error: "Due date is required for one-time tasks"
      });

      const result = await service.createTask(createRequest);

      expect(result).toEqual({ success: false, error: "Due date is required for one-time tasks" });
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it("should handle repository error", async () => {
      mockTaskDomainService.validateTaskText.mockReturnValue({ isValid: true });
      mockTaskDomainService.validateDueDate.mockReturnValue({ isValid: true });
      mockTaskRepository.create.mockRejectedValue(new Error("Database error"));

      const result = await service.createTask(createRequest);

      expect(result).toEqual({ success: false, error: "Failed to create task" });
    });

    it("should validate due date with empty string when dueAt is undefined", async () => {
      const requestWithoutDueAt = { ...createRequest, dueAt: undefined };
      mockTaskDomainService.validateTaskText.mockReturnValue({ isValid: true });
      mockTaskDomainService.validateDueDate.mockReturnValue({ isValid: true });
      mockTaskRepository.create.mockResolvedValue(mockTask);

      await service.createTask(requestWithoutDueAt);

      expect(mockTaskDomainService.validateDueDate).toHaveBeenCalledWith("", "one-time");
    });
  });

  describe("updateTask", () => {
    const updateRequest: UpdateTaskRequest = {
      text: "Updated task",
      dueAt: "2025-01-03T10:00:00Z",
      notification: {
        enabled: false,
        reminderMinutes: 60,
      },
    };

    it("should update task successfully", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeEdited.mockReturnValue(true);
      mockTaskDomainService.validateTaskText.mockReturnValue({ isValid: true });
      mockTaskDomainService.validateDueDate.mockReturnValue({ isValid: true });
      mockTaskRepository.update.mockResolvedValue({ ...mockTask, text: "Updated task" });

      const result = await service.updateTask("1", updateRequest);

      expect(result.success).toBe(true);
      expect(result.task?.text).toBe("Updated task");
      expect(mockTaskRepository.findById).toHaveBeenCalledWith("1");
      expect(mockTaskDomainService.canBeEdited).toHaveBeenCalledWith(mockTask);
      expect(mockTaskDomainService.validateTaskText).toHaveBeenCalledWith("Updated task");
      expect(mockTaskDomainService.validateDueDate).toHaveBeenCalledWith("2025-01-03T10:00:00Z", "one-time");
      expect(mockTaskRepository.update).toHaveBeenCalledWith("1", updateRequest);
    });

    it("should return error when task not found", async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await service.updateTask("999", updateRequest);

      expect(result).toEqual({ success: false, error: "Task not found" });
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it("should return error when task cannot be edited", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeEdited.mockReturnValue(false);

      const result = await service.updateTask("1", updateRequest);

      expect(result).toEqual({ success: false, error: "Task cannot be edited in its current state" });
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it("should return error when text validation fails", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeEdited.mockReturnValue(true);
      mockTaskDomainService.validateTaskText.mockReturnValue({
        isValid: false,
        error: "Task text cannot exceed 500 characters"
      });

      const result = await service.updateTask("1", updateRequest);

      expect(result).toEqual({ success: false, error: "Task text cannot exceed 500 characters" });
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it("should return error when due date validation fails", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeEdited.mockReturnValue(true);
      mockTaskDomainService.validateTaskText.mockReturnValue({ isValid: true });
      mockTaskDomainService.validateDueDate.mockReturnValue({
        isValid: false,
        error: "Due date cannot be in the past"
      });

      const result = await service.updateTask("1", updateRequest);

      expect(result).toEqual({ success: false, error: "Due date cannot be in the past" });
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it("should skip text validation when text is undefined", async () => {
      const requestWithoutText = { ...updateRequest, text: undefined };
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeEdited.mockReturnValue(true);
      mockTaskDomainService.validateDueDate.mockReturnValue({ isValid: true });
      mockTaskRepository.update.mockResolvedValue(mockTask);

      await service.updateTask("1", requestWithoutText);

      expect(mockTaskDomainService.validateTaskText).not.toHaveBeenCalled();
    });

    it("should skip due date validation when dueAt is undefined", async () => {
      const requestWithoutDueAt = { ...updateRequest, dueAt: undefined };
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeEdited.mockReturnValue(true);
      mockTaskDomainService.validateTaskText.mockReturnValue({ isValid: true });
      mockTaskRepository.update.mockResolvedValue(mockTask);

      await service.updateTask("1", requestWithoutDueAt);

      expect(mockTaskDomainService.validateDueDate).not.toHaveBeenCalled();
    });

    it("should handle repository error", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeEdited.mockReturnValue(true);
      mockTaskDomainService.validateTaskText.mockReturnValue({ isValid: true });
      mockTaskDomainService.validateDueDate.mockReturnValue({ isValid: true });
      mockTaskRepository.update.mockRejectedValue(new Error("Database error"));

      const result = await service.updateTask("1", updateRequest);

      expect(result).toEqual({ success: false, error: "Failed to update task" });
    });
  });

  describe("deleteTask", () => {
    it("should delete task successfully", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteTask("1");

      expect(result).toEqual({ success: true });
      expect(mockTaskRepository.findById).toHaveBeenCalledWith("1");
      expect(mockTaskRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should return error when task not found", async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await service.deleteTask("999");

      expect(result).toEqual({ success: false, error: "Task not found" });
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });

    it("should handle repository error", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.delete.mockRejectedValue(new Error("Database error"));

      const result = await service.deleteTask("1");

      expect(result).toEqual({ success: false, error: "Failed to delete task" });
    });
  });

  describe("activateTask", () => {
    it("should activate task successfully", async () => {
      const pendingTask = { ...mockTask, state: "pending" as const };
      mockTaskRepository.findById.mockResolvedValue(pendingTask);
      mockTaskDomainService.canBeActivated.mockReturnValue(true);
      mockTaskRepository.activate.mockResolvedValue({ ...pendingTask, state: "active" });

      const result = await service.activateTask("1");

      expect(result.success).toBe(true);
      expect(result.task?.state).toBe("active");
      expect(mockTaskRepository.findById).toHaveBeenCalledWith("1");
      expect(mockTaskDomainService.canBeActivated).toHaveBeenCalledWith(pendingTask);
      expect(mockTaskRepository.activate).toHaveBeenCalledWith("1");
    });

    it("should return error when task not found", async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await service.activateTask("999");

      expect(result).toEqual({ success: false, error: "Task not found" });
      expect(mockTaskRepository.activate).not.toHaveBeenCalled();
    });

    it("should return error when task cannot be activated", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeActivated.mockReturnValue(false);

      const result = await service.activateTask("1");

      expect(result).toEqual({ success: false, error: "Task cannot be activated in its current state" });
      expect(mockTaskRepository.activate).not.toHaveBeenCalled();
    });

    it("should handle repository error", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeActivated.mockReturnValue(true);
      mockTaskRepository.activate.mockRejectedValue(new Error("Database error"));

      const result = await service.activateTask("1");

      expect(result).toEqual({ success: false, error: "Failed to activate task" });
    });
  });

  describe("completeTask", () => {
    it("should complete task successfully", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeCompleted.mockReturnValue(true);
      mockTaskRepository.complete.mockResolvedValue({ ...mockTask, state: "completed" });

      const result = await service.completeTask("1");

      expect(result.success).toBe(true);
      expect(result.task?.state).toBe("completed");
      expect(mockTaskRepository.findById).toHaveBeenCalledWith("1");
      expect(mockTaskDomainService.canBeCompleted).toHaveBeenCalledWith(mockTask);
      expect(mockTaskRepository.complete).toHaveBeenCalledWith("1");
    });

    it("should return error when task not found", async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await service.completeTask("999");

      expect(result).toEqual({ success: false, error: "Task not found" });
      expect(mockTaskRepository.complete).not.toHaveBeenCalled();
    });

    it("should return error when task cannot be completed", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeCompleted.mockReturnValue(false);

      const result = await service.completeTask("1");

      expect(result).toEqual({ success: false, error: "Task cannot be completed in its current state" });
      expect(mockTaskRepository.complete).not.toHaveBeenCalled();
    });

    it("should handle repository error", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeCompleted.mockReturnValue(true);
      mockTaskRepository.complete.mockRejectedValue(new Error("Database error"));

      const result = await service.completeTask("1");

      expect(result).toEqual({ success: false, error: "Failed to complete task" });
    });
  });

  describe("failTask", () => {
    it("should fail task successfully", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeFailed.mockReturnValue(true);
      mockTaskRepository.fail.mockResolvedValue({ ...mockTask, state: "failed" });

      const result = await service.failTask("1");

      expect(result.success).toBe(true);
      expect(result.task?.state).toBe("failed");
      expect(mockTaskRepository.findById).toHaveBeenCalledWith("1");
      expect(mockTaskDomainService.canBeFailed).toHaveBeenCalledWith(mockTask);
      expect(mockTaskRepository.fail).toHaveBeenCalledWith("1");
    });

    it("should return error when task not found", async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await service.failTask("999");

      expect(result).toEqual({ success: false, error: "Task not found" });
      expect(mockTaskRepository.fail).not.toHaveBeenCalled();
    });

    it("should return error when task cannot be failed", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeFailed.mockReturnValue(false);

      const result = await service.failTask("1");

      expect(result).toEqual({ success: false, error: "Task cannot be failed in its current state" });
      expect(mockTaskRepository.fail).not.toHaveBeenCalled();
    });

    it("should handle repository error", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeFailed.mockReturnValue(true);
      mockTaskRepository.fail.mockRejectedValue(new Error("Database error"));

      const result = await service.failTask("1");

      expect(result).toEqual({ success: false, error: "Failed to mark task as failed" });
    });
  });

  describe("reactivateTask", () => {
    const completedTask = { ...mockTask, state: "completed" as const };
    const reactivateRequest: ReactivateTaskRequest = {
      newDueAt: "2025-01-04T10:00:00Z",
      notification: {
        enabled: true,
        reminderMinutes: 45,
      },
    };

    it("should reactivate task successfully with request", async () => {
      mockTaskRepository.findById.mockResolvedValue(completedTask);
      mockTaskDomainService.canBeReactivated.mockReturnValue(true);
      mockTaskDomainService.validateDueDate.mockReturnValue({ isValid: true });
      mockTaskRepository.reactivate.mockResolvedValue({ ...completedTask, state: "active" });

      const result = await service.reactivateTask("1", reactivateRequest);

      expect(result.success).toBe(true);
      expect(result.task?.state).toBe("active");
      expect(mockTaskRepository.findById).toHaveBeenCalledWith("1");
      expect(mockTaskDomainService.canBeReactivated).toHaveBeenCalledWith(completedTask);
      expect(mockTaskDomainService.validateDueDate).toHaveBeenCalledWith("2025-01-04T10:00:00Z", "one-time");
      expect(mockTaskRepository.reactivate).toHaveBeenCalledWith("1", reactivateRequest);
    });

    it("should reactivate task successfully without request", async () => {
      mockTaskRepository.findById.mockResolvedValue(completedTask);
      mockTaskDomainService.canBeReactivated.mockReturnValue(true);
      mockTaskRepository.reactivate.mockResolvedValue({ ...completedTask, state: "active" });

      const result = await service.reactivateTask("1");

      expect(result.success).toBe(true);
      expect(mockTaskDomainService.validateDueDate).not.toHaveBeenCalled();
      expect(mockTaskRepository.reactivate).toHaveBeenCalledWith("1", undefined);
    });

    it("should return error when task not found", async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await service.reactivateTask("999", reactivateRequest);

      expect(result).toEqual({ success: false, error: "Task not found" });
      expect(mockTaskRepository.reactivate).not.toHaveBeenCalled();
    });

    it("should return error when task cannot be reactivated", async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskDomainService.canBeReactivated.mockReturnValue(false);

      const result = await service.reactivateTask("1", reactivateRequest);

      expect(result).toEqual({ success: false, error: "Task cannot be reactivated in its current state" });
      expect(mockTaskRepository.reactivate).not.toHaveBeenCalled();
    });

    it("should return error when due date validation fails", async () => {
      mockTaskRepository.findById.mockResolvedValue(completedTask);
      mockTaskDomainService.canBeReactivated.mockReturnValue(true);
      mockTaskDomainService.validateDueDate.mockReturnValue({
        isValid: false,
        error: "Due date cannot be in the past"
      });

      const result = await service.reactivateTask("1", reactivateRequest);

      expect(result).toEqual({ success: false, error: "Due date cannot be in the past" });
      expect(mockTaskRepository.reactivate).not.toHaveBeenCalled();
    });

    it("should skip due date validation when newDueAt is not provided", async () => {
      const requestWithoutDueAt = { ...reactivateRequest, newDueAt: undefined };
      mockTaskRepository.findById.mockResolvedValue(completedTask);
      mockTaskDomainService.canBeReactivated.mockReturnValue(true);
      mockTaskRepository.reactivate.mockResolvedValue({ ...completedTask, state: "active" });

      await service.reactivateTask("1", requestWithoutDueAt);

      expect(mockTaskDomainService.validateDueDate).not.toHaveBeenCalled();
    });

    it("should handle repository error", async () => {
      mockTaskRepository.findById.mockResolvedValue(completedTask);
      mockTaskDomainService.canBeReactivated.mockReturnValue(true);
      mockTaskDomainService.validateDueDate.mockReturnValue({ isValid: true });
      mockTaskRepository.reactivate.mockRejectedValue(new Error("Database error"));

      const result = await service.reactivateTask("1", reactivateRequest);

      expect(result).toEqual({ success: false, error: "Failed to reactivate task" });
    });
  });

  describe("deleteAllCompletedTasks", () => {
    it("should delete all completed tasks successfully", async () => {
      mockTaskRepository.deleteCompleted.mockResolvedValue(undefined);

      const result = await service.deleteAllCompletedTasks();

      expect(result).toEqual({ success: true });
      expect(mockTaskRepository.deleteCompleted).toHaveBeenCalledOnce();
    });

    it("should handle repository error", async () => {
      mockTaskRepository.deleteCompleted.mockRejectedValue(new Error("Database error"));

      const result = await service.deleteAllCompletedTasks();

      expect(result).toEqual({ success: false, error: "Failed to delete completed tasks" });
    });
  });

  describe("deleteAllFailedTasks", () => {
    it("should delete all failed tasks successfully", async () => {
      mockTaskRepository.deleteFailed.mockResolvedValue(undefined);

      const result = await service.deleteAllFailedTasks();

      expect(result).toEqual({ success: true });
      expect(mockTaskRepository.deleteFailed).toHaveBeenCalledOnce();
    });

    it("should handle repository error", async () => {
      mockTaskRepository.deleteFailed.mockRejectedValue(new Error("Database error"));

      const result = await service.deleteAllFailedTasks();

      expect(result).toEqual({ success: false, error: "Failed to delete failed tasks" });
    });
  });
});