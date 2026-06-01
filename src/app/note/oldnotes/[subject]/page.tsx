"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Note = {
  _id: string;
  topic: string;
  description: string;
  importance: "low" | "medium" | "high";
  createdAt: string;
};

export default function SubjectNotesPage() {
  const params = useParams();
  const subject = decodeURIComponent(params.subject as string);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`/api/note/${encodeURIComponent(subject)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch notes");
        }

        setNotes(data.data || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [subject]);

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading notes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-zinc-950">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 capitalize">
          {subject} Notes
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Total notes: {notes.length}
        </p>
      </div>

      {/* EMPTY STATE */}
      {notes.length === 0 && (
        <div className="text-gray-500">
          No notes found for this subject.
        </div>
      )}

      {/* NOTES LIST */}
      <div className="space-y-4">
        {notes.map((note) => (
          <Link
            key={note._id}
            href={`${subject}/${note._id}`}
            className="block"
          >
            <div
              className="
                rounded-xl p-4
                bg-white dark:bg-zinc-900
                border border-gray-200 dark:border-zinc-800
                hover:shadow-md transition
              "
            >
              {/* TOP ROW */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">
                  {note.topic}
                </h2>

                <span
                  className={`text-xs px-2 py-1 rounded-md font-medium
                    ${
                      note.importance === "high"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : note.importance === "medium"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }
                  `}
                >
                  {note.importance}
                </span>
              </div>

              {/* DESCRIPTION PREVIEW */}
              <div
                className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: note.description,
                }}
              />

              {/* FOOTER */}
              <p className="text-xs text-gray-400 mt-3">
                Created on{" "}
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
