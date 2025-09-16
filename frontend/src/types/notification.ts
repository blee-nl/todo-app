export interface NotificationData {
  taskId: string;
  title: string;
  body: string;
  scheduledTime: Date;
  taskDueTime: Date;
}

export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: NotificationData;
  requireInteraction?: boolean;
}

export interface NotificationValidationResult {
  isValid: boolean;
  error?: string;
}

export interface TaskNotificationSettings {
  enabled: boolean;
  reminderMinutes: number;
  notifiedAt?: Date;
}

export type NotificationPermissionStatus = "default" | "granted" | "denied";

export interface ScheduledNotification {
  taskId: string;
  timeoutId: number;
  scheduledTime: Date;
}