import React, { useState, useCallback } from "react";
import type { Todo } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import { Input } from "../design-system";
import { ToDoListItem } from "./ToDoListItem";
import { useActiveTodoActions } from "./actions/TaskActions";
import {
  SaveButton,
  CancelButton,
  CompleteButton,
  FailedButton,
  DeleteButton,
} from "./TaskActionButtons";

interface ActiveTodoItemProps {
  todo: Todo;
  onError?: (error: Error) => void;
}

const ActiveTodoItem: React.FC<ActiveTodoItemProps> = ({ todo, onError }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDueAt, setEditDueAt] = useState(todo.dueAt || "");

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
    await saveAction(editText, editDueAt, setIsEditing);
  }, [saveAction, editText, editDueAt]);

  const handleCancel = useCallback(() => {
    cancelAction(setEditText, setEditDueAt, setIsEditing);
  }, [cancelAction]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      keyDownAction(e, handleSave, handleCancel);
    },
    [keyDownAction, handleSave, handleCancel]
  );

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
    <ToDoListItem
      todo={todo}
      cardVariant="active"
      cardClassName="hover:shadow-md transition-all duration-200"
      onTextClick={() => setIsEditing(true)}
      dueDateIconColor={dueDateColor}
      dueDateTextColor={dueDateColor}
      badges={badges}
    >
      {isEditing ? (
        <div className="space-y-3">
          <Input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
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
    </ToDoListItem>
  );
};

export default ActiveTodoItem;
