"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { secureFetch } from "@/lib/secureFetch";

export default function CheckInPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // =========================
  // SEARCH
  // =========================
  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);

      const res = await secureFetch(
        `/api/admin/events/${eventId}/participants/search?q=${query}`,
      );

      const result = await res.json();

      if (!res.ok) {
        setResults([]);
        setSelected(null);
        return;
      }

      const list = result.data || [];
      setResults(list);

      if (list.length === 1) {
        setSelected(list[0]);
      } else {
        setSelected(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CHECK-IN
  // =========================
  const handleCheckIn = async () => {
    console.log("BUTTON CLICKED");
    if (!selected) return;

    try {
      setCheckingIn(true);

      const res = await secureFetch(
        `/api/admin/events/${eventId}/participants/${selected.id}/checkin`,
        { method: "POST" },
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.error);
        return;
      }

      setSuccessFlash(true);

      const audio = new Audio("/beep.mp3");
      audio.play().catch(() => {});

      setTimeout(() => {
        setSuccessFlash(false);
        setSelected(null);
        setResults([]);
        setQuery("");
        inputRef.current?.focus();
      }, 1500);
    } catch (error) {
      console.error(error);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Race Day Check-In</h1>

      {/* SEARCH BAR */}
      <div className="flex gap-4 mb-10">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Registration ID / Phone / Name"
          className="flex-1 bg-slate-800 p-4 rounded-xl outline-none text-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button
          onClick={handleSearch}
          className="px-6 py-4 bg-indigo-600 rounded-xl"
        >
          Search
        </button>
      </div>

      {loading && <p>Searching...</p>}

      {/* MULTIPLE RESULTS */}
      {/* RESULTS LIST */}
      {results.length > 0 && (
        <div className="mb-6 space-y-3">
          {results.map((r) => (
            <div
              key={r.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition ${
                r.checkedIn
                  ? "border-emerald-700 bg-emerald-900/20"
                  : "border-yellow-500 bg-yellow-900/20"
              }`}
            >
              {/* LEFT SIDE */}
              <div className="space-y-1">
                <p className="font-semibold text-lg">{r.name}</p>
                <div className="text-xs text-slate-400 flex gap-4">
                  <span>ID: {r.registrationId}</span>
                  <span>📞 {r.phone}</span>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-400">BIB</p>
                  <p className="text-2xl font-bold">{r.bibNumber || "--"}</p>
                </div>

                <button
                  disabled={r.checkedIn || checkingIn}
                  onClick={async () => {
                    try {
                      setCheckingIn(true);

                      const res = await secureFetch(
                        `/api/admin/events/${eventId}/participants/${r.id}/checkin`,
                        { method: "POST" },
                      );

                      const result = await res.json();

                      if (!res.ok) {
                        alert(result.error);
                        return;
                      }

                      // Update UI instantly
                      setResults((prev) =>
                        prev.map((p) =>
                          p.id === r.id ? { ...p, checkedIn: true } : p,
                        ),
                      );

                      const audio = new Audio("/beep.mp3");
                      audio.play().catch(() => {});
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setCheckingIn(false);
                    }
                  }}
                  className={`px-5 py-2 rounded-lg font-semibold transition ${
                    r.checkedIn
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                >
                  {r.checkedIn ? "Checked-In" : "Mark Check-In"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SELECTED CARD */}
      {/* SELECTED CARD */}
      {selected && (
        <div
          className={`mt-6 rounded-xl border transition-all duration-200 ${
            selected.checkedIn
              ? "bg-emerald-900/40 border-emerald-600"
              : "bg-slate-900 border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4">
            {/* LEFT SIDE INFO */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-wide">
                {selected.name}
              </h2>

              <div className="text-sm text-slate-400 flex gap-4">
                <span>ID: {selected.registrationId}</span>
                <span>📞 {selected.phone}</span>
              </div>
            </div>

            {/* BIB BIG DISPLAY */}
            <div className="text-right">
              <p className="text-xs text-slate-400">BIB</p>
              <p className="text-3xl font-extrabold tracking-widest">
                {selected.bibNumber || "--"}
              </p>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="border-t border-slate-800 px-6 py-3 flex justify-between items-center">
            <div className="text-sm">
              Status:{" "}
              <span
                className={`font-semibold ${
                  selected.checkedIn ? "text-emerald-400" : "text-yellow-400"
                }`}
              >
                {selected.checkedIn ? "Checked-In" : "Not Checked-In"}
              </span>
            </div>
            <button
              disabled={selected.checkedIn || checkingIn}
              onClick={handleCheckIn}
              className={`px-5 py-2 rounded-lg font-semibold transition ${
                selected.checkedIn
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {selected.checkedIn ? "Already Checked-In" : "Mark Check-In"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
