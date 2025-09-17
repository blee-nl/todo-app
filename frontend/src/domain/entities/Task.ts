import { TaskType, TaskState } from "../../constants/taskConstants";

export type TaskTypeValue = typeof TaskType[keyof typeof TaskType];
export type TaskStateValue = typeof TaskState[keyof typeof TaskState];

export interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number;
  notifiedAt?: Date;
}

export interface Task {
  id: string;
  text: string;
  type: TaskTypeValue;
  state: TaskStateValue;
  dueAt?: string;
  notification?: NotificationSettings;
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
  notification?: {
    enabled: boolean;
    reminderMinutes: number;
  };
}

export interface UpdateTaskRequest {
  text?: string;
  dueAt?: string;
  notification?: {
    enabled: boolean;
    reminderMinutes: number;
  };
}

export interface ReactivateTaskRequest {
  newDueAt?: string;
}