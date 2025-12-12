"use client";
import SessionNotes from "@/components/SessionNotes";
import Timer from "@/components/Timer";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

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

  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const saveSession = async () => {
  try {
    const payload = { ...sessionData };

    if (payload.timestamps.length === 0) {
      payload.timestamps = [payload.backupStartTime!, new Date()];
      payload.duration = Math.floor((payload.timestamps[payload.timestamps.length - 1].getTime() - payload.timestamps[0].getTime()) / 1000);
    } 
    else if (payload.timestamps.length % 2 !== 0) {
      payload.timestamps = [...payload.timestamps, new Date()];
    }
    if (!payload.topic.trim()) {
      toast.warning("Topic is required");
      return;
    }
    console.log("payload------",payload)
    const res = await axios.post("/api/session", payload);
    toast.success(res.data.message);

    if (res.status === 201) {
      setSessionData({
        topic: "",
        description: "",
        timestamps: [],
        backupStartTime:new Date(),
        duration:0
      });
      setResetKey((prev) => prev + 1);
    }
  } catch (err: any) {
    toast.error(err.response.data.message);
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
    <div className="min-h-screen px-6 py-6">

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            const confirmReset = window.confirm("Are you sure you want to save the session?");
            if (!confirmReset) return;
            saveSession()
          }}
          className="
            px-6 py-3 rounded-xl mb-8 mt-2
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

      {/* FLEX LAYOUT */}
      <div
  className={`
    transition-all duration-300 gap-12
    ${isNotesExpanded ? "flex flex-col" : "flex flex-col lg:flex-row"}
  `}
>
  <Timer key={resetKey} onData={handleTimerData} />
  <SessionNotes
  key={resetKey + 1}
  onData={handleNotesData}
  isExpanded={isNotesExpanded}
  toggleExpand={() => setIsNotesExpanded(prev => !prev)}
  initialTopic=""
  initialDescription="Start Writing..."
/>

</div>

    </div>
  );
}
