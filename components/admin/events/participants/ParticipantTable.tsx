"use client";

import { useEffect, useState, useRef } from "react";
import { secureFetch } from "@/lib/secureFetch";
import { motion, AnimatePresence } from "framer-motion";
import ParticipantViewDrawer from "@/components/admin/events/participants/ParticipantViewDrawer";

interface Filters {
  search: string;
  category: string;
  paymentStatus: string;
  status: string;
}

interface Props {
  eventId: string;
  filters: Filters;
}
interface Cursor {
  lastValue: number | string | null;
  lastDocId: string | null;
}

export default function ParticipantTable({ eventId, filters }: Props) {
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [participants, setParticipants] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(5);

  const [nextCursor, setNextCursor] = useState<Cursor | null>(null);
  const [cursorStack, setCursorStack] = useState<Cursor[]>([]);

  const [pageNumber, setPageNumber] = useState(1);

  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewParticipantId, setViewParticipantId] = useState<string | null>(
    null,
  );
  const handleSort = (field: string) => {
    setCursorStack([]);
    setNextCursor(null);
    setPageNumber(1);

    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;

    const handleScroll = () => {
      setIsScrolledDown(el.scrollTop > 0);
      setIsScrolledUp(el.scrollTop + el.clientHeight < el.scrollHeight);
    };

    el.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!eventId) return;

    setCursorStack([]);
    setNextCursor(null);
    setPageNumber(1);

    loadParticipants(null, false);
  }, [eventId, pageSize, filters, sortField, sortDirection]);

  function StatusBadge({ value }: { value: string | null }) {
    if (!value) return <span className="text-slate-400">—</span>;

    const base =
      "px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";

    if (value === "CONFIRMED")
      return (
        <span className={`${base} bg-green-600/20 text-green-400`}>
          Confirmed
        </span>
      );

    if (value === "PENDING")
      return (
        <span className={`${base} bg-yellow-600/20 text-yellow-400`}>
          Pending
        </span>
      );

    if (value === "CANCELLED")
      return (
        <span className={`${base} bg-red-600/20 text-red-400`}>Cancelled</span>
      );

    return (
      <span className={`${base} bg-slate-600/20 text-slate-300`}>{value}</span>
    );
  }

  function PaymentBadge({ value }: { value: string | null }) {
    if (!value) return <span className="text-slate-400">—</span>;

    const base =
      "px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";

    if (value === "SUCCESS")
      return (
        <span className={`${base} bg-emerald-600/20 text-emerald-400`}>
          Paid
        </span>
      );

    if (value === "FAILED")
      return (
        <span className={`${base} bg-red-600/20 text-red-400`}>Failed</span>
      );

    if (value === "OFFLINE")
      return (
        <span className={`${base} bg-blue-600/20 text-blue-400`}>Offline</span>
      );

    return (
      <span className={`${base} bg-slate-600/20 text-slate-300`}>{value}</span>
    );
  }

  /* ===========================
     LOAD DATA
  =========================== */
  const loadParticipants = async (cursor?: Cursor | null, isNext = true) => {
    try {
      setLoading(true); // 🔥 START LOADING

      let url = `/api/admin/events/${eventId}/participants?pageSize=${pageSize}&sortField=${sortField}&sortDirection=${sortDirection}`;

      if (filters.search) url += `&search=${filters.search}`;
      if (filters.category !== "all") url += `&category=${filters.category}`;
      if (filters.paymentStatus !== "all")
        url += `&paymentStatus=${filters.paymentStatus}`;
      if (filters.status !== "all") url += `&status=${filters.status}`;

      if (cursor && cursor.lastDocId) {
        url += `&lastValue=${cursor.lastValue}&lastDocId=${cursor.lastDocId}`;
      }

      const res = await secureFetch(url);
      if (!res.ok) throw new Error("Failed to fetch participants");

      const result = await res.json();

      const rows = result.data || [];
      setParticipants(rows);

      // 🔥 Auto-switch to Bib sort if bib exists
      if (
        sortField === "createdAt" &&
        rows.length > 0 &&
        rows.some((p: any) => p.bibNumber)
      ) {
        setSortField("bibNumber");
        setSortDirection("asc");
      }
      setTotalCount(result.totalCount || 0);
      setNextCursor(result.nextCursor || null);

      if (isNext && cursor) {
        setCursorStack((prev) => [...prev, cursor]);
        setPageNumber((prev) => prev + 1);
      }

      if (!isNext && cursorStack.length > 0) {
        setPageNumber((prev) => Math.max(prev - 1, 1));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // 🔥 STOP LOADING
    }
  };

  /* ===========================
     INITIAL LOAD
  =========================== */
  useEffect(() => {
    if (!eventId) return;

    setCursorStack([]);
    setNextCursor(null);
    setPageNumber(1);

    loadParticipants(null, false);
  }, [eventId, pageSize]);

  /* ===========================
     NEXT
  =========================== */
  const handleNext = () => {
    if (!nextCursor) return;
    loadParticipants(nextCursor, true);
  };

  /* ===========================
     PREVIOUS
  =========================== */
  const handlePrevious = () => {
    if (cursorStack.length === 0) return;

    const updatedStack = [...cursorStack];
    updatedStack.pop();

    const previousCursor =
      updatedStack.length > 0 ? updatedStack[updatedStack.length - 1] : null;

    setCursorStack(updatedStack);
    loadParticipants(previousCursor, false);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* TABLE */}
      <div
        ref={tableRef}
        className="w-full max-h-[70vh] overflow-auto scroll-smooth relative"
      >
        <table className="min-w-[1200px] w-full text-sm border-collapse">
          <thead
            className={`sticky top-0 bg-slate-900 z-30 
  transition-shadow duration-300 ease-in-out
  ${isScrolledDown ? "shadow-[0_4px_10px_-4px_rgba(0,0,0,0.7)]" : ""}
`}
          >
            <tr>
              <th className="w-14 px-2 py-4 sticky left-0 bg-slate-950 border-r border-slate-800 text-center">
                #
              </th>

              <th
                onClick={() => handleSort("bibNumber")}
                className="px-4 py-3 text-left cursor-pointer hover:text-white transition"
              >
                Bib{" "}
                {sortField === "bibNumber" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th
                onClick={() => handleSort("nameLowercase")}
                className="px-4 py-3 text-left cursor-pointer hover:text-white transition"
              >
                Name{" "}
                {sortField === "nameLowercase" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th
                onClick={() => handleSort("participant.phone")}
                className="px-4 py-3 text-left cursor-pointer hover:text-white transition"
              >
                Phone{" "}
                {sortField === "participant.phone" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th
                onClick={() => handleSort("participant.distance")}
                className="px-4 py-3 text-left cursor-pointer hover:text-white transition"
              >
                Category{" "}
                {sortField === "participant.distance" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th
                onClick={() => handleSort("amount")}
                className="px-4 py-3 text-right cursor-pointer hover:text-white transition"
              >
                Amount{" "}
                {sortField === "amount" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>

              <th className="px-4 py-3 text-left">Status</th>
              <th
                className={`px-4 py-3 sticky right-0 z-10 border-l border-slate-700
transition-shadow duration-300 ease-in-out
`}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="wait">
              {participants.length === 0 && !loading ? (
                <motion.tr
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <td
                    colSpan={8}
                    className="px-4 py-14 text-center text-slate-500"
                  >
                    No participants found
                  </td>
                </motion.tr>
              ) : (
                participants.map((p, index) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="border-t border-slate-700 hover:bg-slate-800/50 transition-colors duration-200"
                  >
                    {/* Serial */}
                    <td className="w-14 px-2 py-3 sticky left-0 bg-slate-900 z-10 border-r border-slate-800 text-center text-slate-400">
                      {(pageNumber - 1) * pageSize + index + 1}
                    </td>

                    {/* Bib */}
                    <td className="px-4 py-3 text-white font-medium">
                      {p.bibNumber ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                          {p.bibNumber}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3 text-white font-medium">
                      {p.name || "—"}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-slate-400">
                      {p.phone || "—"}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-slate-400">
                      {p.category || "—"}
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3">
                      <PaymentBadge value={p.paymentStatus} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge value={p.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 sticky right-0 bg-slate-900 z-10 border-l border-slate-800">
                      <button
                        onClick={() => setViewParticipantId(p.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 transition text-white cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-300">Updating data...</p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-t border-slate-700 text-sm">
        {/* Left Info */}
        <div className="text-slate-400">
          Showing{" "}
          <span className="text-white font-medium">
            {(pageNumber - 1) * pageSize + 1}
          </span>{" "}
          –
          <span className="text-white font-medium">
            {Math.min(pageNumber * pageSize, totalCount)}
          </span>{" "}
          of <span className="text-white font-semibold">{totalCount}</span>
        </div>

        {/* Page Size */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={cursorStack.length === 0}
            className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!nextCursor}
            className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white transition"
          >
            Next
          </button>
        </div>
      </div>
      {viewParticipantId && (
        <ParticipantViewDrawer
          participantId={viewParticipantId}
          eventId={eventId}
          onClose={() => setViewParticipantId(null)}
        />
      )}
    </div>
  );
}
