"use client";

import { useState } from "react";
import { secureFetch } from "@/lib/secureFetch";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useEffect } from "react";
import { useGlobalLoading } from "@/context/LoadingContext";

interface Props {
  eventId: string;
  category: {
    id: string;
    title: string;
    price: number;
    maxSeats: number;
    bookedSeats: number;
    nextBib: number;
    bibStart: number;
    bibEnd: number;
    distance: string;
    waitlistEnabled?: boolean;
    status?: "open" | "closed";

    waitlistCount?: number;
  };
  onRefresh: () => Promise<void>;
}

export default function CategoryControlCard({
  eventId,
  category,
  onRefresh,
}: Props) {
  const { startLoading, stopLoading } = useGlobalLoading();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const seatFillPercent = category.maxSeats
    ? Math.round((category.bookedSeats / category.maxSeats) * 100)
    : 0;
  const [priceInput, setPriceInput] = useState(category.price);
  const [pendingAction, setPendingAction] = useState<{
    message: string;
    payload: any;
  } | null>(null);
  const getTelemetryColor = () => {
    if (seatFillPercent === 0) return "idle";
    if (seatFillPercent < 50) return "healthy";
    if (seatFillPercent < 80) return "warning";
    if (seatFillPercent < 100) return "critical";
    return "full";
  };
  const getRegistrationMessage = () => {
    if (seatFillPercent === 0) return "No registrations yet";
    if (seatFillPercent < 50) return "Registrations open";
    if (seatFillPercent < 80) return "Filling fast";
    if (seatFillPercent < 100) return "Almost full";
    return "Sold out";
  };

  const registrationMessage = getRegistrationMessage();

  const telemetryState = getTelemetryColor();

  const openConfirm = (message: string, payload: any) => {
    setConfirmMessage(message);
    setPendingPayload(payload);
    setConfirmOpen(true);
  };
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(category.price);

  const [editBibMode, setEditBibMode] = useState(false);
  const [bibStartInput, setBibStartInput] = useState(category.bibStart);
  const [bibEndInput, setBibEndInput] = useState(category.bibEnd);
  const [bibEditorOpen, setBibEditorOpen] = useState(false);
  const visiblePercent = seatFillPercent === 0 ? 4 : seatFillPercent;
  const [editPriceMode, setEditPriceMode] = useState(false);

  const isZero = seatFillPercent === 0;
  useEffect(() => {
    setPriceInput(category.price);
  }, [category.price]);
  /* ================= ENTERPRISE UPDATE ENGINE ================= */

  const updateCategory = async (
    actionName: string,
    payload: Record<string, any>,
  ) => {
    try {
      startLoading(); // ✅ GLOBAL LOADER START
      setLoadingAction(actionName); // local button loading

      const res = await secureFetch(
        `/api/admin/events/${eventId}/categories/${category.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error();

      await onRefresh();
      toast.success("Category updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update category");
    } finally {
      stopLoading(); // ✅ GLOBAL LOADER STOP
      setLoadingAction(null);
    }
  };

  useEffect(() => {
    setBibStartInput(category.bibStart);
    setBibEndInput(category.bibEnd);
  }, [category.bibStart, category.bibEnd]);

  return (
    <div
      className="relative
rounded-2xl
overflow-hidden
border border-gray-200 dark:border-slate-700
bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0b1220]
shadow-xl
transition-colors duration-300
before:absolute before:inset-0
before:rounded-2xl
before:p-[1px]
before:bg-gradient-to-r
before:from-emerald-500/30
before:via-indigo-500/30
before:to-pink-500/30
before:blur-sm
before:-z-10"
    >
      {/* ================= HEADER ================= */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h3 className="text-gray-900 dark:text-white  text-lg">
            {category.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            {category.distance}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            Seat Fill
          </p>
          <p className="text-xl font-bold text-emerald-400">
            {seatFillPercent}%
          </p>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="p-6 space-y-8">
        {/* ================= SEAT FILL PROGRESS BAR ================= */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
            <span>Seat Occupancy</span>
            <span className=" text-gray-900 dark:text-white">
              {seatFillPercent}%
            </span>
          </div>

          <div
            className="relative h-3 bg-gray-50 dark:bg-slate-800/50
border border-gray-200 dark:border-slate-700
transition-colors duration-300 rounded-full overflow-hidden border border-slate-700"
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isZero
                  ? "bg-slate-600"
                  : "bg-gradient-to-r from-emerald-500 to-green-400"
              }`}
              style={{ width: `${visiblePercent}%` }}
            />

            {!isZero && (
              <div
                className="absolute top-0 left-0 h-full bg-emerald-400/20 blur-md"
                style={{ width: `${visiblePercent}%` }}
              />
            )}
          </div>

          <p
            className={`text-xs font-medium ${
              seatFillPercent === 0
                ? "text-slate-400"
                : seatFillPercent < 50
                  ? "text-emerald-400"
                  : seatFillPercent < 80
                    ? "text-amber-400"
                    : seatFillPercent < 100
                      ? "text-orange-400"
                      : "text-rose-400"
            }`}
          >
            {registrationMessage}
          </p>
        </div>

        {/* ================= CATEGORY INFO PANEL ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400 uppercase tracking-wide">
                Price
              </p>

              <button
                onClick={() => setEditPriceMode(!editPriceMode)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                {editPriceMode ? "Cancel" : "Edit"}
              </button>
            </div>

            {!editPriceMode ? (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 ">
                ₹ {category.price}
              </p>
            ) : (
              <div className="space-y-3">
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />

                <button
                  disabled={loadingAction === "price"}
                  onClick={async () => {
                    if (priceInput <= 0) {
                      toast.error("Price must be greater than 0");
                      return;
                    }

                    await updateCategory("price", { price: priceInput });
                    setEditPriceMode(false);
                  }}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-gray-900 dark:text-white disabled:opacity-50 transition"
                >
                  {loadingAction === "price" ? "Updating..." : "Save Price"}
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase">Seats</p>
            <p className="text-gray-900 dark:text-white  mt-1">
              {category.bookedSeats} / {category.maxSeats}
            </p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase">Bib Range</p>
            <p className="text-gray-900 dark:text-white  mt-1">
              {category.bibStart} - {category.bibEnd}
            </p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase">Next Bib</p>
            <p className="text-gray-900 dark:text-white  mt-1">
              {category.nextBib}
            </p>
          </div>
        </div>

        {/* ================= ENTERPRISE BIB RANGE CONTROL ================= */}
        <div className="border-t border-slate-700 pt-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-900 dark:text-white  text-base">
                Bib Range Control
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Manage bib allocation and sequencing for this category
              </p>
            </div>

            <button
              onClick={() => setEditBibMode(!editBibMode)}
              className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800/50
border border-gray-200 dark:border-slate-700
transition-colors duration-300 border border-slate-600 rounded-lg text-indigo-400 hover:text-indigo-300 hover:border-indigo-500 transition"
            >
              {editBibMode ? "Cancel Edit" : "Edit Range"}
            </button>
          </div>

          {/* Display Mode */}
          {!editBibMode ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Start */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Bib Start
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1  mt-1">
                  {category.bibStart}
                </p>
              </div>

              {/* End */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Bib End
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1  mt-1">
                  {category.bibEnd}
                </p>
              </div>

              {/* Next Issued */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Next Bib
                </p>
                <p className="text-emerald-400 text-lg  mt-1">
                  {category.nextBib}
                </p>
              </div>

              {/* Remaining */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Remaining
                </p>
                <p className="text-amber-400 text-lg  mt-1">
                  {category.bibEnd - category.nextBib + 1}
                </p>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="bg-slate-900/40 border border-slate-700 rounded-2xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-slate-400 uppercase">
                    Bib Start
                  </label>
                  <input
                    type="number"
                    value={bibStartInput}
                    onChange={(e) => setBibStartInput(Number(e.target.value))}
                    className="w-full mt-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50
border border-gray-200 dark:border-slate-700
transition-colors duration-300 border border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 dark:text-slate-400 uppercase">
                    Bib End
                  </label>
                  <input
                    type="number"
                    value={bibEndInput}
                    onChange={(e) => setBibEndInput(Number(e.target.value))}
                    className="w-full mt-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50
border border-gray-200 dark:border-slate-700
transition-colors duration-300 border border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!!loadingAction}
                  onClick={() =>
                    updateCategory("bibRange", {
                      bibStart: bibStartInput,
                      bibEnd: bibEndInput,
                    })
                  }
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-gray-900 dark:text-white disabled:opacity-50 transition"
                >
                  {loadingAction === "bibRange"
                    ? "Updating..."
                    : "Save Bib Range"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= ENTERPRISE STATUS WITH BULB ================= */}
        <div className="border-t border-slate-700 pt-6">
          <div className="flex justify-between items-center bg-slate-800/60 border border-slate-700 rounded-xl px-6 py-5">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">
              {/* Status Bulb */}
              {/* GPS Status Indicator */}
              {/* ================= F1 TELEMETRY STATUS ================= */}
              <div className="relative flex items-center justify-center w-8 h-8">
                {/* Expanding Outer Ring */}
                {telemetryState !== "idle" && telemetryState !== "full" && (
                  <span
                    className={`absolute w-8 h-8 rounded-full animate-ping opacity-40 ${
                      telemetryState === "healthy"
                        ? "bg-emerald-400"
                        : telemetryState === "warning"
                          ? "bg-amber-400"
                          : "bg-orange-500"
                    }`}
                  />
                )}

                {/* Neon Glow Ring */}
                <span
                  className={`absolute w-6 h-6 rounded-full blur-md opacity-70 ${
                    telemetryState === "idle"
                      ? "bg-slate-500"
                      : telemetryState === "healthy"
                        ? "bg-emerald-400"
                        : telemetryState === "warning"
                          ? "bg-amber-400"
                          : telemetryState === "critical"
                            ? "bg-orange-500"
                            : "bg-rose-500"
                  }`}
                />

                {/* Core Dot */}
                <span
                  className={`relative w-3 h-3 rounded-full ${
                    telemetryState === "idle"
                      ? "bg-slate-400"
                      : telemetryState === "healthy"
                        ? "bg-emerald-500"
                        : telemetryState === "warning"
                          ? "bg-amber-500"
                          : telemetryState === "critical"
                            ? "bg-orange-600"
                            : "bg-rose-600"
                  }`}
                />
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  Category Status
                </p>

                <p
                  className={`text-sm  mt-1 ${
                    category.status === "closed"
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }`}
                >
                  {category.status === "closed" ? "Closed" : "Active"}
                </p>
              </div>
            </div>

            {/* TOGGLE SWITCH */}
            <button
              disabled={!!loadingAction}
              onClick={() =>
                openConfirm(
                  category.status === "closed"
                    ? "Are you sure you want to ACTIVATE this category?"
                    : "Are you sure you want to CLOSE this category?",
                  {
                    type: "status",
                    status: category.status === "closed" ? "open" : "closed",
                  },
                )
              }
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                category.status === "closed" ? "bg-slate-600" : "bg-emerald-500"
              } ${loadingAction ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                  category.status === "closed"
                    ? "translate-x-0"
                    : "translate-x-7"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ================= CONTROLS ================= */}

        <div className="border-t border-slate-700 pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {/* +10 Seats */}
            <button
              disabled={!!loadingAction}
              onClick={() =>
                openConfirm("Increase seats by 10 for this category?", {
                  type: "seats",
                  maxSeats: category.maxSeats + 10,
                })
              }
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-gray-900 dark:text-white disabled:opacity-50 transition"
            >
              {loadingAction === "seats" ? "Updating..." : "+10 Seats"}
            </button>

            {/* Reset Bib */}
            <button
              disabled={!!loadingAction}
              onClick={() =>
                openConfirm(
                  "Are you sure you want to reset all BIB numbers for this category?",
                  { type: "resetBib", nextBib: category.bibStart },
                )
              }
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl text-gray-900 dark:text-white disabled:opacity-50 transition"
            >
              {loadingAction === "resetBib" ? "Updating..." : "Reset Bib"}
            </button>

            {/* Waitlist Toggle */}
            <button
              disabled={!!loadingAction}
              onClick={() =>
                openConfirm(
                  category.waitlistEnabled
                    ? "Disable waitlist for this category?"
                    : "Enable waitlist for this category?",
                  {
                    type: "waitlist",
                    waitlistEnabled: !category.waitlistEnabled,
                  },
                )
              }
              className={`px-4 py-2.5 rounded-xl text-gray-900 dark:text-white disabled:opacity-50 transition ${
                category.waitlistEnabled
                  ? "bg-pink-700 hover:bg-pink-600"
                  : "bg-pink-500 hover:bg-pink-400"
              }`}
            >
              {loadingAction === "waitlist"
                ? "Updating..."
                : category.waitlistEnabled
                  ? "Disable Waitlist"
                  : "Enable Waitlist"}
            </button>
          </div>

          {/* Confirm Modal (DO NOT REMOVE) */}
          <ConfirmModal
            open={confirmOpen}
            title="Confirm Category Action"
            description={confirmMessage}
            confirmText="Yes, Continue"
            cancelText="Cancel"
            onConfirm={async () => {
              if (!pendingPayload) return;

              setConfirmOpen(false); // ✅ CLOSE MODAL FIRST
              setPendingPayload(null);

              if (pendingPayload.type === "seats") {
                await updateCategory("seats", {
                  maxSeats: pendingPayload.maxSeats,
                });
              }

              if (pendingPayload.type === "resetBib") {
                await updateCategory("resetBib", {
                  nextBib: pendingPayload.nextBib,
                });
              }

              if (pendingPayload.type === "waitlist") {
                await updateCategory("waitlist", {
                  waitlistEnabled: pendingPayload.waitlistEnabled,
                });
              }

              if (pendingPayload.type === "status") {
                await updateCategory("status", {
                  status: pendingPayload.status,
                });
              }
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
