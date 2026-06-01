"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export type Revision = {
  _id?: string;
  date: string;
  done: boolean;
};

type Props = {
  revisions: Revision[];
  setRevisions: React.Dispatch<React.SetStateAction<Revision[]>>;
};

/* ---------- Date gap helper ---------- */
const getDateGap = (from: string, to: string) => {
  const start = new Date(from);
  const end = new Date(to);

  let months =
    end.getMonth() -
    start.getMonth() +
    12 * (end.getFullYear() - start.getFullYear());

  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(
      end.getFullYear(),
      end.getMonth(),
      0
    ).getDate();
    days += prevMonthDays;
  }

  if (months <= 0) return `${days} days`;
  if (days === 0) return `${months} months`;

  return `${months} months ${days} days`;
};

export default function RevisionManager({
  revisions,
  setRevisions,
}: Props) {
  const [date, setDate] = useState("");

  const addRevision = () => {
    if (!date) return toast.warning("Please select a date");

    setRevisions((prev) => {
      const next = [...prev, { date, done: false }];
      return next.sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      );
    });

    setDate("");
  };

  const toggleRevision = (index: number) => {
    setRevisions((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, done: !r.done } : r
      )
    );
  };

  const deleteRevision = (index: number) => {
    setRevisions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  return (
    <div
      className="
        space-y-4
        border p-4
        backdrop-blur-md bg-white/5 dark:bg-black/10
        rounded-2xl min-h-full
      "
    >
      <h3 className="font-semibold text-lg">
        Revisions ({revisions.length})
      </h3>

      {/* ---------- Timeline Container ---------- */}
      <div className="relative">
        {/* Vertical line */}
        {revisions.length > 1 && (
          <div
            className="
              absolute
              left-[22px]
              top-4
              bottom-4
              w-px
              bg-gray-500/30
              z-0
            "
          />
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {revisions.map((rev, i) => (
              <div key={`${rev.date}-${i}`} className="relative">
                {/* GAP LABEL */}
                {i > 0 && (
                  <div className="relative flex items-center my-1">
                    {/* Dot on line */}
                    <div className="absolute left-[19px] h-2 w-2 rounded-full bg-gray-400" />
                    {/* Gap text */}
                    <div className="ml-10 text-xs text-gray-500">
                      {getDateGap(
                        revisions[i - 1].date,
                        rev.date
                      )}
                    </div>
                  </div>
                )}

                <motion.div
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => toggleRevision(i)}
                  className={`
                    relative z-10
                    flex justify-between items-center
                    px-4 py-4
                    rounded-xl border
                    cursor-pointer
                    transition-colors
                    ${
                      rev.done
                        ? "bg-zinc-800 text-gray-400 border-white/20"
                        : "bg-zinc-900 hover:bg-zinc-800 text-gray-100 border-white/10"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Square gray checkbox */}
                    <div
                      className={`
                        h-4 w-4 rounded-md border
                        flex items-center justify-center
                        relative z-10
                        ${
                          rev.done
                            ? "bg-gray-400 border-gray-400"
                            : "border-gray-400"
                        }
                      `}
                    >
                      {rev.done && (
                        <div className="h-2 w-2 bg-white/70 rounded-sm" />
                      )}
                    </div>

                    <span
                      className={`text-sm ${
                        rev.done
                          ? "line-through text-gray-400"
                          : "text-gray-100"
                      }`}
                    >
                      {new Date(rev.date).toDateString()}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRevision(i);
                    }}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </motion.div>
              </div>
            ))}
          </AnimatePresence>

          {revisions.length === 0 && (
            <p className="text-sm text-gray-500">
              No revisions added
            </p>
          )}
        </div>
      </div>

      {/* ---------- Date Input ---------- */}
      <div className="flex gap-2 pt-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-xl px-3 py-2"
        />
        <button
          onClick={addRevision}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
        >
          Add
        </button>
      </div>
    </div>
  );
}
