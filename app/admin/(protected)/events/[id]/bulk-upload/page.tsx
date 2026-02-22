"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";
import { secureFetch } from "@/lib/secureFetch";

export default function BulkUploadPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  /* ---------------- EXCEL PARSE ---------------- */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setRows(jsonData as any[]);
    };

    reader.readAsBinaryString(file);
  };

  /* ---------------- UPLOAD ---------------- */
  const handleUpload = async () => {
    if (!rows.length) return;

    setLoading(true);
    setResult(null);

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
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">
          Bulk Offline Upload
        </h1>
        <p className="text-sm text-slate-400">
          Upload participants via Excel (.xlsx)
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          className="text-sm text-slate-300"
        />

        {rows.length > 0 && (
          <div className="text-sm text-slate-400">
            {rows.length} rows detected
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

      {result && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2">
          <div className="text-green-400 text-sm">
            Inserted: {result.inserted || 0}
          </div>

          {result.skipped?.length > 0 && (
            <div className="text-red-400 text-sm">
              Skipped Rows: {result.skipped.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
