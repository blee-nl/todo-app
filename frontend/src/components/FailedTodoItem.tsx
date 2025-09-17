import React, { useState } from "react";
import type { Todo } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import TodoListItem from "./TodoListItem";
import { useFailedTodoActions } from "./actions/TaskActions";
import {
  ReactivateButton,
  DeleteButton,
  CancelButton,
} from "./TaskActionButtons";
import { ReactivateIcon, XIcon } from "../assets/icons";
import NotificationTimePicker from "./NotificationTimePicker";
import { NOTIFICATION_CONSTANTS } from "../constants/notificationConstants";

interface FailedTodoItemProps {
  todo: Todo;
  onError?: (error: Error) => void;
}

const FailedTodoItem: React.FC<FailedTodoItemProps> = ({ todo, onError }) => {
  const [showReactivateForm, setShowReactivateForm] = useState(false);
  const [newDueAt, setNewDueAt] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(
    todo.notification?.enabled || false
  );
  const [reminderMinutes, setReminderMinutes] = useState(
    todo.notification?.reminderMinutes ||
      NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES
  );

  const {
    handleReactivate: reactivateAction,
    handleDelete,
    handleCancelReactivate,
    reactivateTodo,
    deleteTodo,
  } = useFailedTodoActions(todo, onError);

  const handleReactivate = async () => {
    const notificationData = {
      enabled: notificationEnabled,
      reminderMinutes: reminderMinutes,
    };

    await reactivateAction(
      newDueAt,
      setShowReactivateForm,
      setNewDueAt,
      notificationData
    );
  };

  const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  const handleShowReactivateForm = () => {
    setShowReactivateForm(true);
  };

  const cancelReactivate = () => {
    handleCancelReactivate(setShowReactivateForm, setNewDueAt);
    setNotificationEnabled(todo.notification?.enabled || false);
    setReminderMinutes(
      todo.notification?.reminderMinutes ||
        NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES
    );
  };

  const isOverdue = todo.dueAt && new Date(todo.dueAt) < new Date();

  const badges = [
    { variant: "danger" as const, text: todo.type },
    ...(todo.isReactivation
      ? [{ variant: "purple" as const, text: "Re-activated" }]
      : []),
    ...(isOverdue ? [{ variant: "danger" as const, text: "Overdue" }] : []),
  ];

  const metadataItems = [
    {
      label: "Created",
      value: new Date(todo.createdAt).toLocaleDateString(),
      icon: <ReactivateIcon className="w-3 h-3 mr-1 text-gray-500" size="xs" />,
    },
    ...(todo.activatedAt
      ? [
          {
            label: "Activated",
            value: new Date(todo.activatedAt).toLocaleDateString(),
            icon: (
              <ReactivateIcon
                className="w-3 h-3 mr-1 text-gray-500"
                size="xs"
              />
            ),
          },
        ]
      : []),
    ...(todo.failedAt
      ? [
          {
            label: "Failed",
            value: new Date(todo.failedAt).toLocaleDateString(),
            icon: <XIcon className="w-3 h-3 mr-1 text-gray-500" size="xs" />,
          },
        ]
      : []),
  ];

  return (
    <TodoListItem
      todo={todo}
      cardVariant="failed"
      cardClassName="border-red-200"
      dueDateLabel="Was due:"
      dueDateIconColor={isOverdue ? "text-red-600" : "text-gray-500"}
      dueDateTextColor={isOverdue ? "text-red-600" : "text-gray-500"}
      badges={badges}
      metadataItems={metadataItems}
    >
      {!showReactivateForm ? (
        <>
          <ReactivateButton
            onClick={handleShowReactivateForm}
            disabled={reactivateTodo.isPending}
            isLoading={reactivateTodo.isPending}
            size="sm"
          />

          <DeleteButton
            onClick={handleDelete}
            disabled={deleteTodo.isPending}
            isLoading={deleteTodo.isPending}
            size="sm"
          />
        </>
      ) : (
        <div className="space-y-2">
          {todo.type === "one-time" && (
            <div>
              <CustomDateTimePicker
                value={newDueAt}
                onChange={setNewDueAt}
                min={getMinDate()}
                placeholder="Select new due date"
              />
            </div>
          )}

          {newDueAt && (
            <div className="border-t pt-3">
              <NotificationTimePicker
                enabled={notificationEnabled}
                reminderMinutes={reminderMinutes}
                onEnabledChange={setNotificationEnabled}
                onReminderMinutesChange={setReminderMinutes}
                dueAt={newDueAt}
                taskType={todo.type}
              />
            </div>
          )}

          <div className="flex space-x-1">
            <ReactivateButton
              onClick={handleReactivate}
              disabled={
                reactivateTodo.isPending ||
                (todo.type === "one-time" && !newDueAt)
              }
              isLoading={reactivateTodo.isPending}
              size="sm"
            />

            <CancelButton onClick={cancelReactivate} size="sm" />
          </div>
        </div>
      )}
    </TodoListItem>
  );
};

export default FailedTodoItem;
