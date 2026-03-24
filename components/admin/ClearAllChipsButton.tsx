"use client";

import { useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { secureFetch } from "@/lib/secureFetch";

interface Props {
  eventId: string;
  onSuccess?: () => void;
}

export default function ClearAllChipsButton({ eventId, onSuccess }: Props) {
  const [openMenu, setOpenMenu] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClear = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await secureFetch("/api/admin/chip-mapping/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Failed to clear chips");
        return;
      }

      onSuccess?.();
    } catch (err) {
      console.error("Clear chips failed:", err);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };
  return (
    <div className="relative">
      {/* 3 DOT BUTTON */}
      <button
        onClick={() => setOpenMenu(!openMenu)}
        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
      >
        <EllipsisVerticalIcon className="w-5 h-5 text-slate-300" />
      </button>

      {/* DROPDOWN */}
      {openMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50">
          <button
            onClick={() => {
              setOpenMenu(false);
              setConfirmOpen(true);
            }}
            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700"
          >
            Clear All Chip Assignments
          </button>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-96 space-y-4 border border-slate-700">
            <h2 className="text-lg font-semibold text-red-400">
              Clear All Chips
            </h2>

            <p className="text-sm text-slate-300">
              This will remove all chip assignments. This cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                disabled={loading}
                onClick={handleClear}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-white disabled:opacity-50"
              >
                {loading ? "Clearing..." : "Confirm"}
              </button>

              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
