import React, { useState, useCallback } from "react";
import type { Todo } from "../services/api";
import CustomDateTimePicker from "./CustomDateTimePicker";
import { Input } from "../design-system";
import { ToDoListItem } from "./ToDoListItem";
import { usePendingTodoActions } from "./actions/TaskActions";
import {
  SaveButton,
  CancelButton,
  ActivateButton,
  DeleteButton,
} from "./TaskActionButtons";

interface PendingTodoItemProps {
  todo: Todo;
  onError?: (error: Error) => void;
}

const PendingTodoItem: React.FC<PendingTodoItemProps> = ({ todo, onError }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDueAt, setEditDueAt] = useState(todo.dueAt || "");

  const {
    handleActivate,
    handleDelete,
    handleSave: saveAction,
    handleCancel: cancelAction,
    handleKeyDown: keyDownAction,
    activateTodo,
    deleteTodo,
    updateTodo,
  } = usePendingTodoActions(todo, onError);

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

  return (
    <ToDoListItem
      todo={todo}
      cardVariant="default"
      cardClassName="hover:shadow-md transition-all duration-200"
      onTextClick={() => setIsEditing(true)}
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
          <ActivateButton
            onClick={handleActivate}
            disabled={activateTodo.isPending}
            isLoading={activateTodo.isPending}
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

export default PendingTodoItem;
