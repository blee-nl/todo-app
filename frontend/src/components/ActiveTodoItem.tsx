import React, { useState, useCallback } from "react";
import type { Todo } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import { Input } from "../design-system";
import TodoListItem from "./TodoListItem";
import { useActiveTodoActions } from "./actions/TaskActions";
import {
  SaveButton,
  CancelButton,
  CompleteButton,
  FailedButton,
  DeleteButton,
} from "./TaskActionButtons";
import { CardVariant, isOneTimeTask } from "../constants/taskConstants";
import NotificationTimePicker from "./NotificationTimePicker";
import { NOTIFICATION_CONSTANTS } from "../constants/notificationConstants";

interface ActiveTodoItemProps {
  todo: Todo;
  onError?: (error: Error) => void;
}

const ActiveTodoItem: React.FC<ActiveTodoItemProps> = ({ todo, onError }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDueAt, setEditDueAt] = useState(todo.dueAt || "");
  const [notificationEnabled, setNotificationEnabled] = useState(todo.notification?.enabled || false);
  const [reminderMinutes, setReminderMinutes] = useState(todo.notification?.reminderMinutes || NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES);

  const {
    handleSave: saveAction,
    handleCancel: cancelAction,
    handleComplete,
    handleFail,
    handleDelete,
    handleKeyDown: keyDownAction,
    updateTodo,
    completeTodo,
    failTodo,
    deleteTodo,
  } = useActiveTodoActions(todo, onError);

  const handleSave = useCallback(async () => {
    await saveAction(editText, editDueAt, setIsEditing, {
      enabled: notificationEnabled,
      reminderMinutes: reminderMinutes
    });
  }, [saveAction, editText, editDueAt, notificationEnabled, reminderMinutes]);

  const handleCancel = useCallback(() => {
    cancelAction(setEditText, setEditDueAt, setIsEditing);
    setNotificationEnabled(todo.notification?.enabled || false);
    setReminderMinutes(todo.notification?.reminderMinutes || NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES);
  }, [cancelAction, todo.notification]);

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

  const isOverdue = todo.dueAt && new Date(todo.dueAt) < new Date();

  const badges = [
    { variant: "success" as const, text: todo.type },
    ...(todo.isReactivation
      ? [{ variant: "purple" as const, text: "Re-activated" }]
      : []),
    ...(isOverdue ? [{ variant: "danger" as const, text: "Overdue" }] : []),
  ];

  const dueDateColor = isOverdue ? "text-red-600" : "text-gray-500";

  return (
    <TodoListItem
      todo={todo}
      cardVariant={CardVariant.ACTIVE}
      cardClassName="hover:shadow-md transition-all duration-200"
      onTextClick={handleStartEdit}
      dueDateIconColor={dueDateColor}
      dueDateTextColor={dueDateColor}
      badges={badges}
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
          {isOneTimeTask(todo.type) && (
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
              disabled={updateTodo.isPending}
              isLoading={updateTodo.isPending}
              size="sm"
            />

            <CancelButton onClick={handleCancel} size="sm" />
          </div>
        </div>
      ) : (
        <>
          <CompleteButton
            onClick={handleComplete}
            disabled={completeTodo.isPending}
            isLoading={completeTodo.isPending}
            size="sm"
          />

          <FailedButton
            onClick={handleFail}
            disabled={failTodo.isPending}
            isLoading={failTodo.isPending}
            size="sm"
          />

          <DeleteButton
            onClick={handleDelete}
            disabled={deleteTodo.isPending}
            isLoading={deleteTodo.isPending}
            size="sm"
          />
        </>
      )}
    </TodoListItem>
  );
};

export default ActiveTodoItem;
