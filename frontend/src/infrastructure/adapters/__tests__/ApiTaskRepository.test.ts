import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiTaskRepository } from "../ApiTaskRepository";
import { todoApi } from "../../../services/api";
import type { Todo, GroupedTodos } from "../../../services/api";
import type { Task, CreateTaskRequest, UpdateTaskRequest, ReactivateTaskRequest } from "../../../domain/entities/Task";

// Mock the API
vi.mock("../../../services/api", () => ({
  todoApi: {
    getAllTodos: vi.fn(),
    getTodoById: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    activateTodo: vi.fn(),
    completeTodo: vi.fn(),
    failTodo: vi.fn(),
    reactivateTodo: vi.fn(),
    deleteCompletedTodos: vi.fn(),
    deleteFailedTodos: vi.fn(),
  },
}));

const mockTodoApi = todoApi as any;

describe("ApiTaskRepository", () => {
  let repository: ApiTaskRepository;

  const mockTodo: Todo = {
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
      notifiedAt: "2025-01-01T09:00:00Z",
    },
  };

  const expectedTask: Task = {
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
    repository = new ApiTaskRepository();
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all tasks from all states", async () => {
      const mockGroupedTodos: GroupedTodos = {
        pending: [{ ...mockTodo, state: "pending" }],
        active: [mockTodo],
        completed: [{ ...mockTodo, state: "completed" }],
        failed: [{ ...mockTodo, state: "failed" }],
      };

      mockTodoApi.getAllTodos.mockResolvedValue(mockGroupedTodos);

      const result = await repository.findAll();

      expect(result).toHaveLength(4);
      expect(result[0].state).toBe("pending");
      expect(result[1].state).toBe("active");
      expect(result[2].state).toBe("completed");
      expect(result[3].state).toBe("failed");
      expect(mockTodoApi.getAllTodos).toHaveBeenCalledOnce();
    });

    it("should handle empty grouped todos", async () => {
      const mockGroupedTodos: GroupedTodos = {
        pending: [],
        active: [],
        completed: [],
        failed: [],
      };

      mockTodoApi.getAllTodos.mockResolvedValue(mockGroupedTodos);

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });

    it("should map todos to tasks correctly", async () => {
      const mockGroupedTodos: GroupedTodos = {
        pending: [],
        active: [mockTodo],
        completed: [],
        failed: [],
      };

      mockTodoApi.getAllTodos.mockResolvedValue(mockGroupedTodos);

      const result = await repository.findAll();

      expect(result[0]).toEqual(expectedTask);
    });
  });

  describe("findById", () => {
    it("should return a task when found", async () => {
      mockTodoApi.getTodoById.mockResolvedValue(mockTodo);

      const result = await repository.findById("1");

      expect(result).toEqual(expectedTask);
      expect(mockTodoApi.getTodoById).toHaveBeenCalledWith("1");
    });

    it("should return null when task not found", async () => {
      mockTodoApi.getTodoById.mockRejectedValue(new Error("Not found"));

      const result = await repository.findById("999");

      expect(result).toBeNull();
    });

    it("should return null on any error", async () => {
      mockTodoApi.getTodoById.mockRejectedValue(new Error("Network error"));

      const result = await repository.findById("1");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a task successfully", async () => {
      const createRequest: CreateTaskRequest = {
        text: "New task",
        type: "one-time",
        dueAt: "2025-01-02T10:00:00Z",
        notification: {
          enabled: true,
          reminderMinutes: 15,
        },
      };

      const expectedTodoRequest = {
        text: "New task",
        type: "one-time",
        dueAt: "2025-01-02T10:00:00Z",
        notification: {
          enabled: true,
          reminderMinutes: 15,
        },
      };

      mockTodoApi.createTodo.mockResolvedValue(mockTodo);

      const result = await repository.create(createRequest);

      expect(result).toEqual(expectedTask);
      expect(mockTodoApi.createTodo).toHaveBeenCalledWith(expectedTodoRequest);
    });

    it("should create a task without notification", async () => {
      const createRequest: CreateTaskRequest = {
        text: "Simple task",
        type: "daily",
      };

      mockTodoApi.createTodo.mockResolvedValue(mockTodo);

      await repository.create(createRequest);

      expect(mockTodoApi.createTodo).toHaveBeenCalledWith({
        text: "Simple task",
        type: "daily",
        dueAt: undefined,
        notification: undefined,
      });
    });
  });

  describe("update", () => {
    it("should update a task with all fields", async () => {
      const updateRequest: UpdateTaskRequest = {
        text: "Updated task",
        dueAt: "2025-01-03T10:00:00Z",
        notification: {
          enabled: false,
          reminderMinutes: 60,
        },
      };

      mockTodoApi.updateTodo.mockResolvedValue(mockTodo);

      const result = await repository.update("1", updateRequest);

      expect(result).toEqual(expectedTask);
      expect(mockTodoApi.updateTodo).toHaveBeenCalledWith("1", {
        text: "Updated task",
        dueAt: "2025-01-03T10:00:00Z",
        notification: {
          enabled: false,
          reminderMinutes: 60,
        },
      });
    });

    it("should update a task with partial fields", async () => {
      const updateRequest: UpdateTaskRequest = {
        text: "Updated text only",
      };

      mockTodoApi.updateTodo.mockResolvedValue(mockTodo);

      await repository.update("1", updateRequest);

      expect(mockTodoApi.updateTodo).toHaveBeenCalledWith("1", {
        text: "Updated text only",
      });
    });

    it("should handle undefined dueAt correctly", async () => {
      const updateRequest: UpdateTaskRequest = {
        text: "Updated task",
        dueAt: undefined,
      };

      mockTodoApi.updateTodo.mockResolvedValue(mockTodo);

      await repository.update("1", updateRequest);

      expect(mockTodoApi.updateTodo).toHaveBeenCalledWith("1", {
        text: "Updated task",
      });
    });
  });

  describe("delete", () => {
    it("should delete a task", async () => {
      mockTodoApi.deleteTodo.mockResolvedValue({ id: "1" });

      await repository.delete("1");

      expect(mockTodoApi.deleteTodo).toHaveBeenCalledWith("1");
    });
  });

  describe("activate", () => {
    it("should activate a task", async () => {
      mockTodoApi.activateTodo.mockResolvedValue(mockTodo);

      const result = await repository.activate("1");

      expect(result).toEqual(expectedTask);
      expect(mockTodoApi.activateTodo).toHaveBeenCalledWith("1");
    });
  });

  describe("complete", () => {
    it("should complete a task", async () => {
      const completedTodo = { ...mockTodo, state: "completed" as const };
      mockTodoApi.completeTodo.mockResolvedValue(completedTodo);

      const result = await repository.complete("1");

      expect(result.state).toBe("completed");
      expect(mockTodoApi.completeTodo).toHaveBeenCalledWith("1");
    });
  });

  describe("fail", () => {
    it("should fail a task", async () => {
      const failedTodo = { ...mockTodo, state: "failed" as const };
      mockTodoApi.failTodo.mockResolvedValue(failedTodo);

      const result = await repository.fail("1");

      expect(result.state).toBe("failed");
      expect(mockTodoApi.failTodo).toHaveBeenCalledWith("1");
    });
  });

  describe("reactivate", () => {
    it("should reactivate a task with request", async () => {
      const reactivateRequest: ReactivateTaskRequest = {
        newDueAt: "2025-01-04T10:00:00Z",
        notification: {
          enabled: true,
          reminderMinutes: 45,
        },
      };

      mockTodoApi.reactivateTodo.mockResolvedValue(mockTodo);

      const result = await repository.reactivate("1", reactivateRequest);

      expect(result).toEqual(expectedTask);
      expect(mockTodoApi.reactivateTodo).toHaveBeenCalledWith("1", reactivateRequest);
    });

    it("should reactivate a task without request", async () => {
      mockTodoApi.reactivateTodo.mockResolvedValue(mockTodo);

      const result = await repository.reactivate("1");

      expect(result).toEqual(expectedTask);
      expect(mockTodoApi.reactivateTodo).toHaveBeenCalledWith("1", undefined);
    });
  });

  describe("deleteCompleted", () => {
    it("should delete all completed tasks", async () => {
      mockTodoApi.deleteCompletedTodos.mockResolvedValue({ deletedCount: 5 });

      await repository.deleteCompleted();

      expect(mockTodoApi.deleteCompletedTodos).toHaveBeenCalledOnce();
    });
  });

  describe("deleteFailed", () => {
    it("should delete all failed tasks", async () => {
      mockTodoApi.deleteFailedTodos.mockResolvedValue({ deletedCount: 3 });

      await repository.deleteFailed();

      expect(mockTodoApi.deleteFailedTodos).toHaveBeenCalledOnce();
    });
  });

  describe("mapping functions", () => {
    describe("mapTodoToTask", () => {
      it("should map todo with notification correctly", () => {
        const todoWithNotification: Todo = {
          ...mockTodo,
          notification: {
            enabled: true,
            reminderMinutes: 30,
            notifiedAt: "2025-01-01T09:00:00Z",
          },
        };

        const result = (repository as any).mapTodoToTask(todoWithNotification);

        expect(result.notification).toEqual({
          enabled: true,
          reminderMinutes: 30,
          notifiedAt: new Date("2025-01-01T09:00:00Z"),
        });
      });

      it("should map todo without notification", () => {
        const todoWithoutNotification: Todo = {
          ...mockTodo,
          notification: undefined,
        };

        const result = (repository as any).mapTodoToTask(todoWithoutNotification);

        expect(result.notification).toBeUndefined();
      });

      it("should handle notification without notifiedAt", () => {
        const todoWithPartialNotification: Todo = {
          ...mockTodo,
          notification: {
            enabled: false,
            reminderMinutes: 15,
          },
        };

        const result = (repository as any).mapTodoToTask(todoWithPartialNotification);

        expect(result.notification).toEqual({
          enabled: false,
          reminderMinutes: 15,
          notifiedAt: undefined,
        });
      });

      it("should handle missing isReactivation field", () => {
        const todoWithoutReactivation: Todo = {
          ...mockTodo,
          isReactivation: undefined,
        };

        const result = (repository as any).mapTodoToTask(todoWithoutReactivation);

        expect(result.isReactivation).toBe(false);
      });
    });

    describe("mapCreateTaskToTodo", () => {
      it("should map create request correctly", () => {
        const createRequest: CreateTaskRequest = {
          text: "Test task",
          type: "one-time",
          dueAt: "2025-01-01T10:00:00Z",
          notification: {
            enabled: true,
            reminderMinutes: 30,
          },
        };

        const result = (repository as any).mapCreateTaskToTodo(createRequest);

        expect(result).toEqual({
          text: "Test task",
          type: "one-time",
          dueAt: "2025-01-01T10:00:00Z",
          notification: {
            enabled: true,
            reminderMinutes: 30,
          },
        });
      });
    });

    describe("mapUpdateTaskToTodo", () => {
      it("should map update request with all fields", () => {
        const updateRequest: UpdateTaskRequest = {
          text: "Updated task",
          dueAt: "2025-01-02T10:00:00Z",
          notification: {
            enabled: false,
            reminderMinutes: 60,
          },
        };

        const result = (repository as any).mapUpdateTaskToTodo(updateRequest);

        expect(result).toEqual({
          text: "Updated task",
          dueAt: "2025-01-02T10:00:00Z",
          notification: {
            enabled: false,
            reminderMinutes: 60,
          },
        });
      });

      it("should exclude undefined dueAt", () => {
        const updateRequest: UpdateTaskRequest = {
          text: "Updated task",
          dueAt: undefined,
        };

        const result = (repository as any).mapUpdateTaskToTodo(updateRequest);

        expect(result).toEqual({
          text: "Updated task",
        });
        expect(result).not.toHaveProperty("dueAt");
      });

      it("should exclude undefined notification", () => {
        const updateRequest: UpdateTaskRequest = {
          text: "Updated task",
          notification: undefined,
        };

        const result = (repository as any).mapUpdateTaskToTodo(updateRequest);

        expect(result).toEqual({
          text: "Updated task",
        });
        expect(result).not.toHaveProperty("notification");
      });
    });
  });

  describe("error handling", () => {
    it("should propagate errors from API calls except for findById", async () => {
      const error = new Error("API Error");

      mockTodoApi.createTodo.mockRejectedValue(error);
      await expect(repository.create({ text: "test", type: "daily" })).rejects.toThrow(error);

      mockTodoApi.updateTodo.mockRejectedValue(error);
      await expect(repository.update("1", { text: "test" })).rejects.toThrow(error);

      mockTodoApi.deleteTodo.mockRejectedValue(error);
      await expect(repository.delete("1")).rejects.toThrow(error);

      mockTodoApi.activateTodo.mockRejectedValue(error);
      await expect(repository.activate("1")).rejects.toThrow(error);

      mockTodoApi.completeTodo.mockRejectedValue(error);
      await expect(repository.complete("1")).rejects.toThrow(error);

      mockTodoApi.failTodo.mockRejectedValue(error);
      await expect(repository.fail("1")).rejects.toThrow(error);

      mockTodoApi.reactivateTodo.mockRejectedValue(error);
      await expect(repository.reactivate("1")).rejects.toThrow(error);
    });
  });
});