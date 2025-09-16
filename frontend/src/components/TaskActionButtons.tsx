import React from "react";
import { Button } from "../design-system";
import {
  CheckIcon,
  XIcon,
  TrashIcon,
  RefreshIcon,
  PlusIcon,
} from "../assets/icons";

// Cancel Button
interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CancelButton: React.FC<CancelButtonProps> = ({
  onClick,
  disabled = false,
  size = "md",
  className = "",
}) => (
  <Button
    type="button"
    variant="secondary"
    size={size}
    onClick={onClick}
    disabled={disabled}
    className={className}
  >
    Cancel
  </Button>
);

// Save Button
interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  size = "md",
  className = "",
}) => (
  <Button
    type="button"
    variant="primary"
    size={size}
    onClick={onClick}
    disabled={disabled || isLoading}
    isLoading={isLoading}
    className={className}
  >
    Save
  </Button>
);

// Delete Button
interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  size = "md",
  className = "",
}) => (
  <Button
    type="button"
    variant="danger"
    size={size}
    onClick={onClick}
    disabled={disabled || isLoading}
    isLoading={isLoading}
    leftIcon={<TrashIcon size="sm" />}
    className={className}
  >
    Delete
  </Button>
);

// Complete Button
interface CompleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CompleteButton: React.FC<CompleteButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  size = "md",
  className = "",
}) => (
  <Button
    type="button"
    variant="success"
    size={size}
    onClick={onClick}
    disabled={disabled || isLoading}
    isLoading={isLoading}
    leftIcon={<CheckIcon size="sm" />}
    className={className}
  >
    Complete
  </Button>
);

// Activate Button
interface ActivateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ActivateButton: React.FC<ActivateButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  size = "md",
  className = "",
}) => (
  <Button
    type="button"
    variant="primary"
    size={size}
    onClick={onClick}
    disabled={disabled || isLoading}
    isLoading={isLoading}
    leftIcon={<CheckIcon size="sm" />}
    className={className}
  >
    Activate
  </Button>
);

// Failed Button
interface FailedButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FailedButton: React.FC<FailedButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  size = "md",
  className = "",
}) => (
  <Button
    type="button"
    variant="warning"
    size={size}
    onClick={onClick}
    disabled={disabled || isLoading}
    isLoading={isLoading}
    leftIcon={<XIcon size="sm" />}
    className={className}
  >
    Fail
  </Button>
);

// Delete All Button
interface DeleteAllButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  count?: number;
  state?: "completed" | "failed";
}

const DeleteAllButton: React.FC<DeleteAllButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  size = "md",
  className = "",
  count = 0,
  state,
}) => {
  const getButtonText = () => {
    if (state === "completed") return "Delete All Completed";
    if (state === "failed") return "Delete All Failed";
    return `Delete All ${count > 0 ? `(${count})` : ""}`;
  };

  return (
    <Button
      type="button"
      variant="danger"
      size={size}
      onClick={onClick}
      disabled={disabled || count === 0 || isLoading}
      isLoading={isLoading}
      leftIcon={<TrashIcon size="sm" />}
      className={className}
    >
      {getButtonText()}
    </Button>
  );
};

// Reactivate Button
interface ReactivateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ReactivateButton: React.FC<ReactivateButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  size = "md",
  className = "",
}) => (
  <Button
    type="button"
    variant="primary"
    size={size}
    onClick={onClick}
    disabled={disabled || isLoading}
    isLoading={isLoading}
    leftIcon={<RefreshIcon size="sm" />}
    className={className}
  >
    Reactivate
  </Button>
);

// Add Task Button
interface AddTaskButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
}

const AddTaskButton: React.FC<AddTaskButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  size = "md",
  className = "",
  type = "button",
}) => (
  <Button
    type={type}
    variant="primary"
    size={size}
    onClick={onClick}
    disabled={disabled || isLoading}
    isLoading={isLoading}
    leftIcon={<PlusIcon size="sm" />}
    className={className}
  >
    Add Task
  </Button>
);

// Export all buttons
export {
  CancelButton,
  SaveButton,
  DeleteButton,
  CompleteButton,
  ActivateButton,
  FailedButton,
  DeleteAllButton,
  ReactivateButton,
  AddTaskButton,
};
