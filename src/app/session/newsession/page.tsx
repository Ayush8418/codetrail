"use client";
import { useEffect, useRef, useState } from "react";

export default function NewSessionPage() {
  const [seconds, setSeconds] = useState(0);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    setDate(new Date().toLocaleDateString());
    setTime(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());

      if (isStarted) {
        setSeconds(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted]);

  if (time === null) return null; // prevents server → client mismatch

  return (
    <div>
      <div>
        {date}
      </div>

      <div className="text-9xl">
        {time.substring(0,time.length-6)} 
        <span className="text-7xl ">
          {" " + time.substring(time.length-6, time.length-2)}
        </span>
        <span className="text-3xl">
          {time.substring(time.length-2)} 
        </span>
      </div>

      <div>
        {Math.floor(seconds/3600)}:{Math.floor((seconds%3600)/60)}:{seconds%60}

        {
          isStarted 
          ? 
          <button onClick={()=>setIsStarted(false)}>stop</button>
          : 
          <button onClick={()=>setIsStarted(true)}>start</button>
        }

        <button onClick={()=>{setIsStarted(false); setSeconds(0)}}>reset</button>

      </div>
      
        
    </div>
    
  );
}
