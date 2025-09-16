import React from "react";
import { BellIcon, BellSlashIcon } from "../assets/icons";
import type { Todo } from "../services/api";

interface NotificationIndicatorProps {
  todo: Todo;
  size?: "xs" | "sm" | "md";
  showTime?: boolean;
  className?: string;
}

const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({
  todo,
  size = "xs",
  showTime = false,
  className = "",
}) => {
  // Show notification indicator for all tasks - even daily tasks without explicit due dates can have notifications
  if (!todo) return null;

  const isEnabled = todo.notification?.enabled || false;
  const reminderMinutes = todo.notification?.reminderMinutes || 0;

  const formatReminderTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days}d`;
    }
  };

  const iconClassName = `${className} ${isEnabled ? 'text-blue-500' : 'text-gray-400'}`;

  return (
    <div className="flex items-center space-x-1">
      {isEnabled ? (
        <BellIcon size={size} className={iconClassName} />
      ) : (
        <BellSlashIcon size={size} className={iconClassName} />
      )}
      {showTime && isEnabled && (
        <span className="text-xs text-gray-500">
          {formatReminderTime(reminderMinutes)}
        </span>
      )}
    </div>
  );
};

export default NotificationIndicator;