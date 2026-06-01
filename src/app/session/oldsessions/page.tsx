"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type Session = {
  _id: string;
  topic: string;
  description?: string;
  duration: number;
  createdAt: string;
  startTime: string;
  endTime: string;
  timestamps: string[];
};


const rowsPerPage = 15;

export default function OldSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    sort: "desc",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/session", {
        params: { page, limit: rowsPerPage, ...filters },
      })
      .then((res) => {
        setSessions(res.data.data || []);
        setTotalPages(res.data.pagination.totalPages);
        setError("");
      })
      .catch(() => {
        setError("Failed to load sessions");
        toast.error("Failed to load sessions");
      })
      .finally(() => setLoading(false));
  }, [page, filters]);

  const applyFilters = () => {
    setPage(1);
    setFilters({ search, sort: sortOrder, fromDate, toDate });
  };

  const handleDelete = async (id: string, topic: string) => {
    if (!confirm(`Delete session "${topic}"?`)) return;
    try {
      await axios.delete(`/api/session/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const d = (x: string) => new Date(x);
  const fmtDate = (x: string) =>
    d(x).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const fmtTime = (x: string) =>
    d(x).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  const dur = (s: number) =>
    s >= 3600
      ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
      : s >= 60
      ? `${Math.floor(s / 60)}m ${s % 60}s`
      : `${s}s`;

  /* ================= UI STATES ================= */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading sessions...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-zinc-950">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
          Old Sessions
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Total sessions: {sessions.length}
        </p>
      </div>

      {/* FILTER BAR (kept minimal & consistent) */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          placeholder="Search topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border dark:bg-zinc-950"
        />

        <button
          onClick={() =>
            setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
          }
          className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          {sortOrder === "asc" ? "Oldest first" : "Newest first"}
        </button>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border"
        />

        <button
          onClick={applyFilters}
          className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white dark:bg-white dark:text-black"
        >
          Apply
        </button>
      </div>

      {/* EMPTY STATE */}
      {sessions.length === 0 && (
        <div className="text-gray-500">
          No sessions found.
        </div>
      )}

      {/* SESSION LIST */}
      <div className="space-y-4">
        {sessions.map((s) => {
          const start = s.startTime && d(s.startTime);
          const end = s.endTime && d(s.endTime);

          return (
            <div
              key={s._id}
              onClick={() =>
                (location.href = `/session/oldsessions/${s._id}`)
              }
              className="
                rounded-xl p-4 cursor-pointer
                bg-white dark:bg-zinc-900
                border border-gray-200 dark:border-zinc-800
                hover:shadow-md transition
              "
            >
              {/* TOP ROW */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">
                  {s.topic}
                </h2>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(s._id, s.topic);
                  }}
                  className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                >
                  Delete
                </button>
              </div>

              {/* DESCRIPTION PREVIEW */}
{s.description && (
  <div
    className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2"
    dangerouslySetInnerHTML={{ __html: s.description }}
  />
)}


              {/* META INFO */}
              <div className="text-sm text-gray-600 dark:text-zinc-400 flex flex-wrap gap-4 mt-2">
                <span>Created: {fmtDate(s.createdAt)}</span>
                <span>Start: {start ? fmtTime(start.toString()) : "-"}</span>
                <span>End: {end ? fmtTime(end.toString()) : "-"}</span>
                <span>Duration: {dur(s.duration)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`
              px-3 py-1 text-sm rounded-lg border
              ${
                page === i + 1
                  ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-800"
              }
            `}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
