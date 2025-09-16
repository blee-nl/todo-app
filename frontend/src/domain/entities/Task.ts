import { TaskType, TaskState } from "../../constants/taskConstants";

export type TaskTypeValue = typeof TaskType[keyof typeof TaskType];
export type TaskStateValue = typeof TaskState[keyof typeof TaskState];

export interface Task {
  id: string;
  text: string;
  type: TaskTypeValue;
  state: TaskStateValue;
  dueAt?: string;
  createdAt: string;
  activatedAt?: string;
  completedAt?: string;
  failedAt?: string;
  updatedAt: string;
  isReactivation: boolean;
}

export interface CreateTaskRequest {
  text: string;
  type: TaskTypeValue;
  dueAt?: string;
}

export interface UpdateTaskRequest {
  text?: string;
  dueAt?: string;
}

export interface ReactivateTaskRequest {
  newDueAt?: string;
}