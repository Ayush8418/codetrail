"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import SessionNotes from "@/components/SessionNotes";
import RevisionManager, { Revision } from "@/components/RevisionManager";

type Subject = {
  _id: string;
  name: string;
};

export default function NewQuestionPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState("");

  const [nameInput, setNameInput] = useState(""); // comma separated
  const [question, setQuestion] = useState("");

  const [solution, setSolution] = useState("");

  const [difficulty, setDifficulty] =
    useState<"easy" | "medium" | "hard">("easy");

  const [importance, setImportance] =
    useState<"low" | "medium" | "high">("medium");

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH SUBJECTS ================= */

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("/api/questionsubject");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSubjects(data.data || []);
      } catch {
        toast.error("Failed to load question subjects");
      }
    };

    fetchSubjects();
  }, []);

  /* ================= CREATE QUESTION ================= */

  const handleCreateQuestion = async () => {
    if (!subject) {
      toast.warning("Subject is required");
      return;
    }

    if (!nameInput.trim()) {
      toast.warning("Question name is required");
      return;
    }

    if (!question.trim()) {
      toast.warning("Question is required");
      return;
    }

    if (!solution.trim()) {
      toast.warning("Solution is required");
      return;
    }

    if (revisions.some((r) => !r.date)) {
      toast.warning("All revisions must have a date");
      return;
    }

    const name = nameInput
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    try {
      setLoading(true);

      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          name,
          question,
          solution,
          difficulty,
          importance,
          revisions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Question created successfully");

      // reset
      setSubject("");
      setNameInput("");
      setQuestion("");
      setSolution("");
      setDifficulty("easy");
      setImportance("medium");
      setRevisions([]);
    } catch (err: any) {
      toast.error(err.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-6 py-8">
    {/* ================= HEADER ================= */}
    <div className="flex flex-col gap-3 mb-6">

      {/* SUBJECT (INLINE SELECT) */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-500 font-medium">
          Subject
        </label>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="
            text-3xl font-extrabold capitalize
            bg-transparent border-none outline-none
            text-zinc-900 dark:text-zinc-100
            cursor-pointer
          "
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* META CONTROLS */}
      <div className="flex gap-4">
        <div className="w-40">
          <label className="block text-xs mb-1 text-zinc-500">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as any)
            }
            className="
              w-full rounded-lg px-3 py-2 text-sm
              bg-white dark:bg-zinc-900
              border border-zinc-300 dark:border-zinc-800
              text-zinc-900 dark:text-zinc-100
            "
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="w-40">
          <label className="block text-xs mb-1 text-zinc-500">
            Importance
          </label>
          <select
            value={importance}
            onChange={(e) =>
              setImportance(e.target.value as any)
            }
            className="
              w-full rounded-lg px-3 py-2 text-sm
              bg-white dark:bg-zinc-900
              border border-zinc-300 dark:border-zinc-800
              text-zinc-900 dark:text-zinc-100
            "
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </div>

    {/* ================= MAIN CONTENT ================= */}
    <div className="space-y-6">

      {/* QUESTION NAME */}
      <div>
        <label className="block text-xs mb-1 text-zinc-500">
          Question Name (comma separated)
        </label>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Binary Search on Answer"
          className="
            w-full bg-transparent
            text-2xl font-bold
            text-zinc-900 dark:text-zinc-100
            border-b border-zinc-400 dark:border-zinc-700
            focus:outline-none focus:border-indigo-500
            pb-1
          "
        />
      </div>

      {/* QUESTION TEXT */}
      <div>
        <label className="block text-xs mb-1 text-zinc-500">
          Question
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          placeholder="Write the problem statement here..."
          className="
            w-full rounded-lg px-3 py-2 text-sm
            bg-white dark:bg-zinc-900
            border border-zinc-300 dark:border-zinc-800
            text-zinc-900 dark:text-zinc-100
          "
        />
      </div>

      {/* SOLUTION */}
      <div>
        <label className="block text-xs mb-2 text-zinc-500">
          Solution
        </label>
        <SessionNotes
          onData={(data) => {
            if (data.description !== undefined) {
              setSolution(data.description);
            }
          }}
          initialTopic={null}
          initialDescription={null}
          showTopic={false}
        />
      </div>

      {/* REVISIONS */}
      <div>
        <label className="block text-xs mb-2 text-zinc-500">
          Revisions
        </label>
        <RevisionManager
          revisions={revisions}
          setRevisions={setRevisions}
        />
      </div>
    </div>

    {/* ================= ACTION BAR ================= */}
    <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      <button
        onClick={handleCreateQuestion}
        disabled={loading}
        className="
          px-6 py-2 rounded-lg text-sm font-semibold
          bg-indigo-600 hover:bg-indigo-700
          text-white
          disabled:opacity-50
        "
      >
        {loading ? "Creating..." : "Create Question"}
      </button>
    </div>
  </div>
);

}
