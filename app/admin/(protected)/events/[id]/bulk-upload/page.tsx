"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function BulkUploadPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    uploaded: number;
    failed: number;
    total: number;
  } | null>(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setIsUploading(true);
    setProgress(0);
    setResult(null);

    // 🔥 Premium smooth fake progress
    const fakeProgress = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 5;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", eventId);

      const res = await fetch("/api/upload-offline", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      clearInterval(fakeProgress);
      setProgress(100);
      setIsUploading(false);

      if (data.success) {
        setResult({
          uploaded: data.uploaded,
          failed: data.failed,
          total: data.total,
        });

        // 🔥 Auto-download failed Excel if exists
        if (data.failedFile) {
          const link = document.createElement("a");
          link.href =
            "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
            data.failedFile;
          link.download = "Failed_Rows.xlsx";
          link.click();
        }
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      clearInterval(fakeProgress);
      setIsUploading(false);
      alert("Upload error occurred");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">
        Bulk Upload Participants
      </h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        {/* FILE INPUT */}
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded w-full"
        />

        {/* BUTTON */}
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`px-6 py-2 rounded-lg text-white transition ${
            isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload Excel"}
        </button>

        {/* PREMIUM PROGRESS BAR */}
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Uploading... {progress}%
            </p>
          </div>
        )}

        {/* RESULT BOX */}
        {result && (
          <div className="bg-gray-50 p-4 rounded-lg mt-4 border">
            <p className="font-semibold">Upload Summary</p>
            <p>Total: {result.total}</p>
            <p className="text-green-600">
              Uploaded: {result.uploaded}
            </p>
            <p className="text-red-600">
              Failed: {result.failed}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
