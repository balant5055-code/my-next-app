"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";
import { secureFetch } from "@/lib/secureFetch";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // your client firebase config

export default function BulkUploadPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [progressData, setProgressData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  useEffect(() => {
    if (!jobId) return;

    const unsub = onSnapshot(doc(db, "upload_history", jobId), (snap) => {
      const data = snap.data();
      if (!data) return;

      setProgressData({
        processed: data.processed,
        total: data.totalRows,
        progress: data.progress,
      });
    });

    return () => unsub();
  }, [jobId]);
  /* CLEAR FILE */

  const handleClearFile = () => {
    setRows([]);
    setResult(null);
    setProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* PROCESS EXCEL */

  const processFile = (file: File) => {
    if (!file.name.endsWith(".xlsx")) {
      alert("Please upload a valid Excel (.xlsx) file");
      return;
    }

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length > 10000) {
        alert("Excel file cannot exceed 10,000 rows.");
        return;
      }

      setRows(jsonData as any[]);
      setResult(null);
    };

    reader.readAsBinaryString(file);
  };

  /* FILE INPUT */

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  /* DRAG DROP */

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  /* UPLOAD */

  const handleUpload = async () => {
    if (!rows.length) return;

    setLoading(true);
    setResult(null);
    setProgressData(null);

    try {
      const res = await secureFetch(
        `/api/admin/events/${eventId}/bulk-upload`,
        {
          method: "POST",
          body: JSON.stringify({ rows }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await res.json();

      setJobId(data.jobId);
      setResult(data);

      if (data.success) {
        setRows([]);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  /* DOWNLOAD FAILED ROWS EXCEL */

  const downloadFailedRows = () => {
    if (!result?.skipped?.length) return;

    const worksheet = XLSX.utils.json_to_sheet(result.skipped);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Rows");

    XLSX.writeFile(workbook, "failed_rows.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-xl font-semibold text-white">
          Bulk Offline Upload
        </h1>
        <p className="text-sm text-slate-400">
          Upload participants via Excel (.xlsx)
        </p>
      </div>

      {/* UPLOAD CARD */}

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        {/* DRAG AREA */}

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 transition"
        >
          <p className="text-slate-400 text-sm">
            Drag & Drop Excel file here or Click to Upload
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          className="hidden"
        />

        {rows.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>{rows.length} rows detected</span>

            <button
              onClick={handleClearFile}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Remove File
            </button>
          </div>
        )}

        {/* PROGRESS BAR */}
        {loading && !progressData && (
          <div className="text-orange-400 text-sm">Preparing upload...</div>
        )}
        {progressData && (
          <div className="space-y-2">
            <div className="text-orange-400 text-sm">
              Processing {progressData.processed} / {progressData.total} runners
            </div>

            <div className="w-full bg-slate-700 rounded h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-2 transition-all"
                style={{ width: `${progressData.progress}%` }}
              />
            </div>
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={loading || rows.length === 0}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
        >
          {loading ? "Uploading..." : "Upload Participants"}
        </button>
      </div>

      {/* PREVIEW */}

      {rows.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 overflow-x-auto">
          <h2 className="text-sm font-semibold text-white mb-3">
            Preview (First 5 Rows)
          </h2>

          <table className="min-w-full text-sm text-slate-300">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                {Object.keys(rows[0]).map((key) => (
                  <th key={key} className="px-3 py-2 text-left">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.slice(0, 5).map((row, i) => (
                <tr key={i} className="border-t border-slate-700">
                  {Object.values(row).map((val: any, idx) => (
                    <td key={idx} className="px-3 py-2">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RESULT */}

      {result && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
          <div className="text-green-400 text-sm">
            Inserted: {result.inserted || 0}
          </div>

          <div className="text-red-400 text-sm">
            Skipped: {result.skipped?.length || 0}
          </div>

          {(result.skipped?.length || 0) > 0 && (
            <div className="space-y-2">
              <button
                onClick={downloadFailedRows}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded"
              >
                Download Failed Rows Excel
              </button>

              <div className="max-h-40 overflow-y-auto text-xs">
                {result.skipped.map((s: any, i: number) => (
                  <div key={i}>
                    Row {s.row}: {s.reason}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
