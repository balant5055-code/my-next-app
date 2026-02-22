"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { secureFetch } from "@/lib/secureFetch";

interface Props {
  eventId: string;
}
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
const PAGE_SIZE = 25;
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
export default function ChipMappingClient({ eventId }: Props) {
  // =========================
  // Pagination State
  // =========================
  const [data, setData] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
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
  const [sortKey, setSortKey] = useState<"bibNumber" | "name" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [compact, setCompact] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  // =========================
  // Fetch Page (Cursor)
  // =========================
  const fetchPage = async (cursor: string | null = null, isNext = false) => {
    setLoadingPage(true);

    const res = await secureFetch(
      `/api/admin/chip-mapping?eventId=${eventId}&pageSize=${PAGE_SIZE}${
        cursor ? `&cursor=${cursor}` : ""
      }`,
    );

    const result = await res.json();

    if (res.ok) {
      setData(result.data);
      setNextCursor(result.nextCursor);
      setHasNext(result.hasNext);

      if (isNext && cursor) {
        setCursorStack((prev) => [...prev, cursor]);
      }
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
    fetchPage();
  }, []);

  // =========================
  // Filtering
  // =========================
  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.bibNumber?.toString().includes(search),
      );
    }

    if (statusFilter === "ASSIGNED") {
      result = result.filter((d) => d.chipCode);
    }

    if (statusFilter === "PENDING") {
      result = result.filter((d) => !d.chipCode);
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey] ?? "";
        const valB = b[sortKey] ?? "";

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, statusFilter, sortKey, sortOrder]);
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
      body: JSON.stringify({ eventId, registrationId, chipCode: chip }),
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
          fetchPage(); // refresh current page
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
      alert(result.error);
      return;
    }

    setSelected(result.data);
    setChipInput(result.data.chipCode || "");
  };

  // =========================
  // Export
  // =========================
  const handleExportAction = async (type: "csv" | "excel") => {
    setExportLoading(true);

    await new Promise((res) => setTimeout(res, 800)); // smooth UX feel

    handleExport(true);

    setExportLoading(false);
    setExportOpen(false);
  };
  const handleExport = (force = false) => {
    const assignedRunners = data.filter((r) => r.chipCode);
    const missing = data.length - assignedRunners.length;

    if (missing > 0 && !force) {
      setExportWarning({ missing });
      return;
    }

    if (assignedRunners.length === 0) {
      alert("No assigned chips to export");
      return;
    }

    const csvRows = [
      ["BIB", "CHIP"],
      ...assignedRunners.map((r) => [r.bibNumber, r.chipCode]),
    ];

    const csvContent = csvRows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chip-mapping-${eventId}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setExportWarning(null);
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white space-y-6">
      <h1 className="text-2xl font-bold">Enterprise Chip Mapping</h1>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card label="Total (page)" value={total} />
        <Card label="Assigned" value={assigned} green />
        <Card label="Pending" value={pending} red />
      </div>

      {/* SCANNER MODE */}
      <div>
        <input
          ref={scannerRef}
          autoFocus
          placeholder="⚡ Scan BIB and press Enter"
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const bib = e.currentTarget.value.trim();
              e.currentTarget.value = "";
              if (bib) handleScan(bib);
            }
          }}
        />
      </div>

      {/* BULK UPLOAD */}
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-3">
        <h2>Bulk Upload (CSV / Excel)</h2>
        <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
        {uploading && <p>Processing...</p>}
        {uploadReport && (
          <div>
            <p>Success: {uploadReport.success}</p>
            <p>Failed: {uploadReport.failed}</p>
          </div>
        )}
      </div>

      <div className="relative flex justify-end">
        {/* MAIN BUTTON */}
        <button
          onClick={() => setExportOpen(!exportOpen)}
          disabled={data.length === 0}
          className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
      ${
        data.length === 0
          ? "bg-slate-700 text-slate-500 cursor-not-allowed"
          : "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
      }`}
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
        {exportOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <button
              onClick={() => handleExportAction("csv")}
              className="w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition"
            >
              Export as CSV
            </button>

            <button
              onClick={() => handleExportAction("excel")}
              className="w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition"
            >
              Export as Excel
            </button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="relative rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
        {/* TABLE CONTAINER WITH FIXED HEIGHT */}
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
          {loadingPage && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading page...</span>
              </div>
            </div>
          )}
          <table className="min-w-full text-sm">
            {/* HEADER */}
            <thead className="bg-slate-800 sticky top-0 z-20">
              <tr className="text-slate-300 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 text-center w-20 border-b border-slate-700">
                  S.No
                </th>

                <th className="px-6 py-4 text-center w-24 border-b border-slate-700">
                  BIB
                </th>

                <th className="px-6 py-4 text-left border-b border-slate-700">
                  Participant Name
                </th>

                <th className="px-6 py-4 text-center w-40 border-b border-slate-700">
                  Chip Status
                </th>

                <th className="px-6 py-4 text-center w-48 border-b border-slate-700">
                  Actions
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-slate-800">
              {filtered.map((reg, index) => (
                <tr
                  key={reg.id}
                  className="hover:bg-slate-800/60 transition-colors duration-200"
                >
                  {/* S.NO */}
                  <td className="px-6 py-4 text-center text-slate-400">
                    {index + 1}
                  </td>

                  {/* BIB */}
                  <td className="px-6 py-4 text-center font-semibold text-indigo-400">
                    {reg.bibNumber}
                  </td>

                  {/* NAME */}
                  <td className="px-6 py-4 text-slate-200">
                    {reg.name || "-"}
                  </td>

                  {/* CHIP */}
                  <td className="px-6 py-4 text-center">
                    {reg.chipCode ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                        {reg.chipCode}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">
                        Not Assigned
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelected(reg);
                          setChipInput(reg.chipCode || "");
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
                      >
                        Assign
                      </button>

                      {reg.chipCode && (
                        <button
                          onClick={() => updateChip(reg.id, null)}
                          className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 rounded-lg transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No participants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* PAGINATION */}
      <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
        {/* LEFT SIDE */}
        <div className="text-sm text-slate-400">
          Showing <span className="text-white font-medium">{data.length}</span>{" "}
          records
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">
          {/* PREVIOUS */}
          <button
            disabled={cursorStack.length === 0 || loadingPage}
            onClick={() => {
              const prev = cursorStack[cursorStack.length - 1];
              setCursorStack((prevStack) => prevStack.slice(0, -1));
              fetchPage(prev || null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
    ${
      cursorStack.length === 0 || loadingPage
        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
        : "bg-slate-700 hover:bg-slate-600 text-white"
    }`}
          >
            {loadingPage ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
            Previous
          </button>
          <button
            disabled={!hasNext || loadingPage}
            onClick={() => fetchPage(nextCursor, true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
    ${
      !hasNext || loadingPage
        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
        : "bg-indigo-600 hover:bg-indigo-500 text-white"
    }`}
          >
            Next
            {loadingPage ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
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
