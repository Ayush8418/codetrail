"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type Session = { _id: string; topic: string; duration: number; createdAt: string; startTime: string; endTime: string; timestamps: string[] };

const rowsPerPage = 15;

export default function OldSessionsPage() {
  const [data, setData] = useState<Session[]>([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios.get("/api/session").then((res) => setData(res.data?.data || [])).catch(() => {});
  }, []);

  const handleDelete = async (id: string, topic: string) => {
    if (!confirm(`⚠️ This will permanently delete the session:\n\n"${topic}"\n\nThis cannot be undone. Continue?`)) return;
    try {
      await axios.delete(`/api/session/${id}`);
      setData((prev) => prev.filter((s) => s._id !== id));
    } catch {
      toast.error("Failed to delete session. Please try again.");
    }
  };

  const formatDateOnly = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const formatTimeOnly = (d: string) => new Date(d).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  
  const formatSmartDuration = (sec: number) => {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h > 0) return `${h}hr ${m}min`;
    if (m > 0) return `${m}min ${s}s`;
    return `${s}s`;
  };

  const processed = data
    .filter((d) => d.topic.toLowerCase().includes(search.toLowerCase()))
    .filter((d) => {
      if (!fromDate && !toDate) return true;
      const t = new Date(d.createdAt).getTime();
      return t >= (fromDate ? new Date(fromDate).getTime() : 0) && t <= (toDate ? new Date(toDate).getTime() : Infinity);
    })
    .sort((a, b) => {
      const da = new Date(a.createdAt).getTime(), db = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? da - db : db - da;
    });

  const totalPages = Math.ceil(processed.length / rowsPerPage);
  const displayed = processed.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto backdrop-blur-lg bg-white/10 dark:bg-black/10 rounded-2xl border border-white/10 p-6 shadow-md border-2">
      <h1 className="text-4xl font-extrabold text-center mb-10">Old Sessions</h1>

      <div className="mb-10 p-4 bg-white/60 dark:bg-zinc-900/60 flex flex-wrap justify-center gap-4">
        <input className="px-4 py-2 border" placeholder="Search topic..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="px-5 py-2 bg-indigo-600 text-white">Sort: {sortOrder === "asc" ? "Oldest" : "Newest"}</button>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        {(search || fromDate || toDate) && <button onClick={() => { setSearch(""); setFromDate(""); setToDate(""); setPage(1); }}>Clear ✕</button>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-lg">
          <thead>
            <tr className="bg-gray-100 dark:bg-zinc-800 text-center">
              {["Sr", "Topic", "Created", "Start", "End", "Duration", "Active %", "Delete"].map((h) => (<th key={h} className="p-4">{h}</th>))}
            </tr>
          </thead>

          <tbody>
            {displayed.map((item, index) => {
              const start = item.startTime ? new Date(item.startTime) : null;
              const end = item.endTime ? new Date(item.endTime) : null;
              const totalSeconds = start && end ? Math.max(1, Math.floor((end.getTime() - start.getTime()) / 1000)) : 1;
              const activeSeconds = item.duration;
              const activePercent = Math.min(100, Math.round((activeSeconds / totalSeconds) * 100));

              return (
                <tr key={item._id} className="hover:bg-gray-200 dark:hover:bg-zinc-800 cursor-pointer" onClick={() => (window.location.href = `/session/oldsessions/${item._id}`)}>
                  <td className="p-4">{(page - 1) * rowsPerPage + index + 1}</td>
                  <td className="p-4 text-left w-[30%]">{item.topic}</td>
                  <td className="p-4">{formatDateOnly(item.createdAt)}</td>
                  <td className="p-4">{start ? formatTimeOnly(start.toString()) : "-"}</td>
                  <td className="p-4">{end ? formatTimeOnly(end.toString()) : "-"}</td>
                  <td className="p-4">{formatSmartDuration(activeSeconds)}</td>
                  <td className="p-4">{activePercent}%</td>
                  <td className="p-4">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id, item.topic); }} className="px-3 py-1 bg-red-500 text-white">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-8 gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button key={i} onClick={() => setPage(i + 1)} className={`px-4 py-2 border ${page === i + 1 ? "bg-gray-800 text-white" : ""}`}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
}
