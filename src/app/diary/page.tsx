"use client";

import { useEffect, useState, useCallback } from "react";

interface DiaryEntry {
  _id: string;
  date: string;
  content: string;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selected, setSelected] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await fetch(`/api/diary?${params.toString()}`);
    if (!res.ok) { setLoading(false); return; }

    const data: DiaryEntry[] = await res.json();
    setEntries(data);
    setSelected(data[0] ?? null);
    setLoading(false);
  }, [from, to]);

  useEffect(() => { fetchEntries(); }, []);

  const filtered = entries.filter((e) =>
    search.trim() === "" ? true : e.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">

      {/* ── Top bar ── */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <h1 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">My Diary</h1>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search entries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700
              bg-white dark:bg-zinc-900 placeholder-zinc-400 dark:placeholder-zinc-500
              focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
          />

          {/* From */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700
                bg-white dark:bg-zinc-900
                focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
            />
          </div>

          {/* To */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700
                bg-white dark:bg-zinc-900
                focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
            />
          </div>

          {/* Apply */}
          <button
            onClick={fetchEntries}
            className="px-4 py-1.5 text-sm rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900
              hover:bg-zinc-700 dark:hover:bg-zinc-300 transition"
          >
            Apply
          </button>

          {/* Clear */}
          {(from || to || search) && (
            <button
              onClick={() => { setFrom(""); setTo(""); setSearch(""); fetchEntries(); }}
              className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700
                text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Split pane ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — date list */}
        <div className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          {loading && (
            <p className="p-4 text-sm text-zinc-400">Loading…</p>
          )}

          {!loading && filtered.length === 0 && (
            <p className="p-4 text-sm text-zinc-400">No entries found.</p>
          )}

          {!loading && filtered.map((entry) => {
            const isActive = selected?._id === entry._id;
            return (
              <button
                key={entry._id}
                onClick={() => setSelected(entry)}
                className={`w-full text-left px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 transition
                  ${isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  }`}
              >
                <p className={`text-xs font-semibold mb-0.5 ${isActive ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400 dark:text-zinc-500"}`}>
                  {formatDate(entry.date)}
                </p>
                <p className="text-sm truncate">
                  {stripHtml(entry.content)}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right — full content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {selected ? (
            <>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
                {formatDate(selected.date)}
              </p>
              <div
                className="prose prose-zinc dark:prose-invert max-w-none text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selected.content }}
              />
            </>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
              Select an entry to read it.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
