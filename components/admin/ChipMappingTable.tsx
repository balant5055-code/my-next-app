"use client";
import { useRef, useEffect } from "react";
interface Props {
  filtered: any[];
  loadingPage: boolean;
  editingId: string | null;
  inlineChip: string;
  activeIndex: number | null;
  rowRefs: React.MutableRefObject<Record<string, HTMLTableRowElement | null>>;
  setEditingId: (id: string | null) => void;
  setInlineChip: (val: string) => void;
  setActiveIndex: (val: number | null) => void;
  updateChip: (id: string, chip: string | null) => void;
  scrollToRow: (id: string) => void;
  duplicateChips: string[];
}

export default function ChipMappingTable({
  filtered,
  loadingPage,
  editingId,
  inlineChip,
  activeIndex,
  rowRefs,
  setEditingId,
  setInlineChip,
  setActiveIndex,
  updateChip,
  scrollToRow,
  duplicateChips,
}: Props) {
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
  }, [filtered.length]);
  return (
    <div className="relative">
      {/* Loading Overlay */}
      {loadingPage && (
        <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-40">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div
        ref={tableScrollRef}
        className="h-[400px] overflow-y-auto overflow-x-auto"
      >
        <table className="min-w-full text-sm">
          {/* HEADER */}
          <thead className="bg-slate-800 sticky top-0 z-20 border-b border-slate-700">
            <tr className="text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-center w-16">#</th>
              <th className="px-5 py-3 text-center w-24 sticky left-0 bg-slate-800 z-20">
                BIB
              </th>
              <th className="px-5 py-3 text-left">Participant</th>
              <th className="px-5 py-3 text-center w-36">Chip Status</th>
              <th className="px-5 py-3 text-center w-40">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-slate-800">
            {Array.isArray(filtered) &&
              filtered.map((reg, index) => {
                const isEditing = editingId === reg.id;
                const isAssigned = !!reg.chipCode;

                const isDuplicate =
                  !!reg.chipCode && duplicateChips.includes(reg.chipCode);

                return (
                  <tr
                    key={reg.id}
                    ref={(el) => {
                      rowRefs.current[reg.id] = el;
                    }}
                    className={`
                    transition-all duration-150
                    ${isEditing ? "bg-indigo-900/20" : ""}
                    ${!isAssigned ? "border-l-4 border-red-500" : "border-l-4 border-emerald-500"}
                    hover:bg-slate-800/60
                  `}
                  >
                    {/* Index */}
                    <td className="px-5 py-3 text-center text-slate-500">
                      {index + 1}
                    </td>

                    {/* BIB */}
                    <td className="px-5 py-3 text-center font-semibold text-indigo-400 tracking-wide sticky left-0 bg-slate-900 z-10">
                      {reg.bibNumber}
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3 text-slate-200 font-medium">
                      {reg.name || "-"}
                    </td>

                    {/* Chip */}
                    <td className="px-5 py-3 text-center">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={inlineChip}
                          onChange={(e) => setInlineChip(e.target.value)}
                          onKeyDown={(e) => {
                            if (activeIndex === null) return;

                            if (e.key === "Enter") {
                              updateChip(reg.id, inlineChip || null);

                              if (activeIndex < filtered.length - 1) {
                                const nextIndex = activeIndex + 1;
                                const next = filtered[nextIndex];

                                setActiveIndex(nextIndex);
                                setEditingId(next.id);
                                setInlineChip(next.chipCode || "");
                                scrollToRow(next.id);
                              } else {
                                setEditingId(null);
                              }
                            }

                            if (e.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 border border-indigo-500 rounded-md text-xs w-28 text-center focus:outline-none"
                        />
                      ) : isAssigned ? (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
      ${
        isDuplicate
          ? "bg-red-500/20 text-red-400 border-red-500"
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      }`}
                        >
                          {reg.chipCode}
                          {isDuplicate && " ⚠"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => {
                                updateChip(reg.id, inlineChip || null);
                                setEditingId(null);
                              }}
                              className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 rounded-md transition"
                            >
                              Save
                            </button>

                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded-md transition"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setActiveIndex(index);
                                setEditingId(reg.id);
                                setInlineChip(reg.chipCode || "");
                                scrollToRow(reg.id);
                              }}
                              className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-md transition cursor-pointer"
                            >
                              {isAssigned ? "Edit" : "Assign"}
                            </button>

                            {isAssigned && (
                              <button
                                onClick={() => updateChip(reg.id, null)}
                                className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 rounded-md transition cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-500">
                  No participants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
