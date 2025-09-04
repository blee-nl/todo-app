import React from "react";

interface TodoInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const TodoInput: React.FC<TodoInputProps> = ({
  value,
  onChange,
  onAdd,
  onKeyDown,
  isLoading,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="What needs to be done?"
          className="w-full px-6 py-4 text-lg bg-white/60 border-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 placeholder-slate-400 font-medium input-focus"
          disabled={isLoading || disabled}
          aria-label="Add new todo"
          maxLength={500}
        />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      <button
        onClick={onAdd}
        disabled={isLoading || disabled || !value.trim()}
        className="btn-primary px-8 py-4 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        aria-label="Add todo"
      >
        {isLoading ? "Adding..." : "Add"}
      </button>
    </div>
  );
};
