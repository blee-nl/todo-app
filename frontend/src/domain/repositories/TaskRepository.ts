import type { Task, CreateTaskRequest, UpdateTaskRequest, ReactivateTaskRequest } from "../entities/Task";

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(request: CreateTaskRequest): Promise<Task>;
  update(id: string, request: UpdateTaskRequest): Promise<Task>;
  delete(id: string): Promise<void>;
  activate(id: string): Promise<Task>;
  complete(id: string): Promise<Task>;
  fail(id: string): Promise<Task>;
  reactivate(id: string, request?: ReactivateTaskRequest): Promise<Task>;
  deleteCompleted(): Promise<void>;
  deleteFailed(): Promise<void>;
}