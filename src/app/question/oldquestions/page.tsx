"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

type Subject = {
  _id: string;
  name: string;
  questionsCount: number;
  createdAt: string;
};

type SortType =
  | "newest"
  | "oldest"
  | "most-questions"
  | "least-questions";

export default function OldQuestionPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<SortType>("newest");

  /* ================= FETCH ================= */

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/questionsubject");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSubjects(data.data || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  /* ================= SORT ================= */

  const sortedSubjects = [...subjects].sort((a, b) => {
    if (sortBy === "newest") {
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    }
    if (sortBy === "oldest") {
      return (
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
      );
    }
    if (sortBy === "most-questions") {
      return b.questionsCount - a.questionsCount;
    }
    if (sortBy === "least-questions") {
      return a.questionsCount - b.questionsCount;
    }
    return 0;
  });

  /* ================= CREATE ================= */

  const handleCreateSubject = async () => {
    if (!subjectName.trim()) {
      toast.warning("Subject is required");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/questionsubject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSubject: subjectName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Subject created");
      setSubjectName("");
      setOpen(false);
      fetchSubjects();
    } catch (err: any) {
      toast.error(err.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteSubject = async (name: string) => {
    if (!confirm(`Delete "${name}" and all its questions?`)) return;

    try {
      setDeleting(name);
      const res = await fetch(
        `/api/questionsubject?subject=${encodeURIComponent(name)}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Subject deleted");
      fetchSubjects();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 dark:bg-zinc-950 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
          Question Subjects
        </h1>

        <div className="flex items-center gap-3">
          {/* SORT */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as SortType)
            }
            className="px-3 py-2 rounded-md border
              bg-white dark:bg-zinc-900
              text-gray-700 dark:text-zinc-200
              border-gray-300 dark:border-zinc-700"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="most-questions">Most questions</option>
            <option value="least-questions">Least questions</option>
          </select>

          {/* ADD BUTTON */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md
              bg-blue-600 hover:bg-blue-700
              text-white font-medium shadow"
          >
            <span className="text-xl leading-none">+</span>
            Add
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedSubjects.map((subject) => (
          <div
            key={subject._id}
            className="relative rounded-xl p-4
              bg-zinc-100 dark:bg-zinc-800
              border border-zinc-400 dark:border-zinc-800
              hover:shadow-md transition"
          >
            <Link
              href={`/question/oldquestions/${encodeURIComponent(subject.name)}`}
              className="block"
            >
              <h2 className="text-lg font-medium capitalize text-gray-900 dark:text-zinc-100">
                {subject.name}
              </h2>

              <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                Questions: {subject.questionsCount}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Created{" "}
                {new Date(subject.createdAt).toLocaleDateString()}
              </p>
            </Link>

            {/* DELETE */}
            <button
              onClick={() => handleDeleteSubject(subject.name)}
              disabled={deleting === subject.name}
              className="absolute top-3 right-3 text-sm
                text-red-500 hover:text-red-600"
            >
              {deleting === subject.name ? "..." : "✕"}
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl p-6 bg-white dark:bg-zinc-900">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">
              Create Question Subject
            </h2>

            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Enter subject name"
              className="w-full px-3 py-2 rounded-md
                border border-gray-300 dark:border-zinc-700
                bg-gray-50 dark:bg-zinc-800
                text-gray-900 dark:text-zinc-100"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateSubject}
                disabled={creating}
                className="px-4 py-2 rounded-md text-sm
                  bg-blue-600 hover:bg-blue-700
                  text-white disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
