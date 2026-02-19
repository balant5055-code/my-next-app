"use client";

import { useState } from "react";
import { secureFetch } from "@/lib/secureFetch";
import ConfirmModal from "@/components/ui/ConfirmModal";
import toast from "react-hot-toast";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface Props {
  eventId: string;
  onSuccess?: () => void;
}

export default function RecalculateMetricsButton({
  eventId,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRecalculate = async () => {
    try {
      setLoading(true);

      const res = await secureFetch(
        `/api/admin/events/${eventId}/recalculate-metrics`,
        {
          method: "POST",
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Metrics recalculated successfully.");

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(data.message || "Failed to recalculate metrics.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        className="
    p-2 rounded-md
    bg-rose-600/20
    hover:bg-rose-600/30
    text-rose-400
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  "
        title="Recalculate Metrics"
      >
        <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
      </button>

      <ConfirmModal
        open={confirmOpen}
        title="Recalculate Event Metrics"
        description="This will recompute participants, revenue and occupancy from database records. Are you sure you want to continue?"
        confirmText="Yes, Recalculate"
        cancelText="Cancel"
        onConfirm={handleRecalculate}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
