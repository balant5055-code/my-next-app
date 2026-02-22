"use client";

import {
  XMarkIcon,
  UserIcon,
  TicketIcon,
  PencilSquareIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { secureFetch } from "@/lib/secureFetch";
import AlertModal from "@/components/ui/AlertModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
interface Props {
  participantId: string;
  eventId: string;
  onClose: () => void;
}

export default function ParticipantViewDrawer({
  participantId,
  eventId,
  onClose,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  //Modal
  const [alert, setAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [confirmMessage, setconfirmMessage] = useState(false);
  /* ================= FETCH PARTICIPANT ================= */
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    setTimeout(() => setIsOpen(true), 10);

    async function fetchParticipant() {
      try {
        const res = await secureFetch(
          `/api/admin/events/${eventId}/participants/${participantId}`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error("Fetch failed");

        const result = await res.json();
        if (active) setParticipant(result.data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Drawer Fetch Error:", err);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchParticipant();

    return () => {
      active = false;
      controller.abort();
    };
  }, [participantId, eventId]);

  /* ================= CHECK-IN ================= */
  const handleCheckIn = async () => {
    if (!participant?.bibNumber) {
      if (!participant?.bibNumber) {
        setAlert({
          title: "BIB Assignment Required",
          message: "Assign BIB before check-in",
        });
        return;
      }
      return;
    }
    if (checkingIn || participant?.checkedIn) return;

    try {
      setCheckingIn(true);

      const res = await secureFetch(
        `/api/admin/events/${eventId}/participants/${participantId}/checkin`,
        { method: "POST" },
      );

      const result = await res.json();

      if (!res.ok) {
        if (!res.ok) {
          setAlert({
            title: "Check-In Failed",
            message: result.error || "Failed to check-in",
          });
          return;
        }
        return;
      }

      setParticipant((prev: any) => ({
        ...prev,
        checkedIn: true,
        checkedInAt: Date.now(),
      }));
    } catch (error) {
      console.error("Check-In Error:", error);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => onClose(), 300);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    if (timestamp._seconds)
      return new Date(timestamp._seconds * 1000).toLocaleString();
    if (timestamp.seconds)
      return new Date(timestamp.seconds * 1000).toLocaleString();
    if (typeof timestamp === "number")
      return new Date(timestamp).toLocaleString();
    return "-";
  };

  const fullName = `${participant?.participant?.firstName || ""} ${
    participant?.participant?.lastName || ""
  }`.trim();

  const bibNumber = participant?.bibNumber;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full
        w-full sm:w-[90%] md:w-[80%] lg:w-[760px]
        bg-[#0f172a]
        z-50 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-slate-800 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                <UserIcon className="w-6 h-6 text-indigo-400" />
                {loading ? "Loading..." : fullName || "Participant"}
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                {participant?.registrationId}
              </p>

              <div className="flex gap-2 mt-3">
                <StatusChip status={participant?.status} />
                <PaymentChip status={participant?.payment?.status} />
                {participant?.checkedIn && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                    Checked-In
                  </span>
                )}
              </div>
            </div>

            <button onClick={handleClose}>
              <XMarkIcon className="w-6 h-6 text-slate-400 hover:text-white transition" />
            </button>
          </div>

          {/* BIB Highlight */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TicketIcon className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-slate-300">BIB Number</span>
            </div>

            <span className="text-xl font-bold text-indigo-400">
              {bibNumber ? `#${bibNumber}` : "Not Assigned"}
            </span>
          </div>

          {/* QUICK ACTIONS */}
          <div className="flex flex-wrap gap-3">
            <ActionButton icon={TicketIcon} label="Assign BIB" />
            <ActionButton
              icon={CheckCircleIcon}
              label={
                participant?.checkedIn
                  ? "Checked-In"
                  : checkingIn
                    ? "Checking..."
                    : "Mark Check-In"
              }
              disabled={participant?.checkedIn || checkingIn}
              onClick={handleCheckIn}
            />
            <ActionButton icon={PencilSquareIcon} label="Edit" />
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto h-[calc(100%-260px)] space-y-10">
          {loading ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <Section title="Personal Information">
                <Field label="Phone" value={participant?.participant?.phone} />
                <Field label="Email" value={participant?.participant?.email} />
                <Field
                  label="Gender"
                  value={participant?.participant?.gender}
                />
                <Field label="DOB" value={participant?.participant?.dob} />
                <Field
                  label="Address"
                  value={participant?.participant?.address}
                />
              </Section>

              <Section title="Event Information">
                <Field label="Category" value={participant?.category} />
                <Field
                  label="Distance"
                  value={participant?.participant?.distance}
                />
                <Field
                  label="Event Date"
                  value={formatDate(participant?.eventDate)}
                />
              </Section>

              <Section title="Payment Information">
                <Field label="Amount" value={`₹${participant?.amount}`} />
                <Field label="Method" value={participant?.payment?.method} />
                <Field label="Status" value={participant?.payment?.status} />
              </Section>

              <Section title="System Information">
                <Field
                  label="Created At"
                  value={formatDate(participant?.createdAt)}
                />
                <Field
                  label="Confirmed At"
                  value={formatDate(participant?.confirmedAt)}
                />
                <Field label="Status" value={participant?.status} />
              </Section>
            </>
          )}
        </div>
      </div>
      <AlertModal
        open={!!alert}
        title={alert?.title || ""}
        message={alert?.message || ""}
        onClose={() => setAlert(null)}
      />
      {/* <ConfirmModal
        open={confirmMessage}
        title="Confirm Status Change"
        description={`Are you sure you want to change event status to "${pendingStatus}"?`}
        confirmText="Yes, Change"
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={() => setconfirmMessage(false)}
      /> */}
    </>
  );
}

/* ================= UI COMPONENTS ================= */

function ActionButton({ icon: Icon, label, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition
        ${
          disabled
            ? "bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed"
            : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
        }
      `}
    >
      <Icon className="w-4 h-4 text-indigo-400" />
      {label}
    </button>
  );
}

function Section({ title, children }: any) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-indigo-400 mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: any) {
  return (
    <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm text-white font-medium break-words">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusChip({ status }: any) {
  if (!status) return null;

  const styles: any = {
    CONFIRMED: "bg-green-500/20 text-green-400",
    PENDING: "bg-yellow-500/20 text-yellow-400",
    CANCELLED: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-slate-500/20 text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentChip({ status }: any) {
  if (!status) return null;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === "SUCCESS"
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-red-500/20 text-red-400"
      }`}
    >
      {status}
    </span>
  );
}
