"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

type Subject = { _id: string; name: string; questionsCount: number; createdAt: string };

export default function OldQuestionPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/questionsubject");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSubjects((data.data || []).sort((a: Subject, b: Subject) => b.questionsCount - a.questionsCount));
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleCreate = async () => {
    if (!subjectName.trim()) return toast.warning("Subject name is required");
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

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete "${name}" and all its questions?`)) return;
    try {
      setDeleting(name);
      const res = await fetch(`/api/questionsubject?subject=${encodeURIComponent(name)}`, { method: "DELETE" });
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

  if (loading) return <div className="p-6 text-zinc-400">Loading...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen px-8 py-10 bg-white dark:bg-black">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Questions</h1>
          <p className="text-sm text-zinc-400">{subjects.length} subjects</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-1.5 rounded-full text-sm border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
        >
          + New subject
        </button>
      </div>

      {subjects.length === 0 && <p className="text-sm text-zinc-400">No subjects yet.</p>}

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <div
            key={subject._id}
            className="relative group rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
          >
            {/* Hazy background */}
            <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-zinc-100/40 to-zinc-200/60 dark:from-zinc-800/60 dark:via-zinc-900/40 dark:to-black/60 transition-opacity duration-200 group-hover:opacity-80" />
            <div className="absolute inset-0 border border-zinc-200 dark:border-zinc-800 rounded-2xl group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors duration-200" />

            <Link href={`/question/${encodeURIComponent(subject.name)}`} className="relative block px-5 py-5">
              <h2 className="text-base font-medium capitalize text-zinc-900 dark:text-zinc-100 mb-3">
                {subject.name}
              </h2>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {subject.questionsCount} {subject.questionsCount === 1 ? "question" : "questions"}
                </span>
                <span className="text-xs text-zinc-400">
                  {new Date(subject.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </Link>

            {/* Delete */}
            <button
              onClick={() => handleDelete(subject.name)}
              disabled={deleting === subject.name}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-zinc-400 hover:text-red-500 text-xs"
            >
              {deleting === subject.name ? "…" : "✕"}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <h2 className="text-base font-semibold mb-4 text-zinc-900 dark:text-zinc-100">New subject</h2>
            <input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Subject name"
              autoFocus
              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none pb-1 mb-6"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="text-sm text-zinc-400 hover:text-zinc-600 transition">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-1.5 rounded-full text-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-80 transition disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}