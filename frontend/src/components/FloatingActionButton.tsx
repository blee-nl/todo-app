import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
}) => {
  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-50">
      <button
        onClick={onClick}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95"
      >
        <PlusIcon className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default FloatingActionButton;
