import type { TaskRepository } from "../../domain/repositories/TaskRepository";
import type { Task, CreateTaskRequest, UpdateTaskRequest, ReactivateTaskRequest } from "../../domain/entities/Task";
import { todoApi } from "../../services/api";
import type { Todo, CreateTodoRequest } from "../../services/api";

export class ApiTaskRepository implements TaskRepository {
  private mapTodoToTask(todo: Todo): Task {
    return {
      id: todo.id,
      text: todo.text,
      type: todo.type,
      state: todo.state,
      dueAt: todo.dueAt,
      createdAt: todo.createdAt,
      activatedAt: todo.activatedAt,
      completedAt: todo.completedAt,
      failedAt: todo.failedAt,
      updatedAt: todo.updatedAt,
      isReactivation: todo.isReactivation ?? false,
    };
  }

  private mapCreateTaskToTodo(request: CreateTaskRequest): CreateTodoRequest {
    return {
      text: request.text,
      type: request.type,
      dueAt: request.dueAt,
    };
  }

  private mapUpdateTaskToTodo(request: UpdateTaskRequest): { text?: string; dueAt?: string } {
    return {
      text: request.text,
      ...(request.dueAt !== undefined && { dueAt: request.dueAt }),
    };
  }

  async findAll(): Promise<Task[]> {
    const groupedTodos = await todoApi.getAllTodos();
    const allTodos = [
      ...groupedTodos.pending,
      ...groupedTodos.active,
      ...groupedTodos.completed,
      ...groupedTodos.failed,
    ];
    return allTodos.map(this.mapTodoToTask);
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const todo = await todoApi.getTodoById(id);
      return this.mapTodoToTask(todo);
    } catch {
      return null;
    }
  }

  async create(request: CreateTaskRequest): Promise<Task> {
    const todoRequest = this.mapCreateTaskToTodo(request);
    const todo = await todoApi.createTodo(todoRequest);
    return this.mapTodoToTask(todo);
  }

  async update(id: string, request: UpdateTaskRequest): Promise<Task> {
    const todoRequest = this.mapUpdateTaskToTodo(request);
    const todo = await todoApi.updateTodo(id, todoRequest);
    return this.mapTodoToTask(todo);
  }

  async delete(id: string): Promise<void> {
    await todoApi.deleteTodo(id);
  }

  async activate(id: string): Promise<Task> {
    const todo = await todoApi.activateTodo(id);
    return this.mapTodoToTask(todo);
  }

  async complete(id: string): Promise<Task> {
    const todo = await todoApi.completeTodo(id);
    return this.mapTodoToTask(todo);
  }

  async fail(id: string): Promise<Task> {
    const todo = await todoApi.failTodo(id);
    return this.mapTodoToTask(todo);
  }

  async reactivate(id: string, request?: ReactivateTaskRequest): Promise<Task> {
    const todo = await todoApi.reactivateTodo(id, request);
    return this.mapTodoToTask(todo);
  }

  async deleteCompleted(): Promise<void> {
    await todoApi.deleteCompletedTodos();
  }

  async deleteFailed(): Promise<void> {
    await todoApi.deleteFailedTodos();
  }
}