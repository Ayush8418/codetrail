"use client";

import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


type Habit = {
  _id: string;
  title: string;
  description?: string;
  isActive: boolean;
};

type HabitLog = {
  habitId: string;
  date: string;
  completed: boolean;
};

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  /* ----------------------------------------
     Fetch habits + logs for current month
  ----------------------------------------- */
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const from = new Date(year, month, 1).toISOString();
      const to = new Date(year, month, daysInMonth).toISOString();

      const [habitRes, logRes] = await Promise.all([
        fetch("/api/habit"),
        fetch(`/api/habitlog?from=${from}&to=${to}`),
      ]);

      const habitsData = await habitRes.json();
      const logsData = await logRes.json();

      setHabits(habitsData);
      setLogs(logsData);
      setLoading(false);
    }

    fetchData();
  }, [month, year, daysInMonth]);

  /* ----------------------------------------
     Helpers
  ----------------------------------------- */
  const isCompleted = (habitId: string, day: number) => {
    return logs.some((l) => {
      const d = new Date(l.date);
      return (
        l.habitId === habitId &&
        l.completed &&
        d.getDate() === day &&
        d.getMonth() === month
      );
    });
  };

  const toggleDay = async (habitId: string, day: number) => {
  if (day !== today.getDate()) {
    toast.error("Past and future are not in your hands.");
    return;
  }

  const res = await fetch("/api/habitlog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habitId }), // date not needed anymore
  });

  if (!res.ok) {
    const err = await res.json();
    toast.error("Action not allowed");
    return;
  }

  const updated = await res.json();

  setLogs((prev) => {
    const exists = prev.find(
      (l) =>
        l.habitId === habitId &&
        new Date(l.date).toDateString() ===
          new Date(updated.date).toDateString()
    );

    if (exists) {
      return prev.map((l) => (l === exists ? updated : l));
    }

    return [...prev, updated];
  });
};


  const addHabit = async () => {
    if (!newHabit.trim()) return;

    const res = await fetch("/api/habit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newHabit }),
    });

    const habit = await res.json();
    setHabits((h) => [habit, ...h]);
    setNewHabit("");
  };

  const toggleActive = async (habit: Habit) => {
    const res = await fetch("/api/habit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        habitId: habit._id,
        isActive: !habit.isActive,
      }),
    });

    const updated = await res.json();
    setHabits((h) =>
      h.map((hb) => (hb._id === updated._id ? updated : hb))
    );
  };

  const deleteHabit = async (habitId: string) => {
    const ok = confirm(
      "⚠️ This will permanently delete this habit and all its logs.\nAre you sure?"
    );
    if (!ok) return;

    await fetch("/api/habit", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId }),
    });

    setHabits((h) => h.filter((hb) => hb._id !== habitId));
    setLogs((l) => l.filter((lg) => lg.habitId !== habitId));
  };

  /* ----------------------------------------
   Build consistency data for chart
----------------------------------------- */
const consistencyData = days.map((day) => {
  const completedCount = logs.filter((l) => {
    const d = new Date(l.date);
    return (
      l.completed &&
      d.getDate() === day &&
      d.getMonth() === month &&
      d.getFullYear() === year
    );
  }).length;

  return {
    day,
    completed: completedCount,
  };
});


  if (loading) {
    return <div className="text-center text-zinc-400">Loading habits…</div>;
  }

  return (
  <div className="relative w-full overflow-x-auto">
    {/* ================= HEADER ================= */}
    <div className="mt-40 mx-5 flex items-center justify-between">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-500 dark:text-zinc-100">
        {today.toLocaleString("default", { month: "long" })} {year}
      </h2>

      <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-transparent via-zinc-300/40 to-transparent dark:via-zinc-700/40" />
    </div>

    {/* ================= GRID WRAPPER ================= */}
    <div className="relative rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]">
      <div
        className="grid text-sm"
        style={{
          gridTemplateColumns: `220px repeat(${days.length}, 40px)`,
        }}
      >
        {/* ----------- DATE HEADER ----------- */}
        <div />

        {days.map((d) => {
          const date = new Date(year, month, d);
          const isToday = d === today.getDate();

          return (
            <div
              key={d}
              className={`flex flex-col items-center justify-center py-3 gap-1
                ${
                  isToday
                    ? "text-zinc-900 dark:text-zinc-300"
                    : "text-zinc-600 dark:text-zinc-500"
                }`}
            >
              <div
                className={`text-xs ${
                  isToday && "font-semibold"
                }`}
              >
                {d}
              </div>
              <div className="text-[10px] uppercase tracking-wide">
                {date.toLocaleDateString("default", { weekday: "short" })}
              </div>
            </div>
          );
        })}

        {/* ----------- HABIT ROWS ----------- */}
        {habits.map((habit) => (
          <Fragment key={habit._id}>
            {/* Habit name + controls */}
            <div className="group flex items-center gap-3 px-4 py-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
              {/* Toggle */}
             <button
  onClick={() => toggleActive(habit)}
  className={`relative w-11 h-6 rounded-full transition-all duration-300
    ${
      habit.isActive
        ? "bg-emerald-500"
        : "bg-zinc-300 dark:bg-zinc-700"
    }`}
>
  <span
    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow
      transition-transform duration-300
      ${
        habit.isActive ? "translate-x-5" : "translate-x-0"
      }`}
  />
</button>


              {/* Habit title */}
              <span
                className={`flex-1 truncate transition-opacity
                  ${
                    habit.isActive
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
              >
                {habit.title}
              </span>

              {/* Delete */}
              <button
                onClick={() => deleteHabit(habit._id)}
                className="opacity-0 group-hover:opacity-100 transition text-zinc-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            {/* Day boxes */}
            {days.map((d) => {
              const done = isCompleted(habit._id, d);
              const isToday = d === today.getDate();

              return (
                <div
                  key={d}
                  onClick={() =>
                    habit.isActive && toggleDay(habit._id, d)
                  }
                  className={`relative flex items-center justify-center h-10 cursor-pointer border-t border-zinc-200/40 dark:border-zinc-800/40
  transition-all
  ${isToday ? "bg-zinc-300 dark:bg-zinc-700" : ""}
  ${habit.isActive ? "hover:bg-zinc-900/5 dark:hover:bg-zinc-100/5" : "opacity-40 cursor-not-allowed"}
`}

                >
                  {done && (
  <span className="absolute inset-1 bg-green-500 dark:bg-green-400  shadow-sm" />
)}

                </div>
              );
            })}
          </Fragment>
        ))}

        {/* ----------- ADD HABIT ----------- */}
        <div className="col-span-full border-t border-zinc-200/40 dark:border-zinc-800/40 p-4">
          <div className="flex w-fit items-center gap-3">
            <input
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Add a new habit…"
              className="flex-1 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600"
            />

            <button
              onClick={addHabit}
              className="px-4 py-1.5 rounded-full text-sm font-medium
                bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300
                text-white dark:text-zinc-900
                hover:scale-[1.03] active:scale-[0.97] transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
    {/* ================= CONSISTENCY CHART ================= */}
<div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]">
  {/* Header */}
  <div className="mb-4 flex items-center justify-between">
    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
      Consistency Overview
    </h3>
    <span className="text-xs text-zinc-400">
      Habits completed per day
    </span>
  </div>

  {/* Chart */}
  <div className="h-56">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={consistencyData}>
        <XAxis
          dataKey="day"
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#71717a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          cursor={{ stroke: "#10b981", strokeWidth: 1 }}
          contentStyle={{
            backgroundColor: "rgba(24,24,27,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "12px",
          }}
        />

        <Line
          type="monotone"
          dataKey="completed"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

  </div>
);

}
