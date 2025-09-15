import React, { useState } from "react";
import type { Todo } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import TodoListItem from "./TodoListItem";
import { useCompletedTodoActions } from "./actions/TaskActions";
import {
  ReactivateButton,
  DeleteButton,
  CancelButton,
} from "./TaskActionButtons";
import { ReactivateIcon, CheckIcon } from "../assets/icons";

interface CompletedTodoItemProps {
  todo: Todo;
  onError?: (error: Error) => void;
}

const CompletedTodoItem: React.FC<CompletedTodoItemProps> = ({
  todo,
  onError,
}) => {
  const [isReactivateFormVisible, setIsReactivateFormVisible] = useState(false);
  const [newDueDateTime, setNewDueDateTime] = useState("");

  const {
    handleReactivate: performReactivate,
    handleDelete,
    handleCancelReactivate,
    reactivateTodo,
    deleteTodo,
  } = useCompletedTodoActions(todo, onError);

  const handleReactivateTask = async () => {
    await performReactivate(
      newDueDateTime,
      setIsReactivateFormVisible,
      setNewDueDateTime
    );
  };

  const getMinimumDateTime = () => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 1);
    return currentTime.toISOString().slice(0, 16);
  };

  const badges = [
    { variant: "gray" as const, text: todo.type },
    ...(todo.isReactivation
      ? [{ variant: "purple" as const, text: "Re-activated" }]
      : []),
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
    ...(todo.completedAt
      ? [
          {
            label: "Completed",
            value: new Date(todo.completedAt).toLocaleDateString(),
            icon: (
              <CheckIcon className="w-3 h-3 mr-1 text-gray-500" size="xs" />
            ),
          },
        ]
      : []),
  ];

  return (
    <TodoListItem
      todo={todo}
      cardVariant="default"
      textVariant="muted"
      textClassName="line-through"
      dueDateLabel="Was due:"
      badges={badges}
      metadataItems={metadataItems}
    >
      {!isReactivateFormVisible ? (
        <>
          <ReactivateButton
            onClick={() => setIsReactivateFormVisible(true)}
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
            <CustomDateTimePicker
              id="modal-due-date"
              value={newDueDateTime}
              onChange={setNewDueDateTime}
              min={getMinimumDateTime()}
              placeholder="Select new due date"
            />
          )}

          <div className="flex space-x-1">
            <ReactivateButton
              onClick={handleReactivateTask}
              disabled={
                reactivateTodo.isPending ||
                (todo.type === "one-time" && !newDueDateTime)
              }
              isLoading={reactivateTodo.isPending}
              size="sm"
            />

            <CancelButton
              onClick={() =>
                handleCancelReactivate(
                  setIsReactivateFormVisible,
                  setNewDueDateTime
                )
              }
              size="sm"
            />
          </div>
        </div>
      )}
    </TodoListItem>
  );
};

export default CompletedTodoItem;
