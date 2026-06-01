"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import SessionNotes from "@/components/SessionNotes";
import RevisionManager, { Revision } from "@/components/RevisionManager";

type Note = {
  _id: string;
  topic: string;
  subject: string;
  description: string;
  importance: "low" | "medium" | "high";
  revisions: Revision[];
};

export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();

  const subject = decodeURIComponent(params.subject as string);
  const noteId = params.noteId as string;

  const [note, setNote] = useState<Note | null>(null);
  const [noteData, setNoteData] = useState<{
    topic?: string;
    description?: string;
  }>({});
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [importance, setImportance] =
    useState<"low" | "medium" | "high">("medium");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH NOTE ================= */

  useEffect(() => {
    const fetchNote = async () => {
      try {
        console.log("Fetching note:", subject, noteId);
        const res = await fetch(
          `/api/note/${encodeURIComponent(subject)}/${noteId}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setNote(data.data);
        setNoteData({
          topic: data.data.topic,
          description: data.data.description,
        });
        setRevisions(data.data.revisions || []);
        setImportance(data.data.importance);
      } catch (err: any) {
        toast.error(err.message || "Failed to load note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, subject]);

  /* ================= UPDATE NOTE ================= */

  const handleSave = async () => {
    if (!noteData.topic?.trim()) {
      toast.warning("Topic is required");
      return;
    }

    if (!noteData.description?.trim()) {
      toast.warning("Description is required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(
        `/api/note/${encodeURIComponent(subject)}/${noteId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: noteData.topic,
            description: noteData.description,
            importance,
            revisions,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Note updated");
      setNote(data.data);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE NOTE ================= */

  const handleDelete = async () => {
    if (!confirm("Delete this note?")) return;

    try {
      const res = await fetch(
        `/api/note/${encodeURIComponent(subject)}/${noteId}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Note deleted");
      router.push(`/note/${encodeURIComponent(subject)}`);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading note...</div>;
  }

  if (!note) {
    return <div className="p-6 text-red-500">Note not found</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-black">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
          Edit Note
        </h1>

        <button
          onClick={handleDelete}
          className="text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>

      {/* IMPORTANCE */}
      <div className="mb-6">
        <select
          value={importance}
          onChange={(e) =>
            setImportance(e.target.value as "low" | "medium" | "high")
          }
          className="px-4 py-2 rounded-lg border
            bg-white dark:bg-zinc-900
            text-gray-900 dark:text-zinc-100
            border-gray-300 dark:border-zinc-700"
        >
          <option value="low">Low importance</option>
          <option value="medium">Medium importance</option>
          <option value="high">High importance</option>
        </select>
      </div>

      {/* EDITOR */}
      <SessionNotes
        onData={(data) =>
          setNoteData((prev) => ({ ...prev, ...data }))
        }
        initialTopic={note.topic}
        initialDescription={note.description}
      />

      {/* REVISIONS */}
      <div className="mt-6">
        <RevisionManager
          revisions={revisions}
          setRevisions={setRevisions}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-lg
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
