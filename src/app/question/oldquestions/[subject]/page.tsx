"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import SessionNotes from "@/components/SessionNotes";
import RevisionManager, { Revision } from "@/components/RevisionManager";
import NewQuestionForm from "@/components/NewQuestionForm";

type QuestionSummary = {
  _id: string;
  name: string[];
  createdAt: string;
  difficulty: "easy" | "medium" | "hard";
  importance: "low" | "medium" | "high";
};

type QuestionDetail = {
  _id: string;
  subject: string;
  name: string[];
  question: string;
  solution: string;
  difficulty: "easy" | "medium" | "hard";
  importance: "low" | "medium" | "high";
  revisions: Revision[];
};

export default function SubjectQuestionsPage() {
  const params = useParams();
  const subject = decodeURIComponent(params.subject as string);

  /* ── List state ── */
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);

  /* ── View mode: "detail" | "new" ── */
  const [mode, setMode] = useState<"detail" | "new">("detail");

  /* ── Detail state ── */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<QuestionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ── Edit state ── */
  const [nameInput, setNameInput] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [solution, setSolution] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [importance, setImportance] = useState<"low" | "medium" | "high">("medium");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [subjects, setSubjects] = useState<{ _id: string; name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState(subject);
  const [saving, setSaving] = useState(false);

  /* ── Fetch list ── */
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/question/${encodeURIComponent(subject)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        const list = data.data || [];
        setQuestions(list);
        if (list.length > 0) setSelectedId(list[0]._id);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch questions");
      } finally {
        setListLoading(false);
      }
    };
    fetch_();
  }, [subject]);

  /* ── Fetch subjects ── */
  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch("/api/questionsubject");
      const data = await res.json();
      if (res.ok) setSubjects(data.data || []);
    };
    fetch_();
  }, []);

  /* ── Fetch detail when selectedId changes ── */
  useEffect(() => {
    if (!selectedId || mode === "new") return;
    const fetch_ = async () => {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/question/${encodeURIComponent(subject)}/${selectedId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        const q: QuestionDetail = data.data;
        setDetail(q);
        setNameInput(q.name.join(", "));
        setQuestionText(q.question || "");
        setSolution(q.solution || "");
        setDifficulty(q.difficulty);
        setImportance(q.importance);
        setRevisions(q.revisions || []);
        setSelectedSubject(q.subject);
      } catch (err: any) {
        toast.error(err.message || "Failed to load question");
      } finally {
        setDetailLoading(false);
      }
    };
    fetch_();
  }, [selectedId, subject, mode]);

  /* ── Save ── */
  const handleSave = async () => {
    if (!nameInput.trim()) return toast.warning("Question name is required");
    if (!questionText.trim()) return toast.warning("Question text is required");
    if (!solution.trim()) return toast.warning("Solution is required");

    const name = nameInput.split(",").map((n) => n.trim()).filter(Boolean);

    try {
      setSaving(true);
      const res = await fetch(
        `/api/question/${encodeURIComponent(subject)}/${selectedId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, subject: selectedSubject, question: questionText, solution, difficulty, importance, revisions }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Question updated");
      setQuestions((prev) => prev.map((q) => (q._id === selectedId ? { ...q, name } : q)));
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── After creation ── */
  const handleCreated = (newQ: QuestionSummary) => {
    setQuestions((prev) => [newQ, ...prev]);
    setSelectedId(newQ._id);
    setMode("detail");
  };

  /* ── Select a question from the list ── */
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMode("detail");
  };

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white dark:bg-black overflow-hidden">

      {/* ── LEFT: Question list ── */}
      <div className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">

        {/* List header */}
        <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h1 className="text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-100">{subject}</h1>
          <p className="text-xs text-zinc-400">{questions.length} questions</p>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto">
          {listLoading && <p className="p-4 text-sm text-zinc-400">Loading…</p>}

          {!listLoading && questions.length === 0 && (
            <p className="p-4 text-sm text-zinc-400">No questions found.</p>
          )}

          {questions.map((q) => {
            const isActive = mode === "detail" && selectedId === q._id;
            return (
              <button
                key={q._id}
                onClick={() => handleSelect(q._id)}
                className={`w-full text-left px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 transition
                  ${isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
              >
                <p className="text-sm font-medium truncate">{q.name.join(", ")}</p>
                <p className={`text-xs mt-0.5 ${isActive ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-400"}`}>
                  {new Date(q.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── Add new question row ── */}
        <button
          onClick={() => setMode("new")}
          className={`w-full text-left px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 transition flex items-center gap-2
            ${mode === "new"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
        >
          <span className="text-lg leading-none">+</span>
          <span className="text-sm">New question</span>
        </button>
      </div>

      {/* ── RIGHT: Detail or New form ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── NEW QUESTION FORM ── */}
        {mode === "new" && (
          <NewQuestionForm
            subjects={subjects}
            defaultSubject={subject}
            onCreated={handleCreated}
            onCancel={() => setMode("detail")}
          />
        )}

        {/* ── QUESTION DETAIL ── */}
        {mode === "detail" && (
          <div className="px-8 py-8">
            {detailLoading && <p className="text-sm text-zinc-400">Loading…</p>}

            {!detailLoading && !detail && (
              <p className="text-sm text-zinc-400">Select a question to view it.</p>
            )}

            {!detailLoading && detail && (
              <>
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-zinc-500 font-medium">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="text-3xl font-extrabold capitalize bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 cursor-pointer focus:ring-0"
                    >
                      {subjects.map((s) => (
                        <option key={s._id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-40">
                      <label className="block text-xs mb-1 text-zinc-500">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
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
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs mb-1 text-zinc-500">Question Name</label>
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter question name"
                      className="w-full bg-transparent text-2xl font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-400 dark:border-zinc-700 focus:outline-none focus:border-indigo-500 pb-1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1 text-zinc-500">Question</label>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-2 text-zinc-500">Solution</label>
                    <SessionNotes
                      onData={(data) => { if (data.description !== undefined) setSolution(data.description); }}
                      initialTopic={null}
                      initialDescription={solution}
                      showTopic={false}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-2 text-zinc-500">Revisions</label>
                    <RevisionManager revisions={revisions} setRevisions={setRevisions} />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button className="px-5 py-2 rounded-lg text-sm text-red-600 border border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Delete
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
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