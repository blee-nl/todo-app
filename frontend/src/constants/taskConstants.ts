import type { TaskType as APITaskType, TaskState as APITaskState } from '../services/api';

/**
 * Task Type Constants
 * Modern const assertion approach providing enum-like functionality
 */
export const TaskType = {
  ONE_TIME: 'one-time',
  DAILY: 'daily',
} as const;

/**
 * Task State Constants
 * Provides type safety and IntelliSense support
 */
export const TaskState = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

/**
 * Card Variant Constants
 * Constants for card style variations
 */
export const CardVariant = {
  DEFAULT: 'default',
  ACTIVE: 'active',
  OVERDUE: 'overdue',
  FAILED: 'failed',
} as const;

/**
 * Loading State Text Constants
 * Manages loading state text labels
 */
export const LoadingText = {
  ADDING: 'Adding...',
  ADD_TASK: 'Add Task',
  SAVING: 'Saving...',
  SAVE: 'Save',
  LOADING: 'Loading...',
} as const;

/**
 * Action Text Constants
 * Manages button and action text labels
 */
export const ActionText = {
  DELETE: 'Delete',
  EDIT: 'Edit',
  CANCEL: 'Cancel',
  SAVE: 'Save',
  DELETE_ALL_COMPLETED: 'Delete All Completed',
  DELETE_ALL_FAILED: 'Delete All Failed',
  ACTIVATE: 'Activate',
  COMPLETE: 'Complete',
  FAIL: 'Fail',
  REACTIVATE: 'Reactivate',
} as const;

/**
 * Type Guards
 * Safer and clearer type checking using constants
 */
export const isOneTimeTask = (type: APITaskType): type is 'one-time' => {
  return type === TaskType.ONE_TIME;
};

export const isDailyTask = (type: APITaskType): type is 'daily' => {
  return type === TaskType.DAILY;
};

export const isPendingTask = (state: APITaskState): state is 'pending' => {
  return state === TaskState.PENDING;
};

export const isActiveTask = (state: APITaskState): state is 'active' => {
  return state === TaskState.ACTIVE;
};

export const isCompletedTask = (state: APITaskState): state is 'completed' => {
  return state === TaskState.COMPLETED;
};

export const isFailedTask = (state: APITaskState): state is 'failed' => {
  return state === TaskState.FAILED;
};

export const isCompletedOrFailedTask = (state: APITaskState): state is 'completed' | 'failed' => {
  return isCompletedTask(state) || isFailedTask(state);
};

/**
 * Type Definitions
 * Types derived from const assertions
 */
export type TaskType = typeof TaskType[keyof typeof TaskType];
export type TaskState = typeof TaskState[keyof typeof TaskState];
export type CardVariant = typeof CardVariant[keyof typeof CardVariant];
export type LoadingText = typeof LoadingText[keyof typeof LoadingText];
export type ActionText = typeof ActionText[keyof typeof ActionText];

/**
 * Task Type UI Configuration
 * Maps task types to UI settings using const assertions
 */
export const TASK_TYPE_CONFIG = {
  [TaskType.ONE_TIME]: {
    label: 'One-time',
    iconType: 'task' as const,
    description: 'One-time tasks have a specific deadline',
    placeholderType: 'task',
  },
  [TaskType.DAILY]: {
    label: 'Daily',
    iconType: 'habit' as const,
    description: 'Daily tasks repeat every day at midnight',
    placeholderType: 'habit',
  },
} as const;

/**
 * Task State UI Configuration
 * Maps task states to UI settings using const assertions
 */
export const TASK_STATE_CONFIG = {
  [TaskState.PENDING]: {
    label: 'Pending',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  [TaskState.ACTIVE]: {
    label: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  [TaskState.COMPLETED]: {
    label: 'Completed',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  [TaskState.FAILED]: {
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
} as const;

/**
 * Validation Arrays
 * Validation arrays composed of const assertion values - replaces hardcoded arrays
 */
export const VALID_TASK_TYPES: readonly APITaskType[] = [
  TaskType.ONE_TIME,
  TaskType.DAILY
] as const;

export const VALID_TASK_STATES: readonly APITaskState[] = [
  TaskState.PENDING,
  TaskState.ACTIVE,
  TaskState.COMPLETED,
  TaskState.FAILED
] as const;

/**
 * Utility Functions
 * Safer utility functions leveraging const assertions
 */

/**
 * Returns card variant based on task state
 */
export const getCardVariant = (state: APITaskState) => {
  switch (state) {
    case TaskState.ACTIVE:
      return CardVariant.ACTIVE;
    case TaskState.FAILED:
      return CardVariant.FAILED;
    case TaskState.PENDING:
    case TaskState.COMPLETED:
    default:
      return CardVariant.DEFAULT;
  }
};

/**
 * Generates placeholder text based on task type
 */
export const getTaskPlaceholder = (taskType: APITaskType): string => {
  const config = TASK_TYPE_CONFIG[taskType];
  return `What ${config.placeholderType} needs to be done?`;
};

/**
 * Navigation Tab Configuration
 * Tab configuration based on const assertions - replaces inline definitions
 */
export const TASK_STATE_TABS = [
  {
    label: TASK_STATE_CONFIG[TaskState.PENDING].label,
    state: TaskState.PENDING,
    icon: 'clock' as const,
  },
  {
    label: TASK_STATE_CONFIG[TaskState.ACTIVE].label,
    state: TaskState.ACTIVE,
    icon: 'task' as const,
  },
  {
    label: TASK_STATE_CONFIG[TaskState.COMPLETED].label,
    state: TaskState.COMPLETED,
    icon: 'success' as const,
  },
  {
    label: TASK_STATE_CONFIG[TaskState.FAILED].label,
    state: TaskState.FAILED,
    icon: 'error' as const,
  },
] as const;

/**
 * Task Type Button Configuration
 * Button configuration based on const assertions
 */
export const TASK_TYPE_BUTTONS = [
  {
    type: TaskType.ONE_TIME,
    label: TASK_TYPE_CONFIG[TaskType.ONE_TIME].label,
    variant: 'primary' as const,
  },
  {
    type: TaskType.DAILY,
    label: TASK_TYPE_CONFIG[TaskType.DAILY].label,
    variant: 'success' as const,
  },
] as const;

/**
 * Default Values
 * Default values for consistent initialization - using const assertions
 */
export const DEFAULT_VALUES = {
  TASK_TYPE: TaskType.ONE_TIME,
  TASK_STATE: TaskState.PENDING,
} as const;