"use client";
import RevisionManager, { Revision } from "@/components/RevisionManager";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import SessionNotes from "@/components/SessionNotes";

type Subject = {
  _id: string;
  name: string;
};

type NotePayload = {
  topic?: string;
  description?: string;
};

export default function NewNotePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState("");
  const [importance, setImportance] = useState<
    "low" | "medium" | "high"
  >("medium");

  const [noteData, setNoteData] = useState<NotePayload>({});
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);


  /* ================= FETCH SUBJECTS ================= */

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("/api/notesubject");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSubjects(data.data || []);
      } catch {
        toast.error("Failed to load subjects");
      }
    };

    fetchSubjects();
  }, []);

  /* ================= CREATE NOTE ================= */

  const handleCreateNote = async () => {
    if (!subject) {
      toast.warning("Subject is required");
      return;
    }

    if (!noteData.topic?.trim()) {
      toast.warning("Topic is required");
      return;
    }

    if (!noteData.description?.trim()) {
      toast.warning("Description is required");
      return;
    }

    try {
      setLoading(true);
      if (revisions.length > 0) {
        const hasInvalid = revisions.some((r) => !r.date);
        if (hasInvalid) {
            toast.warning("All revisions must have a date");
            return;
        }
        }


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

      toast.success("Note created successfully");

      // reset
      setSubject("");
      setImportance("medium");
      setNoteData({});
    } catch (err: any) {
      toast.error(err.message || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-zinc-950">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-zinc-100">
        Create New Note
      </h1>

      {/* ================= SUBJECT + IMPORTANCE ================= */}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Subject */}
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="px-4 py-3 rounded-lg border
            bg-white dark:bg-zinc-900
            text-gray-900 dark:text-zinc-100
            border-gray-300 dark:border-zinc-700"
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Importance */}
        <select
          value={importance}
          onChange={(e) =>
            setImportance(e.target.value as "low" | "medium" | "high")
          }
          className="px-4 py-3 rounded-lg border
            bg-white dark:bg-zinc-900
            text-gray-900 dark:text-zinc-100
            border-gray-300 dark:border-zinc-700"
        >
          <option value="low">Low importance</option>
          <option value="medium">Medium importance</option>
          <option value="high">High importance</option>
        </select>
      </div>

      {/* ================= EDITOR ================= */}
<SessionNotes
  onData={(data) =>
    setNoteData((prev) => ({ ...prev, ...data }))
  }
  initialTopic={null}
  initialDescription={null}
/>

{/* 🔁 REVISION MANAGER */}
<div className="mt-6">
  <RevisionManager
    revisions={revisions}
    setRevisions={setRevisions}
  />
</div>

      

      {/* ================= ACTION ================= */}

      <div className="flex justify-end mt-8">
        <button
          onClick={handleCreateNote}
          disabled={loading}
          className="px-6 py-3 rounded-lg text-white font-medium
            bg-blue-600 hover:bg-blue-700
            disabled:opacity-50"
        >
          {loading ? "Saving..." : "Create Note"}
        </button>
      </div>
    </div>
  );
}
