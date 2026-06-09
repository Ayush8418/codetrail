"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import SessionNotes from "@/components/SessionNotes";
import RevisionManager, { Revision } from "@/components/RevisionManager";
import NewNoteForm from "@/components/NewNoteForm";

type NoteSummary = {
  _id: string;
  topic: string;
  importance: "low" | "medium" | "high";
  createdAt: string;
};

type NoteDetail = {
  _id: string;
  topic: string;
  subject: string;
  description: string;
  importance: "low" | "medium" | "high";
  revisions: Revision[];
};

export default function SubjectNotesPage() {
  const params = useParams();
  const subject = decodeURIComponent(params.subject as string);

  /* ── List state ── */
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [subjects, setSubjects] = useState<{ _id: string; name: string }[]>([]);

  /* ── Mode: "detail" | "new" ── */
  const [mode, setMode] = useState<"detail" | "new">("detail");

  /* ── Detail state ── */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<NoteDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ── Edit state ── */
  const [noteData, setNoteData] = useState<{ topic?: string; description?: string }>({});
  const [importance, setImportance] = useState<"low" | "medium" | "high">("medium");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [saving, setSaving] = useState(false);

  /* ── Fetch notes list ── */
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/note/${encodeURIComponent(subject)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        const list = data.data || [];
        setNotes(list);
        if (list.length > 0) setSelectedId(list[0]._id);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch notes");
      } finally {
        setListLoading(false);
      }
    };
    fetch_();
  }, [subject]);

  /* ── Fetch subjects (for NewNoteForm) ── */
  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch("/api/notesubject");
      const data = await res.json();
      if (res.ok) setSubjects(data.data || []);
    };
    fetch_();
  }, []);

  /* ── Fetch note detail ── */
  useEffect(() => {
    if (!selectedId || mode === "new") return;
    const fetch_ = async () => {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/note/${encodeURIComponent(subject)}/${selectedId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        const n: NoteDetail = data.data;
        setDetail(n);
        setNoteData({ topic: n.topic, description: n.description });
        setImportance(n.importance);
        setRevisions(n.revisions || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load note");
      } finally {
        setDetailLoading(false);
      }
    };
    fetch_();
  }, [selectedId, subject, mode]);

  /* ── Save ── */
  const handleSave = async () => {
    if (!noteData.topic?.trim()) return toast.warning("Topic is required");
    if (!noteData.description?.trim()) return toast.warning("Description is required");

    try {
      setSaving(true);
      const res = await fetch(`/api/note/${encodeURIComponent(subject)}/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: noteData.topic, description: noteData.description, importance, revisions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Note updated");
      setNotes((prev) => prev.map((n) => (n._id === selectedId ? { ...n, topic: noteData.topic!, importance } : n)));
      setDetail(data.data);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/note/${encodeURIComponent(subject)}/${selectedId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Note deleted");
      const remaining = notes.filter((n) => n._id !== selectedId);
      setNotes(remaining);
      setSelectedId(remaining[0]?._id ?? null);
      setDetail(null);
      setMode("detail");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  /* ── After creation ── */
  const handleCreated = (newNote: NoteSummary) => {
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote._id);
    setMode("detail");
  };

  /* ── Select note ── */
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMode("detail");
  };

  /* ── Importance badge ── */
  const importanceBadge = (imp: string) =>
    imp === "high"
      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      : imp === "medium"
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

  return (
    <div className="flex h-[calc(100vh-55px)] bg-white dark:bg-black overflow-hidden">

      {/* ── LEFT: Notes list ── */}
      <div className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h1 className="text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-100">{subject}</h1>
          <p className="text-xs text-zinc-400">{notes.length} notes</p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {listLoading && <p className="p-4 text-sm text-zinc-400">Loading…</p>}

          {!listLoading && notes.length === 0 && (
            <p className="p-4 text-sm text-zinc-400">No notes found.</p>
          )}

          {notes.map((note) => {
            const isActive = mode === "detail" && selectedId === note._id;
            return (
              <button
                key={note._id}
                onClick={() => handleSelect(note._id)}
                className={`w-full text-left px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 transition
                  ${isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{note.topic}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${importanceBadge(note.importance)}`}>
                    {note.importance}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isActive ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-400"}`}>
                  {new Date(note.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── New note row ── */}
        <button
          onClick={() => setMode("new")}
          className={`w-full text-left px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 transition flex items-center gap-2
            ${mode === "new"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
        >
          <span className="text-lg leading-none">+</span>
          <span className="text-sm">New note</span>
        </button>
      </div>

      {/* ── RIGHT: Detail or New form ── */}
      <div className="flex-1 overflow-y-auto">

        {/* New note form */}
        {mode === "new" && (
          <NewNoteForm
            subjects={subjects}
            defaultSubject={subject}
            onCreated={handleCreated}
            onCancel={() => setMode("detail")}
          />
        )}

        {/* Note detail */}
        {mode === "detail" && (
          <div className="px-8 py-8">
            {detailLoading && <p className="text-sm text-zinc-400">Loading…</p>}

            {!detailLoading && !detail && (
              <p className="text-sm text-zinc-400">Select a note to view it.</p>
            )}

            {!detailLoading && detail && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-zinc-500 font-medium">Importance</label>
                    <select
                      value={importance}
                      onChange={(e) => setImportance(e.target.value as any)}
                      className="rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Editor */}
                <SessionNotes
                  onData={(data) => setNoteData((prev) => ({ ...prev, ...data }))}
                  initialTopic={detail.topic}
                  initialDescription={detail.description}
                />

                {/* Revisions */}
                <div className="mt-6">
                  <label className="block text-xs mb-2 text-zinc-500">Revisions</label>
                  <RevisionManager revisions={revisions} setRevisions={setRevisions} />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2 rounded-lg text-sm text-red-600 border border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
