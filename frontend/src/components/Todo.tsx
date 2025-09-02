import React, { useState } from "react";

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const Todo: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Add new todo
  const addTodo = () => {
    if (inputValue.trim() !== "") {
      const newTodo: TodoItem = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setTodos([...todos, newTodo]);
      setInputValue("");
    }
  };

  // Delete todo
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Edit todo
  const editTodo = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (todo && !todo.completed) {
      setEditingId(id);
      setEditValue(todo.text);
    }
  };

  // Save edit
  const saveEdit = (id: number) => {
    if (editValue.trim() !== "") {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, text: editValue.trim() } : todo
        )
      );
      setEditingId(null);
      setEditValue("");
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Complete todo
  const completeTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Remove completed todos
  const removeCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit(editingId!);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  // Separate active and completed todos
  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-2xl animate-float">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-3 tracking-tight">
            Tasks
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl font-medium">
            Organize your day with elegance
          </p>
        </div>

        {/* Add Todo Section */}
        <div className="glass rounded-3xl shadow-2xl p-6 mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What needs to be done?"
                className="w-full px-6 py-4 text-lg bg-white/60 border-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 placeholder-slate-400 font-medium input-focus"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <button
              onClick={addTodo}
              className="btn-primary px-8 py-4 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95"
            >
              Add
            </button>
          </div>
        </div>

        {/* Actions */}
        {todos.some((todo) => todo.completed) && (
          <div className="flex justify-center mb-8 animate-fade-in">
            <button
              onClick={removeCompleted}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Clear Completed ({completedTodos.length})
            </button>
          </div>
        )}

        {/* Active Todos */}
        {activeTodos.length > 0 && (
          <div className="glass rounded-3xl shadow-2xl p-6 mb-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Active Tasks ({activeTodos.length})
            </h2>
            <div className="space-y-4">
              {activeTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="group bg-white/60 rounded-2xl p-5 hover:bg-white/80 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-white/40"
                >
                  {editingId === todo.id ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={handleEditKeyPress}
                        className="flex-1 px-4 py-3 bg-white border-2 border-blue-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 font-medium input-focus"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-5 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-xl transition-colors duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => completeTodo(todo.id)}
                          className="w-6 h-6 text-blue-600 bg-white border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 cursor-pointer transition-all duration-200 hover:border-blue-400"
                        />
                      </div>
                      <span className="flex-1 text-lg text-slate-800 font-medium">
                        {todo.text}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => editTodo(todo.id)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <div className="glass rounded-3xl shadow-2xl p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              Completed Tasks ({completedTodos.length})
            </h2>
            <div className="space-y-4">
              {completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => completeTodo(todo.id)}
                        className="w-6 h-6 text-green-600 bg-white border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-green-500/20 cursor-pointer"
                      />
                    </div>
                    <span className="flex-1 text-lg text-slate-500 line-through font-medium">
                      {todo.text}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105 active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todos.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="glass rounded-3xl shadow-2xl p-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
                <svg
                  className="w-12 h-12 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                No tasks yet
              </h3>
              <p className="text-slate-600 text-lg">
                Start by adding your first task above.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Todo;
