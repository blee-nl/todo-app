import type { Task, TaskTypeValue, TaskStateValue } from "../entities/Task";
import { TaskType, TaskState } from "../../constants/taskConstants";

export class TaskDomainService {
  static isOneTimeTask(type: TaskTypeValue): boolean {
    return type === TaskType.ONE_TIME;
  }

  static isDailyTask(type: TaskTypeValue): boolean {
    return type === TaskType.DAILY;
  }

  static isPendingTask(state: TaskStateValue): boolean {
    return state === TaskState.PENDING;
  }

  static isActiveTask(state: TaskStateValue): boolean {
    return state === TaskState.ACTIVE;
  }

  static isCompletedTask(state: TaskStateValue): boolean {
    return state === TaskState.COMPLETED;
  }

  static isFailedTask(state: TaskStateValue): boolean {
    return state === TaskState.FAILED;
  }

  static isOverdue(task: Task): boolean {
    if (!task.dueAt) return false;
    return new Date(task.dueAt) < new Date();
  }

  static canBeActivated(task: Task): boolean {
    return this.isPendingTask(task.state);
  }

  static canBeCompleted(task: Task): boolean {
    return this.isActiveTask(task.state);
  }

  static canBeFailed(task: Task): boolean {
    return this.isActiveTask(task.state);
  }

  static canBeReactivated(task: Task): boolean {
    return this.isCompletedTask(task.state) || this.isFailedTask(task.state);
  }

  static canBeEdited(task: Task): boolean {
    return this.isPendingTask(task.state) || this.isActiveTask(task.state);
  }

  static requiresDueDate(type: TaskTypeValue): boolean {
    return this.isOneTimeTask(type);
  }

  static validateTaskText(text: string): { isValid: boolean; error?: string } {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return { isValid: false, error: "Task text cannot be empty" };
    }

    if (trimmedText.length > 500) {
      return { isValid: false, error: "Task text cannot exceed 500 characters" };
    }

    return { isValid: true };
  }

  static validateDueDate(dueDate: string, type: TaskTypeValue): { isValid: boolean; error?: string } {
    if (!dueDate && this.requiresDueDate(type)) {
      return { isValid: false, error: "Due date is required for one-time tasks" };
    }

    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        return { isValid: false, error: "Invalid due date format" };
      }

      if (date < new Date()) {
        return { isValid: false, error: "Due date cannot be in the past" };
      }
    }

    return { isValid: true };
  }

  static getTaskDisplayBadges(task: Task): Array<{ variant: 'success' | 'purple' | 'danger'; text: string }> {
    const badges = [];

    badges.push({ variant: 'success' as const, text: task.type });

    if (task.isReactivation) {
      badges.push({ variant: 'purple' as const, text: 'Re-activated' });
    }

    if (this.isOverdue(task)) {
      badges.push({ variant: 'danger' as const, text: 'Overdue' });
    }

    return badges;
  }

  static getTaskPriority(task: Task): number {
    if (this.isOverdue(task)) return 1;
    if (this.isActiveTask(task.state)) return 2;
    if (this.isPendingTask(task.state)) return 3;
    if (this.isFailedTask(task.state)) return 4;
    if (this.isCompletedTask(task.state)) return 5;
    return 6;
  }
}