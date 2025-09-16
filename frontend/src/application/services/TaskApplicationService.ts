import type { Task, CreateTaskRequest, UpdateTaskRequest, ReactivateTaskRequest } from "../../domain/entities/Task";
import { TaskDomainService } from "../../domain/services/TaskDomainService";
import type { TaskRepository } from "../../domain/repositories/TaskRepository";

export class TaskApplicationService {
  private taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async getAllTasks(): Promise<Task[]> {
    return await this.taskRepository.findAll();
  }

  async getTaskById(id: string): Promise<Task | null> {
    return await this.taskRepository.findById(id);
  }

  async createTask(request: CreateTaskRequest): Promise<{ success: boolean; task?: Task; error?: string }> {
    const textValidation = TaskDomainService.validateTaskText(request.text);
    if (!textValidation.isValid) {
      return { success: false, error: textValidation.error };
    }

    const dueDateValidation = TaskDomainService.validateDueDate(request.dueAt || "", request.type);
    if (!dueDateValidation.isValid) {
      return { success: false, error: dueDateValidation.error };
    }

    try {
      const task = await this.taskRepository.create(request);
      return { success: true, task };
    } catch {
      return { success: false, error: "Failed to create task" };
    }
  }

  async updateTask(id: string, request: UpdateTaskRequest): Promise<{ success: boolean; task?: Task; error?: string }> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    if (!TaskDomainService.canBeEdited(existingTask)) {
      return { success: false, error: "Task cannot be edited in its current state" };
    }

    if (request.text !== undefined) {
      const textValidation = TaskDomainService.validateTaskText(request.text);
      if (!textValidation.isValid) {
        return { success: false, error: textValidation.error };
      }
    }

    if (request.dueAt !== undefined) {
      const dueDateValidation = TaskDomainService.validateDueDate(request.dueAt, existingTask.type);
      if (!dueDateValidation.isValid) {
        return { success: false, error: dueDateValidation.error };
      }
    }

    try {
      const task = await this.taskRepository.update(id, request);
      return { success: true, task };
    } catch {
      return { success: false, error: "Failed to update task" };
    }
  }

  async deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    try {
      await this.taskRepository.delete(id);
      return { success: true };
    } catch {
      return { success: false, error: "Failed to delete task" };
    }
  }

  async activateTask(id: string): Promise<{ success: boolean; task?: Task; error?: string }> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    if (!TaskDomainService.canBeActivated(existingTask)) {
      return { success: false, error: "Task cannot be activated in its current state" };
    }

    try {
      const task = await this.taskRepository.activate(id);
      return { success: true, task };
    } catch {
      return { success: false, error: "Failed to activate task" };
    }
  }

  async completeTask(id: string): Promise<{ success: boolean; task?: Task; error?: string }> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    if (!TaskDomainService.canBeCompleted(existingTask)) {
      return { success: false, error: "Task cannot be completed in its current state" };
    }

    try {
      const task = await this.taskRepository.complete(id);
      return { success: true, task };
    } catch {
      return { success: false, error: "Failed to complete task" };
    }
  }

  async failTask(id: string): Promise<{ success: boolean; task?: Task; error?: string }> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    if (!TaskDomainService.canBeFailed(existingTask)) {
      return { success: false, error: "Task cannot be failed in its current state" };
    }

    try {
      const task = await this.taskRepository.fail(id);
      return { success: true, task };
    } catch {
      return { success: false, error: "Failed to mark task as failed" };
    }
  }

  async reactivateTask(id: string, request?: ReactivateTaskRequest): Promise<{ success: boolean; task?: Task; error?: string }> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    if (!TaskDomainService.canBeReactivated(existingTask)) {
      return { success: false, error: "Task cannot be reactivated in its current state" };
    }

    if (request?.newDueAt) {
      const dueDateValidation = TaskDomainService.validateDueDate(request.newDueAt, existingTask.type);
      if (!dueDateValidation.isValid) {
        return { success: false, error: dueDateValidation.error };
      }
    }

    try {
      const task = await this.taskRepository.reactivate(id, request);
      return { success: true, task };
    } catch {
      return { success: false, error: "Failed to reactivate task" };
    }
  }

  async deleteAllCompletedTasks(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.taskRepository.deleteCompleted();
      return { success: true };
    } catch {
      return { success: false, error: "Failed to delete completed tasks" };
    }
  }

  async deleteAllFailedTasks(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.taskRepository.deleteFailed();
      return { success: true };
    } catch {
      return { success: false, error: "Failed to delete failed tasks" };
    }
  }
}