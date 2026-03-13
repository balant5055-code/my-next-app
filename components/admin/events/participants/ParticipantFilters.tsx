"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

  /* =====================================================
     🔍 Debounced Search
  ===================================================== */
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = localSearch.trim();

      setFilters((prev: any) => ({
        ...prev,
        search: trimmed,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, setFilters]);

  /* =====================================================
     🔥 Real-time Categories Listener
  ===================================================== */
  useEffect(() => {
    if (!eventId) return;

    const unsub = onSnapshot(doc(db, "events", eventId), (snap) => {
      if (!snap.exists()) return;

      const eventData = snap.data();
      const cats = eventData.categories || [];

      const sorted = [...cats].sort(
        (a: any, b: any) => Number(a.distance) - Number(b.distance),
      );

      setCategories(sorted);
    });

    return () => unsub();
  }, [eventId]);

  /* =====================================================
     📤 Export CSV
  ===================================================== */
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.category !== "all")
        params.append("category", filters.category);
      if (filters.paymentStatus !== "all")
        params.append("paymentStatus", filters.paymentStatus);
      if (filters.status !== "all") params.append("status", filters.status);

      // export full filtered dataset
      params.append("export", "true");

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

  const clearSearch = () => {
    setLocalSearch("");
    setFilters((prev: any) => ({
      ...prev,
      search: "",
    }));
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== "all" && v !== "",
  ).length;

  return (
    <div className="sticky top-0 z-40 mb-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* SEARCH */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />

              <input
                type="text"
                placeholder="Search name, phone, email or BIB..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 w-64 bg-slate-950 border border-slate-800 rounded-md pl-8 pr-7 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-600 transition"
              />

              {localSearch && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* DISTANCE */}
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
                  {cat.distance} KM
                </option>
              ))}
            </select>

            {/* PAYMENT */}
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

            {/* STATUS */}
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
            {/* ACTIVE FILTER BADGE */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-200">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] font-semibold">
                  {activeFiltersCount}
                </span>
                Active Filters
              </div>
            )}

            {/* EXPORT */}
            <button
              onClick={handleExport}
              className="h-9 px-4 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 transition text-white"
            >
              Export CSV
            </button>

            {/* RESET */}
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
