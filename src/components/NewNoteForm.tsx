"use client";

import { useState } from "react";
import { toast } from "sonner";

import SessionNotes from "@/components/SessionNotes";
import RevisionManager, { Revision } from "@/components/RevisionManager";

type Subject = { _id: string; name: string };

type NoteSummary = {
  _id: string;
  topic: string;
  createdAt: string;
  importance: "low" | "medium" | "high";
};

type Props = {
  subjects: Subject[];
  defaultSubject: string;
  onCreated: (newNote: NoteSummary) => void;
  onCancel: () => void;
};

export default function NewNoteForm({ subjects, defaultSubject, onCreated, onCancel }: Props) {
  const [subject, setSubject] = useState(defaultSubject);
  const [importance, setImportance] = useState<"low" | "medium" | "high">("medium");
  const [noteData, setNoteData] = useState<{ topic?: string; description?: string }>({});
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!subject) return toast.warning("Subject is required");
    if (!noteData.topic?.trim()) return toast.warning("Topic is required");
    if (!noteData.description?.trim()) return toast.warning("Description is required");
    if (revisions.some((r) => !r.date)) return toast.warning("All revisions must have a date");

    try {
      setLoading(true);
      const res = await fetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic: noteData.topic,
          description: noteData.description,
          importance,
          revisions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Note created");
      onCreated(data.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-8">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-500 font-medium">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-3xl font-extrabold capitalize bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 cursor-pointer focus:ring-0"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <label className="block text-xs mb-1 text-zinc-500">Importance</label>
          <select
            value={importance}
            onChange={(e) => setImportance(e.target.value as any)}
            className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* ── Editor ── */}
      <SessionNotes
        onData={(data) => setNoteData((prev) => ({ ...prev, ...data }))}
        initialTopic={null}
        initialDescription={null}
      />

      {/* ── Revisions ── */}
      <div className="mt-6">
        <label className="block text-xs mb-2 text-zinc-500">Revisions</label>
        <RevisionManager revisions={revisions} setRevisions={setRevisions} />
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-lg text-sm border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Note"}
        </button>
      </div>
    </div>
  );
}
