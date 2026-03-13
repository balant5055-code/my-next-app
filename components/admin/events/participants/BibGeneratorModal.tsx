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

  const [progress, setProgress] = useState<any | null>(null);

  const [status, setStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });

  /* ================= LOAD EVENT SNAPSHOT ================= */

  useEffect(() => {
    if (!eventId) return;

    setLoading(true);

    const unsubscribe = onSnapshot(doc(db, "events", eventId), (snapshot) => {
      const eventData = snapshot.data();

      if (!eventData) {
        setLoading(false);
        return;
      }

      /* -------- LOCK STATE -------- */

      setIsLocked(eventData.bibGenerationLock?.locked || false);

      /* -------- LIVE GENERATION PROGRESS -------- */

      const progressData = eventData?.bibGenerationProgress;

      if (progressData) {
        setProgress({
          distance: progressData.distance,
          assigned: progressData.assigned || 0,
        });
      } else {
        setProgress(null);
      }

      /* -------- CATEGORY SUMMARY -------- */

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

      /* -------- HISTORY -------- */

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
    try {
      setStatus({ type: "info", message: "Undoing last BIB batch..." });

      const res = await secureFetch(`/api/admin/events/${eventId}/bib/undo`, {
        method: "POST",
      });

      const result = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: result.error });
        return;
      }

      setStatus({
        type: "success",
        message: "Last batch undone successfully.",
      });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Undo failed." });
    }
  };

  /* ================= PREVIEW ================= */

  const handlePreview = async (distance: string) => {
    try {
      setCheckingDistance(distance);
      setPreviewData(null);

      setStatus({ type: "info", message: "Checking participants..." });

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
        setStatus({ type: "error", message: result.error });
        return;
      }

      if (!result.preview) {
        setStatus({
          type: "info",
          message: "No participants pending BIB assignment.",
        });
        return;
      }

      setPreviewDistance(distance);
      setPreviewData(result.preview);

      setStatus({ type: null, message: "" });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Preview failed." });
    } finally {
      setCheckingDistance(null);
    }
  };

  /* ================= GENERATE ================= */

  const handleGenerate = async () => {
    if (!previewDistance) return;

    try {
      setGenerating(true);

      setStatus({
        type: "info",
        message: "Generating BIB numbers. Please wait...",
      });

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
        setStatus({ type: "error", message: result.error });
        return;
      }

      setStatus({
        type: "success",
        message: `Assigned ${result.batch.totalAssigned} BIB numbers.`,
      });

      setPreviewData(null);
      setPreviewDistance(null);
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Generation failed." });
    } finally {
      setGenerating(false);
    }
  };

  /* ================= STATUS BANNER ================= */

  const StatusBanner = () => {
    if (!status.type) return null;

    const colors = {
      success: "bg-green-500/20 text-green-400",
      error: "bg-red-500/20 text-red-400",
      info: "bg-blue-500/20 text-blue-400",
    };

    return (
      <div
        className={`mb-6 px-4 py-3 rounded-lg text-sm ${colors[status.type]}`}
      >
        {status.message}
      </div>
    );
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-[900px] max-h-[85vh] overflow-auto rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-6">Bulk BIB Generator</h2>

        <StatusBanner />

        {/* -------- LIVE PROGRESS -------- */}

        {progress && (
          <div className="mb-6 bg-indigo-500/20 text-indigo-400 px-4 py-3 rounded-lg text-sm flex justify-between">
            <span>Generating BIBs for {progress.distance} KM</span>
            <span className="font-semibold">
              {progress.assigned} runners processed
            </span>
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Loading event data...</p>
        ) : (
          <div className="space-y-4">
            {Object.keys(summary).map((distance) => {
              const data = summary[distance];

              return (
                <div
                  key={distance}
                  className="bg-slate-800 p-6 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-medium">{distance} KM</p>

                    <p className="text-sm text-slate-400">
                      Confirmed: {data.confirmed} | Assigned: {data.assigned} |
                      Remaining: {data.remaining}
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
                      isLocked ||
                      progress !== null
                    }
                    onClick={() => handlePreview(distance)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-40"
                  >
                    {checkingDistance === distance
                      ? "Checking..."
                      : isLocked
                        ? "Another Admin Generating..."
                        : "Generate BIB"}
                  </button>
                </div>
              );
            })}
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
