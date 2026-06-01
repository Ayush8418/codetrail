"use client";

import { useEffect, useState } from "react";

type Todo = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
};

export default function Todo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    const res = await fetch("/api/todo");
    if (!res.ok) return;
    setTodos(await res.json());
  };

  const addTodo = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch("/api/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      const todo = await res.json();
      setTodos((prev) => [todo, ...prev]);
      setTitle("");
      setDescription("");
    }
    setLoading(false);
  };

  const toggleTodo = async (todo: Todo) => {
    const res = await fetch("/api/todo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todoId: todo._id, completed: !todo.completed }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  };

  const deleteTodo = async (todoId: string) => {
    if (!confirm("Delete this todo?")) return;
    await fetch("/api/todo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todoId }),
    });
    setTodos((prev) => prev.filter((t) => t._id !== todoId));
  };

  return (
    <div className="flex flex-col gap-2 w-full min-h-[500px]">

      {/* ===== Header ===== */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-zinc-500 dark:text-zinc-100">Todo</h2>
        <p className="text-sm text-zinc-500">Things to get done today</p>
      </div>

      {/* ===== Todo Card ===== */}
      <div className="flex flex-col flex-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">

        {/* ===== Todo List ===== */}
        <div className="flex-1 space-y-2 mb-4">
          {todos.map((todo) => (
            <div
              key={todo._id}
              className="flex items-start gap-3 text-sm group"
              onMouseEnter={() => setHoveredId(todo._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo)}
                className={`
                  mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition
                  ${todo.completed
                    ? "bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100"
                    : "border-zinc-400 hover:border-zinc-600"}
                `}
              >
                {todo.completed && (
                  <span className="text-white dark:text-black text-[10px]">✓</span>
                )}
              </button>

              {/* Title + Description */}
              <div className="flex-1 min-w-0">
                <span className={`block ${todo.completed ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                  {todo.title}
                </span>

                {todo.description && (
                  <span className={`block text-xs text-zinc-400 dark:text-zinc-500 transition-all duration-200 ${
                    hoveredId === todo._id
                      ? "whitespace-normal line-clamp-none"
                      : "truncate"
                  }`}>
                    {todo.description}
                  </span>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTodo(todo._id)}
                className="opacity-0 group-hover:opacity-100 transition text-zinc-400 hover:text-red-500 shrink-0"
              >
                ✕
              </button>
            </div>
          ))}

          {todos.length === 0 && (
            <div className="text-xs text-zinc-400">No tasks yet</div>
          )}
        </div>

        {/* ===== Add Todo — bottom ===== */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="Add a task"
              className="flex-1 bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:outline-none text-sm text-zinc-900 dark:text-zinc-100 pb-0.5"
            />
            <button
              onClick={addTodo}
              disabled={loading}
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition shrink-0"
            >
              Add
            </button>
          </div>

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Description (optional)"
            className="bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none text-xs text-zinc-500 dark:text-zinc-400 pb-0.5"
          />
        </div>

      </div>
    </div>
  );
}
