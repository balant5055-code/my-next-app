"use client";

import { useRef, useEffect } from "react";

interface Participant {
  firstName?: string;
  lastName?: string;
  bibNumber?: number | null;
}

interface ChipMappingRow {
  id?: string;
  registrationId: string;
  chipCode?: string | null;
  participant?: Participant;
}

interface Props {
  filtered: ChipMappingRow[];
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
  const savingRef = useRef(false);

  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
  }, [filtered.length]);

  return (
    <div className="relative">
      {/* LOADING OVERLAY */}
      {loadingPage && (
        <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-40">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div
        ref={tableScrollRef}
        className="h-[65vh] overflow-y-auto overflow-x-auto"
      >
        <table className="min-w-full text-sm">
          {/* HEADER */}
          <thead className="bg-slate-800 sticky top-0 z-20 border-b border-slate-700">
            <tr className="text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-center w-14">#</th>

              <th className="px-4 py-3 text-center w-24 sticky left-0 bg-slate-800 z-20">
                BIB
              </th>

              <th className="px-4 py-3 text-left sticky left-24 bg-slate-800 z-20">
                Participant
              </th>

              <th className="px-4 py-3 text-center w-36">Chip Status</th>

              <th className="px-4 py-3 text-center w-40">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-slate-800">
            {filtered.map((reg, index) => {
              const id = reg.id || reg.registrationId;

              const isEditing = editingId === id;
              const isAssigned = !!reg.chipCode;

              const isDuplicate =
                !!reg.chipCode && duplicateChips.includes(reg.chipCode);

              const bib = reg.participant?.bibNumber ?? "-";

              const name = `${reg.participant?.firstName ?? ""} ${reg.participant?.lastName ?? ""}`;

              return (
                <tr
                  key={id}
                  ref={(el) => {
                    rowRefs.current[id] = el;
                  }}
                  className={`
                    transition-all
                    ${index % 2 === 0 ? "bg-slate-900" : "bg-slate-900/60"}
                    ${isEditing ? "ring-2 ring-indigo-500" : ""}
                    ${!isAssigned ? "border-l-4 border-red-500" : "border-l-4 border-emerald-500"}
                    hover:bg-slate-800
                  `}
                >
                  {/* INDEX */}
                  <td className="px-4 py-3 text-center text-slate-500">
                    {index + 1}
                  </td>

                  {/* BIB */}
                  <td className="px-4 py-3 text-center font-semibold text-indigo-400 tracking-wide sticky left-0 bg-slate-900 z-10">
                    {bib}
                  </td>

                  {/* NAME */}
                  <td className="px-4 py-3 text-slate-200 font-medium sticky left-24 bg-slate-900 z-10">
                    {name}
                  </td>

                  {/* CHIP STATUS */}
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <input
                        autoFocus
                        value={inlineChip}
                        onChange={(e) => setInlineChip(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => {
                          if (activeIndex === null) return;

                          if (e.key === "Enter") {
                            if (savingRef.current) return;

                            savingRef.current = true;

                            updateChip(id, inlineChip || null);

                            if (activeIndex < filtered.length - 1) {
                              const nextIndex = activeIndex + 1;
                              const next = filtered[nextIndex];
                              const nextId = next.id || next.registrationId;

                              setActiveIndex(nextIndex);
                              setEditingId(nextId);
                              setInlineChip(next.chipCode || "");

                              scrollToRow(nextId);
                            } else {
                              setEditingId(null);
                            }

                            setTimeout(() => {
                              savingRef.current = false;
                            }, 300);
                          }

                          if (e.key === "Escape") {
                            setEditingId(null);
                          }

                          if (e.key === "ArrowDown") {
                            if (activeIndex < filtered.length - 1) {
                              const nextIndex = activeIndex + 1;
                              const next = filtered[nextIndex];
                              const nextId = next.id || next.registrationId;

                              setActiveIndex(nextIndex);
                              setEditingId(nextId);
                              setInlineChip(next.chipCode || "");

                              scrollToRow(nextId);
                            }
                          }

                          if (e.key === "ArrowUp") {
                            if (activeIndex > 0) {
                              const prevIndex = activeIndex - 1;
                              const prev = filtered[prevIndex];
                              const prevId = prev.id || prev.registrationId;

                              setActiveIndex(prevIndex);
                              setEditingId(prevId);
                              setInlineChip(prev.chipCode || "");

                              scrollToRow(prevId);
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-800 border border-indigo-500 rounded-md text-xs w-28 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                  {/* ACTIONS */}
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => {
                              if (savingRef.current) return;

                              savingRef.current = true;

                              updateChip(id, inlineChip || null);

                              setEditingId(null);

                              setTimeout(() => {
                                savingRef.current = false;
                              }, 300);
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
                              setEditingId(id);
                              setInlineChip(reg.chipCode || "");
                              scrollToRow(id);
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-md transition"
                          >
                            {isAssigned ? "Edit" : "Assign"}
                          </button>

                          {isAssigned && (
                            <button
                              onClick={() => updateChip(id, null)}
                              className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 rounded-md transition"
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
