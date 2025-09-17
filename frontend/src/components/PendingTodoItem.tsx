import React, { useState, useCallback } from "react";
import type { Todo } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import { Input } from "../design-system";
import TodoListItem from "./TodoListItem";
import { usePendingTaskActions } from "./actions/TaskActions";
import {
  SaveButton,
  CancelButton,
  ActivateButton,
  DeleteButton,
} from "./TaskActionButtons";
import NotificationTimePicker from "./NotificationTimePicker";
import { NOTIFICATION_CONSTANTS } from "../constants/notificationConstants";

interface PendingTodoItemProps {
  todo: Todo;
  onError?: (error: Error) => void;
}

const PendingTodoItem: React.FC<PendingTodoItemProps> = ({ todo, onError }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDueAt, setEditDueAt] = useState(todo.dueAt || "");
  const [notificationEnabled, setNotificationEnabled] = useState(todo.notification?.enabled || false);
  const [reminderMinutes, setReminderMinutes] = useState(todo.notification?.reminderMinutes || NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES);

  const {
    activateTask,
    deleteTask,
    saveTaskEdits: saveAction,
    cancelTaskEdits: cancelAction,
    handleTaskEditKeyDown: keyDownAction,
    activateTaskMutation,
    deleteTaskMutation,
    updateTaskMutation,
  } = usePendingTaskActions(todo, onError);

  const handleSave = useCallback(async () => {
    const notificationData = editDueAt ? {
      enabled: notificationEnabled,
      reminderMinutes: reminderMinutes
    } : undefined;
    await saveAction(editText, editDueAt, setIsEditing, notificationData);
  }, [saveAction, editText, editDueAt, notificationEnabled, reminderMinutes]);

  const handleCancel = useCallback(() => {
    cancelAction(setEditText, setEditDueAt, setIsEditing, setNotificationEnabled, setReminderMinutes);
  }, [cancelAction]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      keyDownAction(e, handleSave, handleCancel);
    },
    [keyDownAction, handleSave, handleCancel]
  );

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  }, []);

  return (
    <TodoListItem
      todo={todo}
      cardVariant="default"
      cardClassName="hover:shadow-md transition-all duration-200"
      onTextClick={handleStartEdit}
    >
      {isEditing ? (
        <div className="space-y-3">
          <Input
            type="text"
            value={editText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            autoFocus
            maxLength={500}
          />
          {todo.type === "one-time" && (
            <CustomDateTimePicker
              value={editDueAt}
              onChange={setEditDueAt}
              placeholder="Select due date and time"
            />
          )}

          {editDueAt && (
            <div className="border-t pt-3">
              <NotificationTimePicker
                enabled={notificationEnabled}
                reminderMinutes={reminderMinutes}
                onEnabledChange={setNotificationEnabled}
                onReminderMinutesChange={setReminderMinutes}
                dueAt={editDueAt}
                taskType={todo.type}
              />
            </div>
          )}
          <div className="flex space-x-2">
            <SaveButton
              onClick={handleSave}
              disabled={updateTaskMutation.isPending}
              isLoading={updateTaskMutation.isPending}
              size="sm"
            />

            <CancelButton onClick={handleCancel} size="sm" />
          </div>
        </div>
      ) : (
        <>
          <ActivateButton
            onClick={activateTask}
            disabled={activateTaskMutation.isPending}
            isLoading={activateTaskMutation.isPending}
            size="sm"
          />

          <DeleteButton
            onClick={deleteTask}
            disabled={deleteTaskMutation.isPending}
            isLoading={deleteTaskMutation.isPending}
            size="sm"
          />
        </>
      )}
    </TodoListItem>
  );
};

export default PendingTodoItem;
