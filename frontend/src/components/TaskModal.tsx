import React, { useState, useCallback } from "react";
import type { TaskType } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import { Button, Heading, Label, TextArea } from "../design-system";
import { TaskIcon, HabitIcon, XIcon } from "../assets/icons";
import { useTaskModalActions } from "./actions/TaskActions";
import { CancelButton, AddTaskButton } from "./TaskActionButtons";
import { TaskType as TaskTypeConstants, getTaskPlaceholder } from "../constants/taskConstants";
import NotificationTimePicker from "./NotificationTimePicker";
import { NotificationManager } from "../utils/notificationUtils";
import { NOTIFICATION_CONSTANTS } from "../constants/notificationConstants";
import { TIME_CONSTANTS } from "../constants/timeConstants";

// Constants
const PLACEHOLDERS = {
  TASK_DESCRIPTION: "What task needs to be done?",
  HABIT_DESCRIPTION: "What habit needs to be done?",
  DUE_DATE_TIME: "Select due date and time",
  ADD_TASK: "Add Task",
  ADDING: "Adding...",
  CANCEL: "Cancel",
} as const;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: TaskType;
  setTaskType: (taskType: TaskType) => void;
  onError?: (error: Error) => void;
  onTaskCreated?: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskType,
  setTaskType,
  onError,
  onTaskCreated,
}) => {
  const [text, setText] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState<number>(NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES);

  const { handleCreate, isCreating } = useTaskModalActions(onError);

  // Extract task type handlers
  const handleSelectOneTimeType = useCallback(() => {
    setTaskType(TaskTypeConstants.ONE_TIME);
  }, []);

  const handleSelectDailyType = useCallback(() => {
    setTaskType(TaskTypeConstants.DAILY);
  }, []);

  // Extract input handlers
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const handleReminderMinutesChange = useCallback((minutes: number) => {
    setReminderMinutes(minutes);
  }, []);

  // Calculate derived states
  const isOneTimeType = taskType === TaskTypeConstants.ONE_TIME;
  const isDailyType = taskType === TaskTypeConstants.DAILY;
  const dueDateLabel = isOneTimeType ? "Due Date & Time" : "Start Date & Time";
  const dueDatePlaceholder = isOneTimeType ? PLACEHOLDERS.DUE_DATE_TIME : "When should this daily task start?";
  const showNotificationSettings = Boolean(dueAt);

  // Calculate button disabled state
  const isSubmitDisabled = isCreating || !text.trim();

  const handleNotificationEnabledChange = useCallback(async (enabled: boolean) => {
    // Always update the state first to reflect user intent
    setNotificationEnabled(enabled);

    // Only request permission if enabling notifications
    if (enabled && NotificationManager.getPermissionStatus() !== 'granted') {
      try {
        const permission = await NotificationManager.requestPermission();
        if (permission !== 'granted') {
          // Show warning but keep the user's preference enabled
          // The notification will be saved to the database but won't actually fire
          onError?.(new Error('Notification permission denied. Notifications are enabled but won\'t work until you grant browser permission.'));
        }
      } catch (error) {
        // Show warning but keep the user's preference enabled
        onError?.(new Error('Failed to request notification permission. You can enable this later in browser settings.'));
      }
    }
  }, [onError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!text.trim()) return;

      try {
        const todoData = {
          text: text.trim(),
          type: taskType,
          ...(dueAt && { dueAt }),
          // Always include notification settings when dueAt is present
          ...(dueAt && {
            notification: {
              enabled: notificationEnabled,
              reminderMinutes,
            },
          }),
        };


        await handleCreate(todoData);
        setText("");
        setDueAt("");
        setNotificationEnabled(false);
        setReminderMinutes(NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES);
        onTaskCreated?.();
        onClose();
      } catch (error) {
        // Error is already handled by useTaskModalActions
        console.error("Failed to create todo:", error);
      }
    },
    [text, taskType, dueAt, notificationEnabled, reminderMinutes, handleCreate, onClose, onTaskCreated]
  );

  const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + TIME_CONSTANTS.ONE_MINUTE);
    return now.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Heading level={3}>Add New Task</Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
              leftIcon={<XIcon size="sm" />}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Task Type */}
          <div>
            <Label className="mb-2">Task Type</Label>
            <div className="flex space-x-2" data-testid="todo-type-select">
              <Button
                type="button"
                variant={isOneTimeType ? "primary" : "secondary"}
                size="md"
                className="flex-1"
                onClick={handleSelectOneTimeType}
                leftIcon={<TaskIcon size="sm" />}
                data-testid="todo-type-one-time"
              >
                One-time
              </Button>
              <Button
                type="button"
                variant={isDailyType ? "success" : "secondary"}
                size="md"
                className="flex-1"
                onClick={handleSelectDailyType}
                leftIcon={<HabitIcon size="sm" />}
                data-testid="todo-type-daily"
              >
                Daily
              </Button>
            </div>
          </div>

          {/* Task Text */}
          <TextArea
            label="Task Description"
            value={text}
            onChange={handleTextChange}
            placeholder={getTaskPlaceholder(taskType)}
            rows={3}
            disabled={isCreating}
            maxLength={500}
            characterCount={{
              current: text.length,
              max: 500,
            }}
            data-testid="todo-input"
          />

          {/* Due Date & Time */}
          <div>
            <Label htmlFor="modal-due-date" className="mb-2">
              {dueDateLabel}
            </Label>
            <CustomDateTimePicker
              id="modal-due-date"
              value={dueAt}
              onChange={setDueAt}
              min={getMinDate()}
              disabled={isCreating}
              placeholder={dueDatePlaceholder}
            />
          </div>

          {/* Notification Settings */}
          {showNotificationSettings && (
            <div className="border-t pt-4">
              <NotificationTimePicker
                enabled={notificationEnabled}
                reminderMinutes={reminderMinutes}
                onEnabledChange={handleNotificationEnabledChange}
                onReminderMinutesChange={handleReminderMinutesChange}
                dueAt={dueAt}
                taskType={taskType}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <CancelButton
              onClick={onClose}
              disabled={isCreating}
              className="flex-1"
            />
            <AddTaskButton
              type="submit"
              disabled={isSubmitDisabled}
              isLoading={isCreating}
              className="flex-1"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
