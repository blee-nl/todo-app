import React from "react";
import { ARIA_LABELS } from "../constants/dateTimePickerConstants";
import { Button } from "../../design-system";
import { CheckIcon, XIcon } from "../../assets/icons";

interface ActionButtonsProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onCancel}
        leftIcon={<XIcon size="xs" />}
        aria-label={ARIA_LABELS.CANCEL_SELECTION}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onConfirm}
        leftIcon={<CheckIcon size="xs" />}
        aria-label={ARIA_LABELS.CONFIRM_SELECTION}
      >
        Confirm
      </Button>
    </div>
  );
};

export default ActionButtons;
