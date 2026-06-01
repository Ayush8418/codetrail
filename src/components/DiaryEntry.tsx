"use client";

import { useState } from "react";
import SessionNotes from "@/components/SessionNotes";
import { toast } from "sonner";

export default function DiaryEntry() {
  const [entry, setEntry] = useState<{
    topic?: string;
    description?: string;
  }>({});
  

  const handleData = (data: any) => {
    setEntry((prev) => ({ ...prev, ...data }));
  };

  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const saveDiary = async () => {
    if (!entry.description) return;

    setSaving("saving");
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: entry.description }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Save failed:", err.message);
        toast.error("Failed to save diary entry");
        return;
      }

      setSaving("saved");
      toast.success("Diary entry saved successfully!");
      setTimeout(() => setSaving("idle"), 2000);
    } catch (err) {
      console.error("Network error:", err);
      setSaving("error");
      toast.error("Failed to save diary entry");
    }
  };

  return (
    <div className="flex flex-col w-full">

  <div className="mb-6">
    <h2 className="text-2xl font-semibold text-zinc-500 dark:text-white">
      Daily Diary
    </h2>
    <p className="text-sm text-zinc-500">
      Write freely. This page is yours.
    </p>
  </div>

  <SessionNotes
    onData={handleData}
    initialTopic={null}
    initialDescription={null}
    showTopic={false}
    mode="diary"
  />

  <div className="flex justify-end mt-[-18px]">
    <button
      onClick={saveDiary}
      disabled={saving === "saving"}
      className="px-5 py-2 rounded-full text-m font-medium
        bg-zinc-900 text-white hover:bg-zinc-800
        active:scale-[0.97] transition w-full
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving === "saving" ? "Saving…" : saving === "saved" ? "Saved ✓" : saving === "error" ? "Error — retry?" : "Save Entry"}
    </button>
  </div>
</div>

  );
}
