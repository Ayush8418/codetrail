"use client";
import RevisionManager from "@/components/RevisionManager";
import SessionNotes from "@/components/SessionNotes";
import Timer from "@/components/Timer";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

type Revision = {
  _id?: string;
  date: string;
  done: boolean;
};

export default function NewSessionPage() {
  type SessionData = {
    topic: string;
    description: string;
    timestamps: Date[];
    backupStartTime: Date;
    duration: number
  };
  const [sessionData, setSessionData] = useState<SessionData>({
    topic: "",
    description: "",
    timestamps: [],
    backupStartTime: new Date(),
    duration: 0
  });

  const [resetKey, setResetKey] = useState(0);
  const [revisions, setRevisions] = useState<Revision[]>([]);

  const saveSession = async () => {
  try {
    const payload = {
      ...sessionData,
      revisions,
    };
    // 1️⃣ Topic validation
    if (!payload.topic.trim()) {
      toast.warning("Topic is required");
      return;
    }

    // 2️⃣ Ensure timestamps exist
    if (payload.timestamps.length === 0) {
      payload.timestamps = [payload.backupStartTime!, new Date()];
    }

    // 3️⃣ Ensure even-length timestamps (close running segment)
    if (payload.timestamps.length % 2 !== 0) {
      payload.timestamps.push(new Date());
    }

    // 4️⃣ 🔥 ALWAYS recompute duration from timestamps
    let activeSeconds = 0;

    for (let i = 0; i < payload.timestamps.length; i += 2) {
      const start = payload.timestamps[i].getTime();
      const end = payload.timestamps[i + 1].getTime();
      if (end > start) {
        activeSeconds += Math.floor((end - start) / 1000);
      }
    }

    payload.duration = activeSeconds;

    console.log("payload------", payload);

    const res = await axios.post("/api/session", payload);
    toast.success(res.data.message);

    if (res.status === 201) {
      setSessionData({
        topic: "",
        description: "",
        timestamps: [],
        backupStartTime: new Date(),
        duration: 0,
      });
      setResetKey((prev) => prev + 1);
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Failed to save session");
    console.log(err);
  }
};


  const handleTimerData = (data: any) => {
    setSessionData((prev) => ({ ...prev, ...data }));
  };
  const handleNotesData = (data: any) => {
    setSessionData((prev) => ({ ...prev, ...data }));
  };

  return (
  <div className="min-h-screen px-6">

    {/* Save Button */}
    <div className="flex justify-center">
      <button
        onClick={() => {
          const confirmReset = window.confirm("Are you sure you want to save the session?");
          if (!confirmReset) return;
          saveSession();
        }}
        className="
          px-6 py-3 rounded-xl mb-10 mt-4
          text-white font-semibold tracking-wide
          bg-gradient-to-r from-blue-500 to-indigo-600
          shadow-md shadow-blue-500/30
          transition-all duration-300 ease-out
          hover:from-blue-600 hover:to-indigo-700
          hover:shadow-xl hover:shadow-blue-500/40
          hover:scale-[1.03]
        "
      >
        Save Session
      </button>
    </div>

    {/* TOP SECTION — Timer (60%) + Revisions (40%) */}
    <div className="flex flex-col lg:flex-row gap-8 mb-14">
      {/* Timer — 60% */}
      <div className="w-full lg:w-3/6">
        <Timer key={resetKey} onData={handleTimerData} />
      </div>

      {/* Revisions — 40% */}
      <div className="w-full lg:w-3/6">
        <RevisionManager
          revisions={revisions}
          setRevisions={setRevisions}
        />
      </div>
    </div>

    {/* BOTTOM SECTION — Session Notes (Centered) */}
    <div className="w-full flex justify-center pb-12">
      <div className="w-full">
        <SessionNotes
          key={resetKey + 1}
          onData={handleNotesData}
          initialTopic=""
          initialDescription="Start Writing..."
        />
      </div>
    </div>

  </div>
);

}
