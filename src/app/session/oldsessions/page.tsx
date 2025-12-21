"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type Session = { _id: string; topic: string; duration: number; createdAt: string; startTime: string; endTime: string; timestamps: string[] };
const rowsPerPage = 15;

export default function OldSessionsPage() {
  const [data, setData] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // UI state
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // applied filters (used for API)
  const [filters, setFilters] = useState({ search: "", sort: "desc", fromDate: "", toDate: "" });

  useEffect(() => {
    axios.get("/api/session", {
      params: { page, limit: rowsPerPage, ...filters },
    })
    .then(res => {
      setData(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    })
    .catch(() => toast.error("Failed to load sessions"));
  }, [page, filters]);

  const applyFilters = () => {
    setPage(1);
    setFilters({ search, sort: sortOrder, fromDate, toDate });
  };

  const handleDelete = async (id: string, topic: string) => {
    if (!confirm(`⚠️ Delete session:\n\n"${topic}"\n\nThis cannot be undone.`)) return;
    try {
      await axios.delete(`/api/session/${id}`);
      setData(d => d.filter(s => s._id !== id));
    } catch { toast.error("Delete failed"); }
  };

  const d = (x: string) => new Date(x);
  const fmtDate = (x: string) => d(x).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const fmtTime = (x: string) => d(x).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dur = (s: number) => s >= 3600 ? `${Math.floor(s/3600)}hr ${Math.floor(s%3600/60)}min` : s >= 60 ? `${Math.floor(s/60)}min ${s%60}s` : `${s}s`;

  return (
    <div className="p-6 max-w-7xl mx-auto border shadow-md backdrop-blur-md bg-white/5 dark:bg-black/10 
                      rounded-2xl">
      <h1 className="text-4xl font-extrabold text-center mb-10">Old Sessions</h1>

      {/* Filters */}
      <div className="mb-10 p-4 bg-white/60 dark:bg-zinc-900/60 flex flex-wrap justify-center gap-4">
        <input className="px-4 py-2 border" placeholder="Search topic..." value={search} onChange={e => setSearch(e.target.value)} />

        <button
          className="px-5 py-2 text-white rounded bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
          onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
        >
          Sort: {sortOrder === "asc" ? "Oldest" : "Newest"}
        </button>

        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />

        <button
          onClick={applyFilters}
          className="px-5 py-2 text-white rounded bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
        >
          Search
        </button>

        {(search || fromDate || toDate) && (
          <button
            onClick={() => { setSearch(""); setFromDate(""); setToDate(""); setPage(1); setFilters({ search:"", sort:"desc", fromDate:"", toDate:"" }); }}
            className="px-4 py-2 rounded bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:opacity-90"
          >
            Clear ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-lg">
          <thead>
            <tr className="bg-gray-100 dark:bg-zinc-800 text-center">
              {["Sr","Topic","Created","Start","End","Duration","Active %","Delete"].map(h => (
                <th key={h} className="p-4">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((item, i) => {
              const start = item.startTime && d(item.startTime);
              const end = item.endTime && d(item.endTime);
              const total = start && end ? Math.max(1, Math.floor((+end - +start) / 1000)) : 1;
              const active = Math.min(100, Math.round(item.duration / total * 100));

              return (
                <tr key={item._id} className="hover:bg-gray-200 dark:hover:bg-zinc-800 cursor-pointer"
                  onClick={() => location.href = `/session/oldsessions/${item._id}`}>
                  <td className="p-4">{(page - 1) * rowsPerPage + i + 1}</td>
                  <td className="p-4 text-left w-[30%]">{item.topic}</td>
                  <td className="p-4">{fmtDate(item.createdAt)}</td>
                  <td className="p-4">{start ? fmtTime(start.toString()) : "-"}</td>
                  <td className="p-4">{end ? fmtTime(end.toString()) : "-"}</td>
                  <td className="p-4">{dur(item.duration)}</td>
                  <td className="p-4">{active}%</td>
                  <td className="p-4">
                    <button
                      className="px-3 py-1 text-white rounded bg-gradient-to-r from-red-500 to-rose-500 hover:opacity-90"
                      onClick={e => { e.stopPropagation(); handleDelete(item._id, item.topic); }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-4 py-2 rounded border transition ${
              page === i + 1
                ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white"
                : "hover:bg-gray-200 dark:hover:bg-zinc-700"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
