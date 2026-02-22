"use client";

import { useEffect, useState } from "react";
import { secureFetch } from "@/lib/secureFetch";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
interface Props {
  eventId: string;
  onClose: () => void;
}

export default function BibGeneratorModal({ eventId, onClose }: Props) {
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [previewDistance, setPreviewDistance] = useState<string | null>(null);

  const [checkingDistance, setCheckingDistance] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  /* ================= LOAD SUMMARY ================= */

  useEffect(() => {
    if (!eventId) return;

    setLoading(true);

    const unsubscribe = onSnapshot(doc(db, "events", eventId), (snapshot) => {
      console.log("Snapshot exists:", snapshot.exists());
      console.log("Snapshot data:", snapshot.data());

      const eventData = snapshot.data();

      if (!eventData) {
        setLoading(false);
        return;
      }

      /* ================= LOCK STATE ================= */

      setIsLocked(eventData.bibGenerationLock?.locked || false);

      const categories = eventData.categories || [];
      const logs = eventData.auditLogs || [];

      const newSummary: any = {};

      categories.forEach((cat: any) => {
        const distance = cat.distance;

        const confirmed = cat.bookedSeats || 0;

        const assigned = (cat.nextBib || cat.bibStart) - cat.bibStart;

        const remaining = Math.max(confirmed - assigned, 0);

        const capacity = (cat.bibEnd || 0) - (cat.bibStart || 0) + 1;

        const available = capacity - assigned;
        console.log("EVENT ID:", eventId);
        console.log("CATEGORIES:", categories);
        console.log("NEW SUMMARY:", newSummary);
        newSummary[distance] = {
          confirmed,
          assigned,
          remaining,
          rangeStart: cat.bibStart,
          rangeEnd: cat.bibEnd,
          nextBib: cat.nextBib,
          capacity,
          available,
          canGenerate: remaining > 0 && cat.nextBib <= cat.bibEnd,
        };
      });

      setSummary(newSummary);

      /* ================= HISTORY ================= */

      const batches = logs
        .filter((log: any) => log.action === "BIB_BATCH_GENERATED")
        .sort((a: any, b: any) => {
          const aTime = a.generatedAt?._seconds || 0;
          const bTime = b.generatedAt?._seconds || 0;
          return bTime - aTime;
        });

      setHistory(batches);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);
  /* ================= UNDO ================= */

  const handleUndo = async () => {
    const confirmAction = window.confirm(
      "Are you sure you want to undo the last BIB batch?",
    );
    if (!confirmAction) return;

    try {
      const res = await secureFetch(`/api/admin/events/${eventId}/bib/undo`, {
        method: "POST",
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error);
        return;
      }

      alert("Last batch undone successfully");
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= PREVIEW ================= */

  const handlePreview = async (distance: string) => {
    try {
      setCheckingDistance(distance);
      setPreviewData(null);

      const res = await secureFetch(
        `/api/admin/events/${eventId}/bib/preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ distance }),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.error);
        return;
      }

      if (!result.preview) {
        alert("No participants available for BIB assignment.");
        return;
      }

      setPreviewDistance(distance);
      setPreviewData(result.preview);
    } catch (error) {
      console.error(error);
    } finally {
      setCheckingDistance(null);
    }
  };

  /* ================= GENERATE ================= */

  const handleGenerate = async () => {
    if (!previewDistance) return;

    try {
      setGenerating(true);

      const res = await secureFetch(
        `/api/admin/events/${eventId}/bib/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ distance: previewDistance }),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.error);
        return;
      }

      alert("BIB Generated Successfully");

      setPreviewData(null);
      setPreviewDistance(null);
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-[900px] max-h-[85vh] overflow-auto rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-6">Bulk BIB Generator</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {Object.keys(summary).length === 0 ? (
              <p className="text-slate-400">No categories found</p>
            ) : (
              Object.keys(summary).map((distance) => {
                const data = summary[distance];

                return (
                  <div
                    key={distance}
                    className="bg-slate-800 p-6 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <p className="text-lg font-medium">{distance} KM</p>
                      <p className="text-sm text-slate-400">
                        Confirmed: {data.confirmed} | Assigned: {data.assigned}{" "}
                        | Remaining: {data.remaining}
                      </p>
                      <p className="text-xs text-slate-500">
                        Range: {data.rangeStart} - {data.rangeEnd} | Next:{" "}
                        {data.nextBib}
                      </p>
                    </div>

                    <button
                      disabled={
                        !data.canGenerate ||
                        checkingDistance !== null ||
                        isLocked
                      }
                      onClick={() => handlePreview(distance)}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-40"
                    >
                      {isLocked
                        ? "Another Admin Generating..."
                        : checkingDistance === distance
                          ? "Checking..."
                          : "Generate BIB"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================= PREVIEW MODAL ================= */}

        {previewData && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
            <div className="bg-slate-900 w-[500px] p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-semibold">Confirm BIB Generation</h3>

              <div className="space-y-2 text-slate-300">
                <p>Distance: {previewData.distance} KM</p>
                <p>Total To Assign: {previewData.totalToAssign}</p>
                <p>Remaining Capacity: {previewData.remainingCapacity}</p>
                <p>
                  BIB Range: {previewData.startBib} → {previewData.endBib}
                </p>
                <p>Next After Generation: {previewData.endBib + 1}</p>
              </div>

              {previewData.willOverflow && (
                <p className="text-red-400 font-semibold">
                  ⚠ This exceeds allowed BIB range!
                </p>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setPreviewData(null);
                    setPreviewDistance(null);
                  }}
                  className="px-4 py-2 bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  disabled={generating}
                  onClick={handleGenerate}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-40"
                >
                  {generating ? "Generating..." : "Confirm Generate"}
                </button>
              </div>
            </div>
          </div>
        )}
        {history.length > 0 && (
          <div className="mt-12 border-t border-slate-700 pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">BIB Batch History</h3>
              <span className="text-xs text-slate-400">
                {history.length} batches
              </span>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {history.map((batch) => (
                <div
                  key={batch.batchId}
                  className="bg-gradient-to-r from-slate-800 to-slate-700 p-5 rounded-2xl border border-slate-600"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">
                        {batch.distance} KM | {batch.fromBib} → {batch.toBib}
                      </p>

                      <p className="text-slate-400 text-sm mt-1">
                        Total Assigned: {batch.totalAssigned}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {batch.generatedAt?._seconds
                          ? new Date(
                              batch.generatedAt._seconds * 1000,
                            ).toLocaleString()
                          : ""}
                      </p>
                    </div>

                    {batch.undo ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        UNDONE
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ================= FOOTER ================= */}

        <div className="mt-8 flex justify-between items-center border-t border-slate-700 pt-6">
          <button
            onClick={handleUndo}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white"
          >
            Undo Last Batch
          </button>

          <button onClick={onClose} className="text-sm text-slate-400">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
