"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { secureFetch } from "@/lib/secureFetch";

import EventStatsPanel from "@/components/admin/EventStatsPanel";
interface Props {
  eventId: string;
}
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import ClearAllChipsButton from "@/components/admin/ClearAllChipsButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ChipMappingTable from "@/components/admin/ChipMappingTable";
import ChipMappingPagination from "@/components/admin/ChipMappingPagination";
import BulkUploadCard from "@/components/admin/BulkUploadCard";
export default function ChipMappingClient({ eventId }: Props) {
  // =========================
  // Pagination State
  // =========================
  const [data, setData] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState(false);

  const [hasNext, setHasNext] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  // =========================
  // UI State
  // =========================
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);
  const [chipInput, setChipInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadReport, setUploadReport] = useState<{
    success: number;
    failed: number;
  } | null>(null);
  const [exportWarning, setExportWarning] = useState<{
    missing: number;
  } | null>(null);

  const scannerRef = useRef<HTMLInputElement>(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [compact, setCompact] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineChip, setInlineChip] = useState("");
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [sortKey, setSortKey] = useState<
    "bibNumber" | "name" | "chipCode" | null
  >(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // =========================
  // Fetch Page (Cursor)
  // =========================
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const fetchPage = async (cursor: string | null) => {
    setLoadingPage(true);

    const res = await secureFetch(
      `/api/admin/chip-mapping?eventId=${eventId}&pageSize=${pageSize}${
        cursor ? `&cursor=${cursor}` : ""
      }`,
    );

    const result = await res.json();

    if (res.ok) {
      setData(result.data);
      setNextCursor(result.nextCursor);
      setHasNext(result.hasNext);

      setCurrentCursor(cursor);
    }

    setLoadingPage(false);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      setShowLeftShadow(el.scrollLeft > 0);
      setShowRightShadow(el.scrollLeft + el.clientWidth < el.scrollWidth);
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll);

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setCursorHistory([]);
    setCurrentCursor(null);
    fetchPage(null);
  }, [pageSize]);
  // =========================
  // Filtering
  // =========================
  const filtered = useMemo(() => {
    let result = [...data];
    // SEARCH
    if (search) {
      result = result.filter((item) => {
        const fullName =
          `${item.participant?.firstName ?? ""} ${item.participant?.lastName ?? ""}`.toLowerCase();

        return (
          fullName.includes(search.toLowerCase()) ||
          item.bibNumber?.toString().includes(search)
        );
      });
    }
    // STATUS FILTER
    if (statusFilter === "ASSIGNED") {
      result = result.filter((d) => d.chipCode);
    }
    if (statusFilter === "PENDING") {
      result = result.filter((d) => !d.chipCode);
    }
    // SORT
    if (sortKey) {
      result.sort((a, b) => {
        const valA = (a[sortKey] ?? "").toString().toLowerCase();
        const valB = (b[sortKey] ?? "").toString().toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, search, statusFilter, selectedCategory, sortKey, sortOrder]);

  const duplicateChips = useMemo(() => {
    const map: Record<string, number> = {};

    data.forEach((item) => {
      if (!item.chipCode) return;
      map[item.chipCode] = (map[item.chipCode] || 0) + 1;
    });

    return Object.keys(map).filter((chip) => map[chip] > 1);
  }, [data]);
  // =========================
  // Stats (Current Page)
  // =========================
  const total = data.length;
  const assigned = data.filter((d) => d.chipCode).length;
  const pending = total - assigned;

  // =========================
  // Assign / Remove
  // =========================
  const updateChip = async (registrationId: string, chip: string | null) => {
    setLoading(true);
    const res = await secureFetch("/api/admin/chip-mapping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        registrationId,
        chipCode: chip,
        bibNumber: chip,
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error);
    } else {
      setData((prev) =>
        prev.map((item) =>
          item.id === registrationId ? { ...item, chipCode: chip } : item,
        ),
      );
      setSelected(null);
      fetchEventStats();
    }
    setLoading(false);
  };

  // =========================
  // Bulk Upload
  // =========================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadReport(null);
    const reader = new FileReader();
    reader.onload = async (evt: any) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const res = await secureFetch("/api/admin/chip-mapping/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            rows: jsonData,
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          alert(result.error);
        } else {
          setUploadReport(result);
          fetchEventStats();
        }
      } catch {
        alert("Invalid file format");
      }

      setUploading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // =========================
  // Enterprise Scanner
  // =========================
  const handleScan = async (bib: string) => {
    const res = await secureFetch(
      `/api/admin/chip-mapping/find?eventId=${eventId}&bib=${bib}`,
    );

    const result = await res.json();

    if (!res.ok) {
      setScanStatus("error");

      // auto reset after animation
      setTimeout(() => {
        setScanStatus("idle");
      }, 800);

      return;
    }

    setSelected(result.data);
    setChipInput(result.data.chipCode || "");

    setScanStatus("success");

    setTimeout(() => {
      setScanStatus("idle");
    }, 800);
  };

  // =========================
  // Export
  // =========================

  // =========================
  // Enterprise Streaming Export
  // =========================
  // =========================
  // Enterprise Streaming Export (All DB Data)
  // =========================
  const handleExportAction = async () => {
    try {
      setExportLoading(true);

      // Optional small delay for smooth UX
      await new Promise((res) => setTimeout(res, 300));

      // Trigger backend streaming download
      window.location.href = `/api/admin/chip-mapping/export?eventId=${eventId}`;

      setExportOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const categoryStats = useMemo(() => {
    const map: Record<
      string,
      { total: number; assigned: number; pending: number }
    > = {};

    data.forEach((item) => {
      const cat = item.categoryName || "Uncategorized";

      if (!map[cat]) {
        map[cat] = { total: 0, assigned: 0, pending: 0 };
      }

      map[cat].total += 1;

      if (item.chipCode) {
        map[cat].assigned += 1;
      } else {
        map[cat].pending += 1;
      }
    });

    return map;
  }, [data]);

  const handleSort = (key: "bibNumber" | "name" | "chipCode") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const scrollToRow = (id: string) => {
    const el = rowRefs.current[id];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };
  const fetchEventStats = async () => {
    const res = await secureFetch(
      `/api/admin/chip-mapping/event-stats?eventId=${eventId}`,
    );

    const result = await res.json();

    if (res.ok) {
      setEventStats(result);
    }
  };
  useEffect(() => {
    console.log("Table Data:", data);
  }, [data]);
  useEffect(() => {
    fetchEventStats();
  }, []);
  return (
    <div className="bg-slate-900 min-h-screen text-white space-y-6">
      <h1 className="text-2xl font-bold">Enterprise Chip Mapping</h1>
      {/* ENTERPRISE STATS */}
      <EventStatsPanel stats={eventStats} />

      {/* SCANNER MODE */}
      <div className="bg-gradient-to-r from-indigo-600/10 to-emerald-600/10 border border-indigo-500/20 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          {/* ICON */}
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            ⚡
          </div>

          {/* INPUT AREA */}
          <div className="flex-1">
            <p className="text-sm text-slate-400 mb-1">Scanner Mode</p>

            <input
              ref={scannerRef}
              autoFocus
              placeholder="Scan BIB and press Enter..."
              className={`
    w-full px-4 py-3 rounded-xl border text-white transition-all duration-300
    ${
      scanStatus === "success"
        ? "bg-green-600/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
        : scanStatus === "error"
          ? "bg-red-600/20 border-red-500 animate-shake"
          : "bg-slate-900 border-slate-700 focus:ring-2 focus:ring-indigo-500"
    }
  `}
              onKeyDown={(e) => {
                // ✅ ENTER should ALWAYS work
                if (e.key === "Enter") {
                  const bib = e.currentTarget.value.trim();
                  e.currentTarget.value = "";
                  if (bib) handleScan(bib);
                  return;
                }

                // For arrow navigation only
                if (activeIndex === null) return;

                if (e.key === "Escape") {
                  setEditingId(null);
                }

                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (activeIndex < filtered.length - 1) {
                    const nextIndex = activeIndex + 1;
                    const next = filtered[nextIndex];
                    setActiveIndex(nextIndex);
                    setEditingId(next.id);
                    setInlineChip(next.chipCode || "");
                    scrollToRow(next.id);
                  }
                }

                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (activeIndex > 0) {
                    const prevIndex = activeIndex - 1;
                    const prev = filtered[prevIndex];
                    setActiveIndex(prevIndex);
                    setEditingId(prev.id);
                    setInlineChip(prev.chipCode || "");
                    scrollToRow(prev.id);
                  }
                }
              }}
            />
          </div>

          {/* STATUS DOT */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </div>
        </div>
      </div>

      {/* BULK UPLOAD */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
        <BulkUploadCard
          eventId={eventId}
          onUploadSuccess={() => {
            setCursorHistory([]);
            setCurrentCursor(null);
            setNextCursor(null);
            setActiveIndex(null);
            fetchPage(null);
            fetchEventStats();
          }}
        />
      </div>
      <div className="flex items-center justify-end gap-3 relative">
        {/* CLEAR BUTTON */}
        <ClearAllChipsButton
          eventId={eventId}
          onSuccess={() => {
            fetchPage(null);
            fetchEventStats();
          }}
        />

        {/* EXPORT WRAPPER (relative only here) */}
        <div className="relative">
          {/* MAIN EXPORT BUTTON */}
          <button
            onClick={() => setExportOpen(!exportOpen)}
            disabled={data.length === 0}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
        ${
          data.length === 0
            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
        }
      `}
          >
            {exportLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="w-5 h-5 transition-transform duration-200 group-hover:translate-y-0.5" />
            )}
            Export
            <ChevronDownIcon className="w-4 h-4 opacity-80" />
          </button>

          {/* DROPDOWN */}
          {/* DROPDOWN */}
          {exportOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <button
                onClick={handleExportAction}
                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition"
              >
                Export as CSV
              </button>

              <button
                onClick={handleExportAction}
                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition"
              >
                Export as Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 px-6 pb-6 flex flex-col min-h-0">
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-lg">
          <ChipMappingTable
            filtered={filtered}
            loadingPage={loadingPage}
            editingId={editingId}
            inlineChip={inlineChip}
            activeIndex={activeIndex}
            rowRefs={rowRefs}
            setEditingId={setEditingId}
            setInlineChip={setInlineChip}
            setActiveIndex={setActiveIndex}
            updateChip={updateChip}
            scrollToRow={scrollToRow}
            duplicateChips={duplicateChips}
          />
        </div>

        <div className="mt-4">
          <ChipMappingPagination
            dataLength={data.length}
            pageSize={pageSize}
            hasNext={hasNext}
            loadingPage={loadingPage}
            canGoPrev={cursorHistory.length > 0}
            onPrev={() => {
              if (cursorHistory.length === 0) return;

              const previousCursor = cursorHistory[cursorHistory.length - 1];

              setCursorHistory((prev) => prev.slice(0, -1));
              fetchPage(previousCursor);
            }}
            onNext={() => {
              if (!nextCursor) return;

              setCursorHistory((prev) => [...prev, currentCursor]);
              fetchPage(nextCursor);
            }}
            onPageSizeChange={(size) => {
              setPageSize(size);
            }}
          />
        </div>
      </div>

      {/* ASSIGN CHIP MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-96 space-y-4 border border-slate-700">
            <h2 className="text-lg font-semibold">
              Assign Chip – BIB {selected.bibNumber}
            </h2>

            <input
              value={chipInput}
              onChange={(e) => setChipInput(e.target.value)}
              placeholder="Enter chip code"
              className="w-full p-3 bg-slate-900 rounded-xl border border-slate-700"
            />

            <div className="flex gap-3">
              <button
                onClick={() => updateChip(selected.id, chipInput)}
                disabled={loading}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl"
              >
                Save
              </button>

              <button
                onClick={() => setSelected(null)}
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

function Card({ label, value, green, red }: any) {
  return (
    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
      <p>{label}</p>
      <p
        className={`text-xl font-bold ${
          green ? "text-green-400" : red ? "text-red-400" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
