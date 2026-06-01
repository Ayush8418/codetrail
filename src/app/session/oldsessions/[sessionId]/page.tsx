"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SessionNotes from "@/components/SessionNotes";
import { toast } from "sonner";
import RevisionManager from "@/components/RevisionManager";

type Revision = {
  _id?: string;
  date: string;
  done: boolean;
};
type Session = { _id: string; topic: string; description: string; duration: number; timestamps: string[]; startTime: string; endTime: string; createdAt: string; revisions: Revision[]; };

export default function StudySessionDetailPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ topic: "", description: "" });
  const [revisions, setRevisions] = useState<Revision[]>([]);



  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch(`/api/session/${sessionId}`);
      const json = await res.json();

      if (!json.success) {
        setError("Failed to fetch session");
        return;
      }

      setSession(json.data);
      setFormData({
        topic: json.data.topic,
        description: json.data.description,
      });

      // ✅ THIS WAS MISSING
      setRevisions(json.data.revisions || []);
    };

    fetchSession();
  }, [sessionId]);


  useEffect(() => {
    const fetchAll = async () => {
      const res = await fetch("/api/session");
      const json = await res.json();
      if (!json.success) return;
      const sorted = json.data.sort((a: Session, b: Session) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllSessions(sorted);
      const index = sorted.findIndex((s: Session) => s._id === sessionId);
      if (index > 0) setPrevId(sorted[index - 1]._id);
      if (index < sorted.length - 1) setNextId(sorted[index + 1]._id);
    };
    fetchAll();
  }, [sessionId]);

  if (!session) return <div className="p-6 text-center text-xl">Loading...</div>;

  const start = new Date(session.startTime).getTime();
  const end = new Date(session.endTime).getTime();
  const totalMs = Math.max(end - start, 1);

  const segments: { start: number; stop: number }[] = [];
  for (let i = 0; i < session.timestamps.length; i += 2) {
    if (!session.timestamps[i] || !session.timestamps[i + 1]) continue;
    segments.push({ start: new Date(session.timestamps[i]).getTime(), stop: new Date(session.timestamps[i + 1]).getTime() });
  }

  const formatTime = (t: number) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const updateSession = async () => {
  const res = await fetch(`/api/session/${sessionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: formData.topic,
      description: formData.description,
      revisions,
    }),
  });

  const json = await res.json();
  if (json.success) {
    setSession(json.data);
    setRevisions(json.data.revisions || []); // ✅ sync back
    toast.success("Session updated successfully!");
  }
};


  const deleteSession = async () => {
    if (!confirm("⚠️ WARNING!\nThis will permanently DELETE this session.\nThis action CANNOT be undone.\nContinue?")) return;
    await fetch(`/api/session/${sessionId}`, { method: "DELETE" });
    window.location.href = "/dashboard";
  };

  const activeSeconds = session.duration;

  const totalSeconds = Math.max(
    Math.floor((end - start) / 1000),
    1
  );

  const activePercent = Math.min(
    100,
    Math.round((activeSeconds / totalSeconds) * 100)
  );
  const focusSegments = Math.floor(session.timestamps.length / 2);

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h > 0) return `${h}hr ${m}min`;
    if (m > 0) return `${m}min ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10 backdrop-blur-lg bg-white/10 dark:bg-black/10 rounded-2xl border border-white/10 p-6 shadow-md border-2">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black dark:text-gray-50">Study Session Overview</h1>
        <p className="text-gray-500 text-sm">Visual breakdown of your focus timeline & session data</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Activity Timeline</h2>

        <div className="relative w-full h-[6px] bg-gray-200 rounded-full overflow-hidden shadow-inner">
          {segments.map((seg, idx) => {
            const left = ((seg.start - start) / totalMs) * 100;
            const width = ((seg.stop - seg.start) / totalMs) * 100;
            return <div key={idx} className="absolute top-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-[0_0_12px_rgba(168,85,247,0.9)]" style={{ left: `${Math.max(left, 0)}%`, width: `${Math.min(width, 100)}%` }} />;
          })}
        </div>

        <div className="relative w-full text-xs text-gray-500 mt-1">
          {segments.map((seg, idx) => {
            const left = ((seg.start - start) / totalMs) * 100;
            const stop = ((seg.stop - start) / totalMs) * 100;
            return (
              <div key={idx}>
                <span className="absolute -translate-x-1/2" style={{ left: `${left}%` }}>{formatTime(seg.start)}</span>
                <span className="absolute -translate-x-1/2" style={{ left: `${stop}%` }}>{formatTime(seg.stop)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <SessionNotes initialTopic={formData.topic} initialDescription={formData.description} onData={(data) => setFormData((prev) => ({ ...prev, ...data }))} />

      <RevisionManager
        revisions={revisions}
        setRevisions={setRevisions}
      />

      <div className="flex justify-center gap-4 pt-10 border-t">
        <button onClick={updateSession} className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold shadow-md hover:shadow-lg transition">Save Changes</button>
        <button onClick={deleteSession} className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold shadow-md hover:shadow-lg transition">Delete Session</button>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button disabled={!prevId} onClick={() => router.push(`/session/oldsessions/${prevId}`)} className={`px-5 py-2 rounded-lg font-medium transition ${prevId ? "bg-gray-800 text-white hover:bg-gray-900" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>← Previous</button>
        <button disabled={!nextId} onClick={() => router.push(`/session/oldsessions/${nextId}`)} className={`px-5 py-2 rounded-lg font-medium transition ${nextId ? "bg-gray-800 text-white hover:bg-gray-900" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>Next →</button>
      </div>

      <div className="border-t pt-6 space-y-3">
        <h3 className="text-lg font-semibold">Session Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 shadow-sm"><p className="font-semibold">Active Time</p><p>{formatDuration(activeSeconds)}</p></div>
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 shadow-sm"><p className="font-semibold">Total Time</p><p>{formatDuration(totalSeconds)}</p></div>
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 shadow-sm"><p className="font-semibold">Active %</p><p>{activePercent}%</p></div>
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 shadow-sm"><p className="font-semibold">Focus Segments</p><p>{focusSegments}</p></div>
        </div>
      </div>
    </div>
  );
}
