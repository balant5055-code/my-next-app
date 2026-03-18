"use client";

import { useState, useEffect } from "react";
import { secureFetch } from "@/lib/secureFetch";
import ConfirmModal from "@/components/ui/ConfirmModal";
import toast from "react-hot-toast";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useGlobalLoading } from "@/context/LoadingContext";

interface Props {
  eventId: string;
  currentStatus: string;
  currentRegistrationStatus: string;
  resultsPublished: boolean;
  onStatusChange: (newStatus: string) => void;
}
export default function EventControlCenter({
  eventId,
  currentStatus,
  onStatusChange,
  currentRegistrationStatus,
  resultsPublished: initialResultsPublished,
}: Props) {
  useEffect(() => {
    setRegistrationStatus(currentRegistrationStatus);
  }, [currentRegistrationStatus]);
  const { startLoading, stopLoading } = useGlobalLoading();
  const [resultsPublished, setResultsPublished] = useState(
    initialResultsPublished,
  );
  const [resultsLoading, setResultsLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const [loading, setLoading] = useState(false);
  /* ================= STATUS ================= */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  /* ================= REGISTRATIONL ================= */
  const [registrationStatus, setRegistrationStatus] = useState(
    currentRegistrationStatus,
  );
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationConfirmOpen, setRegistrationConfirmOpen] = useState(false);
  const [pendingRegistrationStatus, setPendingRegistrationStatus] = useState<
    string | null
  >(null);

  const openRegistrationConfirm = (newStatus: string) => {
    if (newStatus === registrationStatus) return;
    setPendingRegistrationStatus(newStatus);
    setRegistrationConfirmOpen(true);
  };
  useEffect(() => {
    setResultsPublished(initialResultsPublished);
  }, [initialResultsPublished]);
  /* ================= OPEN CONFIRM MODAL ================= */
  const openConfirm = (newStatus: string) => {
    if (newStatus === status) return;
    setPendingStatus(newStatus);
    setConfirmOpen(true);
  };
  const toggleResults = async () => {
    try {
      startLoading();
      setResultsLoading(true);

      const newValue = !resultsPublished;

      const res = await secureFetch(
        `/api/admin/events/${eventId}/results-control`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resultsPublished: newValue,
          }),
        },
      );

      if (!res.ok) throw new Error();

      setResultsPublished(newValue);

      toast.success(newValue ? "Results Published" : "Results Hidden");
    } catch {
      toast.error("Failed to update results visibility");
    } finally {
      stopLoading();
      setResultsLoading(false);
    }
  };
  /* ================= ACTUAL STATUS UPDATE ================= */
  const confirmStatusChange = async () => {
    if (!pendingStatus) return;

    try {
      startLoading(); // 🌍 GLOBAL LOADER START

      const res = await secureFetch(`/api/admin/events/${eventId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pendingStatus }),
      });

      if (!res.ok) throw new Error();

      setStatus(pendingStatus);
      onStatusChange(pendingStatus);

      toast.success(`Status updated to ${pendingStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      stopLoading(); // 🌍 GLOBAL LOADER STOP
      setLoading(false);
      setConfirmOpen(false);
      setPendingStatus(null);
    }
  };

  /* ================= REGISTRATION STATUS UPDATE ================= */
  const confirmRegistrationChange = async () => {
    if (!pendingRegistrationStatus) return;

    try {
      startLoading(); // 🌍 GLOBAL LOADER START
      setRegistrationLoading(true); // local button loading

      const res = await secureFetch(
        `/api/admin/events/${eventId}/registration-control`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registrationStatus: pendingRegistrationStatus,
          }),
        },
      );

      if (!res.ok) throw new Error();

      setRegistrationStatus(pendingRegistrationStatus);

      toast.success(`Registration ${pendingRegistrationStatus}`);
    } catch {
      toast.error("Failed to update registration");
    } finally {
      stopLoading(); // 🌍 GLOBAL LOADER STOP
      setRegistrationLoading(false);
      setRegistrationConfirmOpen(false);
      setPendingRegistrationStatus(null);
    }
  };

  const updateRegistration = async (newStatus: string) => {
    try {
      setRegistrationLoading(true);

      const res = await secureFetch(
        `/api/admin/events/${eventId}/registration-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationStatus: newStatus }),
        },
      );

      if (!res.ok) throw new Error();

      setRegistrationStatus(newStatus);

      toast.success(`Registration ${newStatus}`);
    } catch {
      toast.error("Failed to update registration");
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <section
      className="bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1220]
  rounded-2xl border border-slate-700/60 p-8
  shadow-[0_20px_60px_rgba(0,0,0,0.45)] space-y-8"
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Event Control Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage lifecycle state & registration visibility
          </p>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1 rounded-lg 
    bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs uppercase tracking-wide"
        >
          <ExclamationTriangleIcon className="h-4 w-4" />
          Critical Controls
        </div>
      </div>

      {/* ================= 2 COLUMN GRID ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ================= LEFT: LIFECYCLE ================= */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-700 p-6 space-y-6">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Lifecycle Status
            </p>
            <p className="text-xs text-slate-500">
              Controls event operational stage
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              {
                key: "upcoming",
                active: "bg-indigo-600",
                idle: "border-indigo-500/40 text-indigo-400",
              },
              {
                key: "live",
                active: "bg-emerald-600",
                idle: "border-emerald-500/40 text-emerald-400",
              },
              {
                key: "completed",
                active: "bg-slate-500",
                idle: "border-slate-500/40 text-slate-300",
              },
              {
                key: "disabled",
                active: "bg-rose-600",
                idle: "border-rose-500/40 text-rose-400",
              },
            ].map(({ key, active, idle }) => {
              const isActive = status === key;
              const isUpdating = loading && pendingStatus === key;

              return (
                <button
                  key={key}
                  disabled={loading}
                  onClick={() => openConfirm(key)}
                  className={`
                px-5 py-2.5 text-sm rounded-lg transition-all duration-200
                font-medium tracking-wide
                ${
                  isActive
                    ? `${active} text-white shadow-lg scale-105 ring-2 ring-white/20`
                    : `bg-slate-800 border ${idle} hover:bg-slate-700`
                }
                ${loading ? "opacity-60 cursor-not-allowed" : ""}
              `}
                >
                  {isUpdating
                    ? "Updating..."
                    : key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT: REGISTRATION ================= */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-700 p-6 space-y-6">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Registration Visibility
            </p>
            <p className="text-xs text-slate-500">
              Controls participant access & enrollment
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              {
                key: "open",
                active: "bg-emerald-600",
                idle: "border-emerald-500/40 text-emerald-400",
              },
              {
                key: "paused",
                active: "bg-amber-600",
                idle: "border-amber-500/40 text-amber-400",
              },
              {
                key: "closed",
                active: "bg-rose-600",
                idle: "border-rose-500/40 text-rose-400",
              },
            ].map(({ key, active, idle }) => {
              const isActive = registrationStatus === key;
              const isUpdating =
                registrationLoading && pendingRegistrationStatus === key;

              const disabled =
                registrationLoading ||
                status === "disabled" ||
                status === "completed";

              return (
                <button
                  key={key}
                  disabled={disabled}
                  onClick={() => openRegistrationConfirm(key)}
                  className={`
                px-5 py-2.5 text-sm rounded-lg transition-all duration-200
                font-medium tracking-wide
                ${
                  isActive
                    ? `${active} text-white shadow-md`
                    : `bg-slate-800 border ${idle} hover:bg-slate-700`
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
                >
                  {isUpdating
                    ? "Updating..."
                    : key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              );
            })}
          </div>

          {status === "disabled" && (
            <p className="text-xs text-rose-400">
              Registration cannot be modified while event is disabled.
            </p>
          )}

          {status === "completed" && (
            <p className="text-xs text-slate-400">
              Registration automatically locked after completion.
            </p>
          )}
        </div>

        {/* ================= RESULTS CONTROL ================= */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-700 p-6 space-y-6">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Results Visibility
            </p>
            <p className="text-xs text-slate-500">
              Control whether event results are visible to runners
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Publish Results</p>
              <p className="text-xs text-slate-400">
                Allow runners to view official race results
              </p>
            </div>

            {/* Toggle */}
            <button
              onClick={toggleResults}
              disabled={resultsLoading}
              className={`
        relative w-14 h-7 rounded-full transition-all duration-300
        ${resultsPublished ? "bg-emerald-600" : "bg-slate-700"}
        ${resultsLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
            >
              <span
                className={`
          absolute top-1 left-1 w-5 h-5 bg-white rounded-full
          transition-transform duration-300
          ${resultsPublished ? "translate-x-7" : ""}
        `}
              />
            </button>
          </div>

          {/* Status indicator */}
          <div className="text-xs text-slate-400">
            Current Status:{" "}
            <span
              className={
                resultsPublished ? "text-emerald-400" : "text-slate-400"
              }
            >
              {resultsPublished ? "Published" : "Hidden"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Status Change"
        description={`Are you sure you want to change event status to "${pendingStatus}"?`}
        confirmText="Yes, Change"
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmModal
        open={registrationConfirmOpen}
        title="Confirm Registration Change"
        description={`Are you sure you want to change registration to "${pendingRegistrationStatus}"?`}
        confirmText="Yes, Change"
        cancelText="Cancel"
        onConfirm={confirmRegistrationChange}
        onCancel={() => setRegistrationConfirmOpen(false)}
      />
    </section>
  );
}
