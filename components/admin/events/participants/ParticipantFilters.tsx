"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // your client firebase
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  eventId: string;
  filters: any;
  setFilters: (value: any) => void;
}

export default function ParticipantFilters({
  eventId,
  filters,
  setFilters,
}: Props) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [categories, setCategories] = useState<any[]>([]);

  /* -------------------------------
     🔍 Debounced Search
  -------------------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev: any) => ({
        ...prev,
        search: localSearch,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch]);

  /* -------------------------------
     🔥 Real-time Categories Listener
  -------------------------------- */
  useEffect(() => {
    if (!eventId) return;

    const unsub = onSnapshot(doc(db, "events", eventId), (snap) => {
      if (!snap.exists()) return;

      const eventData = snap.data();
      const cats = eventData.categories || [];

      // sort by numeric distance
      const sorted = cats.sort(
        (a: any, b: any) => Number(a.distance) - Number(b.distance),
      );

      setCategories(sorted);
    });

    return () => unsub();
  }, [eventId]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.category !== "all")
        params.append("category", filters.category);
      if (filters.paymentStatus !== "all")
        params.append("paymentStatus", filters.paymentStatus);
      if (filters.status !== "all") params.append("status", filters.status);

      const res = await fetch(
        `/api/admin/events/${eventId}/participants/export?${params.toString()}`,
        { credentials: "include" },
      );

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "participants.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error", err);
    }
  };

  return (
    <div className="sticky top-0 z-40 mb-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search participants..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 w-64 bg-slate-950 border border-slate-800 rounded-md px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-600 transition"
              />
            </div>

            {/* Distance */}
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev: any) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-slate-600 transition"
            >
              <option value="all">All Distances</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.distance}>
                  {cat.distance}KM
                </option>
              ))}
            </select>

            {/* Payment */}
            <select
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters((prev: any) => ({
                  ...prev,
                  paymentStatus: e.target.value,
                }))
              }
              className="h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-slate-600 transition"
            >
              <option value="all">All Payments</option>
              <option value="SUCCESS">Paid</option>
              <option value="OFFLINE">Offline</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev: any) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              className="h-9 bg-slate-950 border border-slate-800 rounded-md px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-slate-600 transition"
            >
              <option value="all">All Status</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            {/* Premium Active Filters Badge */}
            {Object.values(filters).filter((v) => v !== "all" && v !== "")
              .length > 0 && (
              <div className="group relative">
                <div
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full 
      bg-slate-800/80 backdrop-blur-md 
      border border-slate-700 
      text-xs font-medium text-slate-200
      transition-all duration-300 
      hover:border-indigo-500/40 
      hover:shadow-md hover:shadow-indigo-900/20"
                >
                  {/* Count Circle */}
                  <span className="flex items-center justify-center h-5 w-5 text-[11px] font-semibold rounded-full bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30">
                    {
                      Object.values(filters).filter(
                        (v) => v !== "all" && v !== "",
                      ).length
                    }
                  </span>

                  <span className="tracking-wide text-slate-300">
                    Active Filters
                  </span>
                </div>

                {/* Subtle Premium Glow */}
                <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_60%)]" />
              </div>
            )}
            <button
              onClick={handleExport}
              className="h-9 px-4 text-xs font-medium rounded-md 
  bg-emerald-600 hover:bg-emerald-700 transition text-white"
            >
              Export CSV
            </button>

            <button
              onClick={() =>
                setFilters({
                  search: "",
                  category: "all",
                  paymentStatus: "all",
                  status: "all",
                })
              }
              className="h-9 px-4 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 transition text-white"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
