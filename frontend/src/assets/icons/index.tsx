import React from "react";
import { type IconProps, ClassNameSizeMap } from "./constants";
/**
 * Get size classes for icons
 */
const getSizeClasses = (size: IconProps["size"] = "md"): string => {
  return ClassNameSizeMap[size];
};

// Import icon elements from individual files
import CalendarIconElement from "./CalendarIcon";
import ClockIconElement from "./ClockIcon";
import CheckIconElement from "./CheckIcon";
import XIconElement from "./XIcon";
import TrashIconElement from "./TrashIcon";
import EditIconElement from "./EditIcon";
import SaveIconElement from "./SaveIcon";
import CancelIconElement from "./CancelIcon";
import ChevronLeftIconElement from "./ChevronLeftIcon";
import ChevronRightIconElement from "./ChevronRightIcon";
import PlusIconElement from "./PlusIcon";
import SuccessIconElement from "./SuccessIcon";
import ErrorIconElement from "./ErrorIcon";
import WarningIconElement from "./WarningIcon";
import TaskIconElement from "./TaskIcon";
import HabitIconElement from "./HabitIcon";
import ReactivateIconElement from "./ReactivateIcon";
import InfoIconElement from "./InfoIcon";
import CloseIconElement from "./CloseIcon";
import RefreshIconElement from "./RefreshIcon";

// Create base icon component
const createBaseIcon = (children: React.ReactNode) => {
  return ({ className = "", size = "md", ...props }: IconProps) => {
    return (
      <svg
        className={`${getSizeClasses(size)} ${className}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        {...props}
      >
        {children}
      </svg>
    );
  };
};

// Export icons using createBaseIcon
export const CalendarIcon = createBaseIcon(CalendarIconElement);
export const ClockIcon = createBaseIcon(ClockIconElement);
export const CheckIcon = createBaseIcon(CheckIconElement);
export const XIcon = createBaseIcon(XIconElement);
export const TrashIcon = createBaseIcon(TrashIconElement);
export const EditIcon = createBaseIcon(EditIconElement);
export const SaveIcon = createBaseIcon(SaveIconElement);
export const CancelIcon = createBaseIcon(CancelIconElement);
export const ChevronLeftIcon = createBaseIcon(ChevronLeftIconElement);
export const ChevronRightIcon = createBaseIcon(ChevronRightIconElement);
export const PlusIcon = createBaseIcon(PlusIconElement);
export const SuccessIcon = createBaseIcon(SuccessIconElement);
export const ErrorIcon = createBaseIcon(ErrorIconElement);
export const WarningIcon = createBaseIcon(WarningIconElement);
export const TaskIcon = createBaseIcon(TaskIconElement);
export const HabitIcon = createBaseIcon(HabitIconElement);
export const ReactivateIcon = createBaseIcon(ReactivateIconElement);
export const InfoIcon = createBaseIcon(InfoIconElement);
export const CloseIcon = createBaseIcon(CloseIconElement);
export const RefreshIcon = createBaseIcon(RefreshIconElement);

// Export types
export type { IconProps };
