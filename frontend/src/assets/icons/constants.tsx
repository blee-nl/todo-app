// Import icons for the mapping
import CalendarIcon from "./CalendarIcon";
import ClockIcon from "./ClockIcon";
import CheckIcon from "./CheckIcon";
import XIcon from "./XIcon";
import TrashIcon from "./TrashIcon";
import EditIcon from "./EditIcon";
import SaveIcon from "./SaveIcon";
import CancelIcon from "./CancelIcon";
import ChevronLeftIcon from "./ChevronLeftIcon";
import ChevronRightIcon from "./ChevronRightIcon";
import PlusIcon from "./PlusIcon";
import SuccessIcon from "./SuccessIcon";
import ErrorIcon from "./ErrorIcon";
import WarningIcon from "./WarningIcon";
import TaskIcon from "./TaskIcon";
import HabitIcon from "./HabitIcon";
import ReactivateIcon from "./ReactivateIcon";

/**
 * Icon-related constants and utilities
 */

export interface IconProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const ClassNameSizeMap = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

/**
 * Icon size options
 */
export const ICON_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

/**
 * Default icon props
 */
export const DEFAULT_ICON_PROPS: IconProps = {
  size: "md",
  className: "",
};

/**
 * Icon mappings
 */

/**
 * Icon mapping for easy access
 */
export const icons = {
  // Calendar and Date
  calendar: CalendarIcon,
  clock: ClockIcon,

  // Actions
  check: CheckIcon,
  x: XIcon,
  trash: TrashIcon,
  edit: EditIcon,
  save: SaveIcon,
  cancel: CancelIcon,

  // Navigation
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  plus: PlusIcon,

  // Status
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,

  // Task Types
  task: TaskIcon,
  habit: HabitIcon,
  reactivate: ReactivateIcon,
} as const;

export type IconName = keyof typeof icons;
