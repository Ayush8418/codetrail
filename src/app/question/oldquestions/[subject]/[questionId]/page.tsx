"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import SessionNotes from "@/components/SessionNotes";
import RevisionManager, { Revision } from "@/components/RevisionManager";

type Question = {
  _id: string;
  subject: string;
  name: string[];
  question: string;
  solution: string;
  difficulty: "easy" | "medium" | "hard";
  importance: "low" | "medium" | "high";
  revisions: Revision[];
};

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();

  const subject = decodeURIComponent(params.subject as string);
  const questionId = params.questionId as string;

  const [nameInput, setNameInput] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [solution, setSolution] = useState("");

  const [difficulty, setDifficulty] =
    useState<"easy" | "medium" | "hard">("easy");

  const [importance, setImportance] =
    useState<"low" | "medium" | "high">("medium");

  const [revisions, setRevisions] = useState<Revision[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [subjects, setSubjects] = useState<{ _id: string; name: string }[]>([]);
const [selectedSubject, setSelectedSubject] = useState(subject);


  /* ================= FETCH ================= */

  useEffect(() => {
  const fetchSubjects = async () => {
    const res = await fetch("/api/questionsubject");
    const data = await res.json();
    if (res.ok) setSubjects(data.data || []);
  };
  fetchSubjects();
}, []);


  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(
          `/api/question/${encodeURIComponent(subject)}/${questionId}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const q = data.data;
        setNameInput(q.name.join(", "));
        setQuestionText(q.question || "");
        setSolution(q.solution || "");
        setDifficulty(q.difficulty);
        setImportance(q.importance);
        setRevisions(q.revisions || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load question");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, subject]);

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!nameInput.trim()) {
      toast.warning("Question name is required");
      return;
    }

    if (!questionText.trim()) {
      toast.warning("Question text is required");
      return;
    }

    if (!solution.trim()) {
      toast.warning("Solution is required");
      return;
    }

    const name = nameInput
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      const res = await fetch(
        `/api/question/${encodeURIComponent(subject)}/${questionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            subject: selectedSubject, // ✅ added
            question: questionText,
            solution,
            difficulty,
            importance,
            revisions,
          }),

        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Question updated");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
  <div className="min-h-screen bg-white dark:bg-black px-6 py-8">
    {/* ================= HEADER ================= */}
    <div className="flex flex-col gap-3 mb-6">

      {/* SUBJECT (INLINE EDITABLE) */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-500 font-medium">
          Subject
        </label>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="
            text-3xl font-extrabold capitalize
            bg-transparent border-none outline-none
            text-zinc-900 dark:text-zinc-100
            cursor-pointer
            focus:ring-0
          "
        >
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

      {/* QUESTION NAME (UNDERLINED, NO BOX) */}
      <div>
        <label className="block text-xs mb-1 text-zinc-500">
          Question Name
        </label>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter question name"
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
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={4}
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
          initialDescription={solution}
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
        // onClick={handleDelete}
        className="
          px-5 py-2 rounded-lg text-sm
          text-red-600 border border-red-300
          hover:bg-red-50 dark:hover:bg-red-900/20
        "
      >
        Delete
      </button>

      <button
        onClick={handleSave}
        disabled={saving}
        className="
          px-6 py-2 rounded-lg text-sm font-semibold
          bg-indigo-600 hover:bg-indigo-700
          text-white
          disabled:opacity-50
        "
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  </div>
);

}
