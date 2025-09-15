import React from "react";
import type { Todo } from "../services/api";
import { formatDate, formatFullDate } from "../utils/dateUtils";
import { Card, Badge, Text } from "../design-system";
import { CalendarIcon, ClockIcon } from "../assets/icons";

export interface TodoListItemProps {
  todo: Todo;
  cardVariant?: "default" | "active" | "overdue" | "failed";
  cardClassName?: string;
  textVariant?: "body" | "muted";
  textWeight?: "normal" | "medium" | "semibold" | "bold";
  textClassName?: string;
  showDueDate?: boolean;
  dueDateLabel?: string;
  dueDateIconColor?: string;
  dueDateTextColor?: string;
  showMetadata?: boolean;
  metadataItems?: Array<{
    label: string;
    value: string;
    icon: React.ReactNode;
  }>;
  badges?: Array<{
    variant:
      | "primary"
      | "success"
      | "warning"
      | "danger"
      | "info"
      | "purple"
      | "gray";
    text: string;
  }>;
  children?: React.ReactNode;
  onTextClick?: () => void;
}

const TodoListItem: React.FC<TodoListItemProps> = ({
  todo,
  cardVariant = "default",
  cardClassName = "",
  textVariant = "body",
  textWeight = "medium",
  textClassName = "",
  showDueDate = true,
  dueDateLabel = "Due:",
  dueDateIconColor = "text-gray-600",
  dueDateTextColor = "text-gray-600",
  showMetadata = true,
  metadataItems = [],
  badges = [],
  children,
  onTextClick,
}) => {
  // Default metadata items
  const defaultMetadataItems = [
    {
      label: "Created",
      value: formatDate(todo.createdAt),
      icon: <ClockIcon className="w-3 h-3 mr-1 text-gray-500" size="xs" />,
    },
    ...(todo.activatedAt
      ? [
          {
            label: "Activated",
            value: formatDate(todo.activatedAt),
            icon: (
              <ClockIcon className="w-3 h-3 mr-1 text-gray-500" size="xs" />
            ),
          },
        ]
      : []),
  ];

  const displayMetadataItems =
    metadataItems.length > 0 ? metadataItems : defaultMetadataItems;

  // Default badges
  const defaultBadges = [
    {
      variant: "primary" as const,
      text: todo.type,
    },
    ...(todo.isReactivation
      ? [
          {
            variant: "purple" as const,
            text: "Re-activated",
          },
        ]
      : []),
  ];

  const displayBadges = badges.length > 0 ? badges : defaultBadges;

  return (
    <Card variant={cardVariant} className={cardClassName}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Badges */}
          <div className="flex items-center space-x-2 mb-3">
            {displayBadges.map((badge, index) => (
              <Badge key={index} variant={badge.variant}>
                {badge.text}
              </Badge>
            ))}
          </div>

          {/* Todo Text */}
          <Text
            variant={textVariant}
            weight={textWeight}
            className={`mb-3 leading-relaxed ${textClassName} ${
              onTextClick
                ? "cursor-pointer hover:text-blue-600 transition-colors duration-200"
                : ""
            }`}
            onClick={onTextClick}
          >
            {todo.text}
          </Text>

          {/* Due Date */}
          {showDueDate && todo.dueAt && (
            <div className="mb-3 flex items-center">
              <CalendarIcon
                className={`w-4 h-4 mr-1 ${dueDateIconColor}`}
                size="sm"
              />
              <Text
                variant="small"
                weight="medium"
                className={dueDateTextColor}
              >
                {dueDateLabel}{" "}
                <span className="ml-1">{formatFullDate(todo.dueAt)}</span>
              </Text>
            </div>
          )}

          {/* Metadata */}
          {showMetadata && (
            <div className="space-y-1">
              {displayMetadataItems.map((item, index) => (
                <div key={index} className="flex items-center">
                  {item.icon}
                  <Text variant="muted" className="text-xs">
                    {item.label} {item.value}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {children && (
          <div className="flex flex-col space-y-2 ml-4">{children}</div>
        )}
      </div>
    </Card>
  );
};

export default TodoListItem;
