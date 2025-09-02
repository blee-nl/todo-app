import React, { useState } from "react";

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
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
    if (todo) {
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

  return (
    <div className="todo-app">
      <h1>Todo App</h1>

      <div className="todo-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <div className="todo-actions">
        <button
          onClick={removeCompleted}
          disabled={!todos.some((todo) => todo.completed)}
        >
          Remove Completed
        </button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? "completed" : ""}`}
          >
            {editingId === todo.id ? (
              <div className="edit-mode">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={handleEditKeyPress}
                  autoFocus
                />
                <button onClick={() => saveEdit(todo.id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <div className="todo-content">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => completeTodo(todo.id)}
                />
                <span className={todo.completed ? "completed-text" : ""}>
                  {todo.text}
                </span>
                <div className="todo-buttons">
                  <button onClick={() => editTodo(todo.id)}>Edit</button>
                  <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="no-todos">No todos yet. Add one above!</p>
      )}
    </div>
  );
};

export default Todo;
