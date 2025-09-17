import type { TaskRepository } from "../../domain/repositories/TaskRepository";
import { TaskApplicationService } from "../../application/services/TaskApplicationService";
import { ApiTaskRepository } from "../adapters/ApiTaskRepository";

class ServiceContainer {
  private static instance: ServiceContainer;
  private _taskRepository?: TaskRepository;
  private _taskApplicationService?: TaskApplicationService;

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  get taskRepository(): TaskRepository {
    if (!this._taskRepository) {
      this._taskRepository = new ApiTaskRepository();
    }
    return this._taskRepository;
  }

  get taskApplicationService(): TaskApplicationService {
    if (!this._taskApplicationService) {
      this._taskApplicationService = new TaskApplicationService(this.taskRepository);
    }
    return this._taskApplicationService;
  }

  // For testing - allows injection of mock repositories
  setTaskRepository(repository: TaskRepository): void {
    this._taskRepository = repository;
    this._taskApplicationService = new TaskApplicationService(repository);
  }
}

export const serviceContainer = ServiceContainer.getInstance();