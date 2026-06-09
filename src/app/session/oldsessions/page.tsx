"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";

import SessionNotes from "@/components/SessionNotes";
import RevisionManager from "@/components/RevisionManager";

type Revision = { _id?: string; date: string; done: boolean };

type SessionSummary = {
  _id: string;
  topic: string;
  duration: number;
  createdAt: string;
  startTime: string;
};

type SessionDetail = {
  _id: string;
  topic: string;
  description: string;
  duration: number;
  createdAt: string;
  startTime: string;
  endTime: string;
  timestamps: string[];
  revisions: Revision[];
};

const rowsPerPage = 15;

/* ── Formatters ── */
const fmtDate = (x: string) =>
  new Date(x).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (x: string) =>
  new Date(x).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
const dur = (s: number) =>
  s >= 3600
    ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
    : s >= 60
    ? `${Math.floor(s / 60)}m ${s % 60}s`
    : `${s}s`;

export default function OldSessionsPage() {
  /* ── List state ── */
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ── Filter state ── */
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filters, setFilters] = useState({ search: "", sort: "desc", fromDate: "", toDate: "" });

  /* ── Detail state ── */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ── Edit state ── */
  const [formData, setFormData] = useState({ topic: "", description: "" });
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [saving, setSaving] = useState(false);

  /* ── Fetch list ── */
  useEffect(() => {
    setListLoading(true);
    axios
      .get("/api/session", { params: { page, limit: rowsPerPage, ...filters } })
      .then((res) => {
        const list = res.data.data || [];
        setSessions(list);
        setTotalPages(res.data.pagination?.totalPages ?? 1);
        if (list.length > 0 && !selectedId) setSelectedId(list[0]._id);
      })
      .catch(() => toast.error("Failed to load sessions"))
      .finally(() => setListLoading(false));
  }, [page, filters]);

  /* ── Fetch detail ── */
  useEffect(() => {
    if (!selectedId) return;
    setDetailLoading(true);
    fetch(`/api/session/${selectedId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error();
        const s: SessionDetail = json.data;
        setDetail(s);
        setFormData({ topic: s.topic, description: s.description });
        setRevisions(s.revisions || []);
      })
      .catch(() => toast.error("Failed to load session"))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  /* ── Apply filters ── */
  const applyFilters = () => {
    setPage(1);
    setFilters({ search, sort: sortOrder, fromDate, toDate });
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!formData.topic.trim()) return toast.warning("Topic is required");
    try {
      setSaving(true);
      const res = await fetch(`/api/session/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: formData.topic, description: formData.description, revisions }),
      });
      const json = await res.json();
      if (!json.success) throw new Error();
      setDetail(json.data);
      setRevisions(json.data.revisions || []);
      setSessions((prev) => prev.map((s) => (s._id === selectedId ? { ...s, topic: formData.topic } : s)));
      toast.success("Session updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    try {
      await fetch(`/api/session/${selectedId}`, { method: "DELETE" });
      toast.success("Session deleted");
      const remaining = sessions.filter((s) => s._id !== selectedId);
      setSessions(remaining);
      setSelectedId(remaining[0]?._id ?? null);
      setDetail(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ── Timeline calc ── */
  const timelineData = detail
    ? (() => {
        const start = new Date(detail.startTime).getTime();
        const end = new Date(detail.endTime).getTime();
        const totalMs = Math.max(end - start, 1);
        const segments: { start: number; stop: number }[] = [];
        for (let i = 0; i < detail.timestamps.length; i += 2) {
          if (!detail.timestamps[i] || !detail.timestamps[i + 1]) continue;
          segments.push({
            start: new Date(detail.timestamps[i]).getTime(),
            stop: new Date(detail.timestamps[i + 1]).getTime(),
          });
        }
        const totalSeconds = Math.max(Math.floor((end - start) / 1000), 1);
        const activePercent = Math.min(100, Math.round((detail.duration / totalSeconds) * 100));
        const focusSegments = Math.floor(detail.timestamps.length / 2);
        return { start, end, totalMs, segments, totalSeconds, activePercent, focusSegments };
      })()
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-55px)] bg-white dark:bg-black overflow-hidden">

      {/* ── Filter bar ── */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex flex-wrap gap-2 items-center shrink-0">
        <input
          placeholder="Search topic…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[160px] px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />

        <button
          onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
          className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          {sortOrder === "asc" ? "Oldest first" : "Newest first"}
        </button>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-zinc-400 whitespace-nowrap">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none" />
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-zinc-400 whitespace-nowrap">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none" />
        </div>

        <button
          onClick={applyFilters}
          className="px-4 py-1.5 text-sm rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition"
        >
          Apply
        </button>

        {(search || fromDate || toDate) && (
          <button
            onClick={() => { setSearch(""); setFromDate(""); setToDate(""); setFilters({ search: "", sort: sortOrder, fromDate: "", toDate: "" }); }}
            className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Split pane ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Session list */}
        <div className="w-82 shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {listLoading && <p className="p-4 text-sm text-zinc-400">Loading…</p>}

            {!listLoading && sessions.length === 0 && (
              <p className="p-4 text-sm text-zinc-400">No sessions found.</p>
            )}

            {sessions.map((s) => {
              const isActive = selectedId === s._id;
              return (
                <button
                  key={s._id}
                  onClick={() => setSelectedId(s._id)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 transition
                    ${isActive
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                >
                  <p className="text-sm font-medium truncate">{s.topic}</p>
                  <div className={`flex items-center justify-between mt-0.5`}>
                    <p className={`text-xs ${isActive ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-400"}`}>
                      {fmtDate(s.createdAt)}
                    </p>
                    <p className={`text-xs ${isActive ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-400"}`}>
                      {dur(s.duration)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 flex flex-wrap gap-1 justify-center">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-2.5 py-1 text-xs rounded border transition
                    ${page === i + 1
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent"
                      : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Session detail */}
        <div className="flex-1 overflow-y-auto px-8 py-8 relative">
          {detailLoading && <p className="text-sm text-zinc-400">Loading…</p>}

          {!detailLoading && !detail && (
            <p className="text-sm text-zinc-400">Select a session to view it.</p>
          )}

          {!detailLoading && detail && timelineData && (
            <div className="space-y-8 max-w-5xl ">

              {/* Header */}
              <div>
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{detail.topic}</h1>
                <p className="text-xs text-zinc-400 mt-1">{fmtDate(detail.createdAt)} · {fmtTime(detail.startTime)} → {fmtTime(detail.endTime)}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {[
                  { label: "Active Time", value: dur(detail.duration) },
                  { label: "Total Time", value: dur(timelineData.totalSeconds) },
                  { label: "Active %", value: `${timelineData.activePercent}%` },
                  { label: "Focus Segments", value: timelineData.focusSegments },
                ].map((stat) => (
                  <div key={stat.label} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
                    <p className="text-xs text-zinc-400 mb-1">{stat.label}</p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Activity Timeline</p>
                <div className="relative w-full h-[6px] bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  {timelineData.segments.map((seg, idx) => {
                    const left = ((seg.start - timelineData.start) / timelineData.totalMs) * 100;
                    const width = ((seg.stop - seg.start) / timelineData.totalMs) * 100;
                    return (
                      <div
                        key={idx}
                        className="absolute top-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-[0_0_12px_rgba(168,85,247,0.9)]"
                        style={{ left: `${Math.max(left, 0)}%`, width: `${Math.min(width, 100)}%` }}
                      />
                    );
                  })}
                </div>
                <div className="relative w-full text-xs text-zinc-400 h-4">
                  {timelineData.segments.map((seg, idx) => {
                    const left = ((seg.start - timelineData.start) / timelineData.totalMs) * 100;
                    const stop = ((seg.stop - timelineData.start) / timelineData.totalMs) * 100;
                    return (
                      <div key={idx}>
                        <span className="absolute -translate-x-1/2" style={{ left: `${left}%` }}>{fmtTime(new Date(seg.start).toISOString())}</span>
                        <span className="absolute -translate-x-1/2" style={{ left: `${stop}%` }}>{fmtTime(new Date(seg.stop).toISOString())}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes editor */}
              <SessionNotes
                initialTopic={formData.topic}
                initialDescription={formData.description}
                onData={(data) => setFormData((prev) => ({ ...prev, ...data }))}
              />

              {/* Revisions */}
              <RevisionManager revisions={revisions} setRevisions={setRevisions} />

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 rounded-lg text-sm text-red-600 border border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Delete
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
