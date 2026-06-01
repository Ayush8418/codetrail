"use client";
import { useEffect, useState } from "react";

export default function Timer({ onData }: { onData: (data: any) => void }) {
  const [seconds, setSeconds] = useState(0);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [timestamps, setTimestamps] = useState<Date[]>([]);
  const [hideSeconds, setHideSeconds] = useState(false); // NEW FEATURE

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    setTime(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      if (isStarted) setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted]);

  // Live Clock Formatting
  const main = time.slice(0, -6); // hh:mm
  const suffix = time.slice(-6); // :ss AM/PM
  const suffixMain = hideSeconds ? "" : suffix.slice(0, 4); // :ss
  const suffixEnd = suffix.slice(4); // AM/PM

  // Session Timer Format
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = hideSeconds ? "" : ":" + String(seconds % 60).padStart(2, "0");

  useEffect(() => {
    onData({
      timestamps,
      duration: seconds,
    });
  }, [timestamps, seconds]);

  return (
    <div className="flex flex-col gap-10 w-full ">

      {/* DATE */}
      <div className="flex justify-left gap-2 w-fit text-xl md:text-2xl opacity-80 font-light text-center lg:text-left backdrop-blur-md bg-white/5 dark:bg-black/10" suppressHydrationWarning>
        {date || "\u00A0"}
        {/* Hide Seconds Button */}
        <button
          onClick={() => setHideSeconds((prev) => !prev)}
          className="ml-4 px-2 py-1 text-sm font-semibold rounded-md hover:bg-gray-200 transition border-2 bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-800"
        >
          {hideSeconds ? "Show Seconds" : "Hide Seconds"}
        </button>
      </div>

      {/* LIVE TIME */}
      <div className="flex items-baseline justify-center lg:justify-start font-mono leading-none" suppressHydrationWarning>
        <span className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] font-light">
          {main}
        </span>

        {/* Seconds Section */}
        {!hideSeconds && (
          <span className="text-5xl sm:text-6xl md:text-7xl ml-3 opacity-85">
            {suffixMain}
          </span>
        )}

        <span className="text-xl sm:text-3xl ml-2 opacity-60">{suffixEnd}</span>
        
      </div>

      {/* TIMER BOX */}
      {/* TIMER BOX */}
<div className="
  inline-flex flex-col md:flex-row
  items-center gap-6
  w-fit
  mx-auto lg:mx-0
  backdrop-blur-md bg-white/5 dark:bg-black/10
  px-6 py-6
  rounded-2xl shadow-md
  border border-white/10
">

        {/* TIMER DISPLAY */}
        <div className="text-4xl sm:text-5xl md:text-6xl font-mono text-center" suppressHydrationWarning>
          {h}:{m}
          {!hideSeconds && s}
        </div>

        {/* TIMER CONTROLS */}
        <div className="flex gap-3 flex-wrap justify-center">

          {/* START / STOP */}
          <button
            onClick={() => {
              setIsStarted(!isStarted);
              setTimestamps((prev) => [...prev, new Date()]);
              // const now = new Date().toString();
              // console.log(now)
            }}
            className={`
              px-6 py-3 w-[120px] sm:w-[140px] rounded-xl text-white font-semibold
              shadow-md hover:shadow-xl hover:scale-[1.03] transition
              ${isStarted
                ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                : "bg-gradient-to-r from-green-500 to-emerald-600"}
            `}
          >
            {isStarted ? "Stop" : "Start"}
          </button>

          {/* RESET */}
          <button
            onClick={() => {
              if (!window.confirm("Reset session?")) return;
              setTimestamps([]);
              setIsStarted(false);
              setSeconds(0);
            }}
            className="
              px-6 py-3 w-[120px] sm:w-[140px] rounded-xl text-white font-semibold
              bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700
              shadow-md hover:shadow-xl transition hover:scale-[1.03]
            "
          >
            Reset
          </button>
        </div>
      </div>

      {/* TIMESTAMP LIST */}
      <div>
        {timestamps.map((t, i) => {
          if (i % 2 === 0 && timestamps[i + 1]) {
            return (
              <div key={i}>
                {i / 2 + 1}) {t.toString()} → {timestamps[i + 1].toString()}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
