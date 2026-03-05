"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { secureFetch } from "@/lib/secureFetch";

interface Props {
  eventId: string;
  onUploadSuccess?: () => void;
}

export default function BulkUploadCard({ eventId, onUploadSuccess }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [conflictMode, setConflictMode] = useState<
    "block" | "skip" | "override"
  >("block");
  const processFile = async (file: File) => {
    setFileName(file.name);
    setUploading(true);
    setReport(null);

    const reader = new FileReader();

    reader.onload = async (evt: any) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

        const firstRow = jsonData[0];

        if (!firstRow || !("BIB" in firstRow) || !("CHIP" in firstRow)) {
          alert("File must contain BIB and CHIP columns");
          setUploading(false);
          return;
        }

        const valid: any[] = [];
        const invalid: any[] = [];

        jsonData.forEach((row, index) => {
          const bib = row.BIB?.toString().trim();
          const chip = row.CHIP?.toString().trim();

          if (!bib || !chip) {
            invalid.push({
              BIB: bib || "",
              CHIP: chip || "",
              rowNumber: index + 2,
            });
          } else {
            valid.push({
              BIB: bib,
              CHIP: chip,
            });
          }
        });

        const chipMap: Record<string, number> = {};
        const bibMap: Record<string, number> = {};

        valid.forEach((row) => {
          chipMap[row.CHIP] = (chipMap[row.CHIP] || 0) + 1;
          bibMap[row.BIB] = (bibMap[row.BIB] || 0) + 1;
        });

        const duplicateChipsInFile = Object.keys(chipMap).filter(
          (chip) => chipMap[chip] > 1,
        );

        const duplicateBibsInFile = Object.keys(bibMap).filter(
          (bib) => bibMap[bib] > 1,
        );

        setPreviewData(valid);
        setInvalidRows(invalid);
        setDuplicateChips(duplicateChipsInFile);
        setDuplicateBibs(duplicateBibsInFile);
        setUploading(false);
        setShowPreview(true);
        // 🚫 If UI errors exist → DO NOT check DB yet
        if (
          invalid.length > 0 ||
          duplicateChipsInFile.length > 0 ||
          duplicateBibsInFile.length > 0
        ) {
          return;
        }

        // ✅ Only if UI clean → check DB duplicates
        setIsCheckingDb(true);

        try {
          const res = await secureFetch(
            "/api/admin/chip-mapping/check-duplicates",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                eventId,
                rows: valid,
              }),
            },
          );

          const dbResult = await res.json();

          if (res.ok) {
            setDbDuplicateChips(dbResult.duplicateInDbChips || []);
            setDbDuplicateBibs(dbResult.duplicateInDbBibs || []);
          }
        } catch (err) {
          console.error("Duplicate check failed:", err);
        } finally {
          setIsCheckingDb(false);
        }
      } catch (err) {
        console.error("File processing failed:", err);
        alert("Invalid file format");
        setUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [invalidRows, setInvalidRows] = useState<any[]>([]);
  const [duplicateChips, setDuplicateChips] = useState<string[]>([]);
  const [duplicateBibs, setDuplicateBibs] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [dbDuplicateChips, setDbDuplicateChips] = useState<string[]>([]);
  const [dbDuplicateBibs, setDbDuplicateBibs] = useState<string[]>([]);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const downloadInvalidRows = () => {
    if (!invalidRows.length) return;

    const csvRows = [
      ["Row Number", "BIB", "CHIP"],
      ...invalidRows.map((row) => [
        row.rowNumber,
        row.BIB || "",
        row.CHIP || "",
      ]),
    ];

    const csvContent = csvRows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "invalid-rows.csv";
    link.click();

    URL.revokeObjectURL(url);
  };
  const hasUiErrors =
    invalidRows.length > 0 ||
    duplicateChips.length > 0 ||
    duplicateBibs.length > 0;

  const hasDbErrors = dbDuplicateChips.length > 0 || dbDuplicateBibs.length > 0;

  const isBlocked = conflictMode === "block" && (hasUiErrors || hasDbErrors);
  const [errorRows, setErrorRows] = useState<
    { bib: number; chip: string; reason: string }[]
  >([]);

  const downloadDbErrors = () => {
    if (!errorRows.length) return;

    const csvRows = [
      ["BIB", "CHIP", "REASON"],
      ...errorRows.map((row) => [row.bib, row.chip, row.reason]),
    ];

    const csvContent = csvRows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "db-error-rows.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const CHUNK_SIZE = 1000;

  const uploadInChunks = async (rows: any[]) => {
    setUploading(true);
    setProgress(0);

    let totalSuccess = 0;
    let totalFailed = 0;
    let allErrors: any[] = [];

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);

      const res = await secureFetch("/api/admin/chip-mapping/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          rows: chunk,
          mode: conflictMode,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Upload failed");
        setUploading(false);
        return;
      }

      totalSuccess += result.success;
      totalFailed += result.failed;
      allErrors = [...allErrors, ...(result.errors || [])];

      // 🔥 Progress %
      const percent = Math.round(((i + chunk.length) / rows.length) * 100);
      setProgress(percent);
    }

    setReport({ success: totalSuccess, failed: totalFailed });
    setErrorRows(allErrors);
    setUploading(false);

    if (totalFailed === 0) {
      setShowPreview(false);
      onUploadSuccess?.();
    }
  };
  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Bulk Upload</h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload CSV or Excel to assign chips
          </p>
        </div>

        <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
          📂
        </div>
      </div>

      {/* DROP AREA */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file) processFile(file);
        }}
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.click();
          }
        }}
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
        ${
          dragActive
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-600 bg-slate-900 hover:border-indigo-500 hover:bg-slate-800"
        }`}
      >
        <p className="text-sm text-slate-300 font-medium">
          {fileName ? fileName : "Click or drag file here"}
        </p>
        <p className="text-xs text-slate-500 mt-2">Supported: .csv, .xlsx</p>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />
      </div>

      {/* PROGRESS */}
      {uploading && (
        <div className="mt-6">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Processing... {progress}%
          </p>
        </div>
      )}

      {/* REPORT */}
      {report && (
        <div className="mt-6 flex gap-4 text-sm">
          <div className="px-4 py-3 rounded-2xl bg-green-600/10 text-green-400 border border-green-500/30">
            Success: {report.success}
          </div>
          <div className="px-4 py-3 rounded-2xl bg-red-600/10 text-red-400 border border-red-500/30">
            Failed: {report.failed}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* HEADER */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Upload Preview
                </h2>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-green-600/20 text-green-400 border border-green-500/30">
                    Valid: {previewData.length}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                    Invalid: {invalidRows.length}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-red-400 transition"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {isCheckingDb && (
                <div className="flex items-center gap-3 text-indigo-400 text-sm">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  Checking database duplicates...
                </div>
              )}

              {/* FILE ERRORS */}
              {(duplicateChips.length > 0 || duplicateBibs.length > 0) && (
                <div className="p-5 rounded-2xl bg-red-600/5 border border-red-500/30">
                  <p className="text-red-400 font-semibold mb-2">
                    File Validation Errors
                  </p>

                  {duplicateChips.length > 0 && (
                    <p className="text-sm text-slate-300">
                      Duplicate CHIP inside file ({duplicateChips.length})
                    </p>
                  )}

                  {duplicateBibs.length > 0 && (
                    <p className="text-sm text-slate-300">
                      Duplicate BIB inside file ({duplicateBibs.length})
                    </p>
                  )}
                </div>
              )}

              {/* DATABASE ERRORS */}
              {!hasUiErrors &&
                (dbDuplicateChips.length > 0 || dbDuplicateBibs.length > 0) && (
                  <div className="p-5 rounded-2xl bg-orange-600/5 border border-orange-500/30">
                    <p className="text-orange-400 font-semibold mb-2">
                      Database Conflicts
                    </p>

                    {dbDuplicateChips.length > 0 && (
                      <p className="text-sm text-slate-300">
                        CHIP already exists in database (
                        {dbDuplicateChips.length})
                      </p>
                    )}

                    {dbDuplicateBibs.length > 0 && (
                      <p className="text-sm text-slate-300">
                        BIB already assigned in database (
                        {dbDuplicateBibs.length})
                      </p>
                    )}

                    {errorRows.length > 0 && (
                      <button
                        onClick={downloadDbErrors}
                        className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-white text-sm"
                      >
                        Download DB Error Rows
                      </button>
                    )}
                  </div>
                )}

              {/* BACKEND ERROR SUMMARY */}
              {errorRows.length > 0 && (
                <div className="p-5 rounded-2xl bg-red-600/5 border border-red-500/30">
                  <p className="text-red-400 font-semibold">
                    Backend Errors ({errorRows.length})
                  </p>
                  <button
                    onClick={downloadDbErrors}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-white text-sm"
                  >
                    Download Full Error Report
                  </button>
                </div>
              )}

              {/* TABLE WITH ROW HIGHLIGHT PRESERVED */}
              <div className="border border-slate-700 rounded-2xl overflow-hidden">
                <div className="max-h-[350px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-slate-400 sticky top-0">
                      <tr>
                        <th className="p-4 text-left">BIB</th>
                        <th className="p-4 text-left">CHIP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 100).map((row, i) => {
                        const hasError =
                          duplicateChips.includes(row.CHIP) ||
                          dbDuplicateChips.includes(row.CHIP) ||
                          duplicateBibs.includes(row.BIB) ||
                          dbDuplicateBibs.includes(row.BIB);

                        return (
                          <tr
                            key={i}
                            className={`border-t border-slate-700 transition
                            ${
                              hasError
                                ? "bg-red-600/15 text-red-400"
                                : "hover:bg-slate-800/40"
                            }`}
                          >
                            <td className="p-4 font-medium">{row.BIB}</td>
                            <td className="p-4 text-slate-300">{row.CHIP}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INVALID TABLE */}
              {invalidRows.length > 0 && (
                <div className="border border-red-500/30 rounded-2xl overflow-hidden">
                  <div className="bg-red-600/10 text-red-400 px-4 py-3 text-sm font-semibold">
                    Invalid Rows ({invalidRows.length})
                  </div>

                  <div className="max-h-[220px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800 text-slate-400">
                        <tr>
                          <th className="p-3 text-left">Row</th>
                          <th className="p-3 text-left">BIB</th>
                          <th className="p-3 text-left">CHIP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invalidRows.map((row, i) => (
                          <tr key={i} className="border-t border-slate-700">
                            <td className="p-3 text-red-400 font-medium">
                              {row.rowNumber}
                            </td>
                            <td className="p-3">{row.BIB}</td>
                            <td className="p-3">{row.CHIP}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Conflict Mode:</span>
                <select
                  value={conflictMode}
                  onChange={(e) => setConflictMode(e.target.value as any)}
                  className="bg-slate-800 px-3 py-2 rounded-lg text-sm border border-slate-700"
                >
                  <option value="block">Block Upload</option>
                  <option value="skip">Skip Duplicate Rows</option>
                  <option value="override">Override Existing</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm"
                >
                  Cancel
                </button>

                <button
                  disabled={isBlocked || isCheckingDb}
                  onClick={async () => {
                    let rowsToUpload = [...previewData];

                    if (conflictMode === "skip") {
                      rowsToUpload = previewData.filter(
                        (row) =>
                          !duplicateChips.includes(row.CHIP) &&
                          !duplicateBibs.includes(row.BIB) &&
                          !dbDuplicateChips.includes(row.CHIP) &&
                          !dbDuplicateBibs.includes(row.BIB),
                      );
                    }

                    await uploadInChunks(rowsToUpload);
                  }}
                  className={`px-6 py-2 rounded-xl text-white text-sm font-semibold transition
                  ${
                    isBlocked || isCheckingDb
                      ? "bg-slate-600 cursor-not-allowed opacity-70"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                >
                  {isCheckingDb ? "Checking..." : "Confirm Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
