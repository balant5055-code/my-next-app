"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { secureFetch } from "@/lib/secureFetch";

export default function UploadFailureDetails() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [failures, setFailures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFailures = async () => {
      const res = await secureFetch(`/api/upload-failures?jobId=${jobId}`);
      const result = await res.json();

      if (result.success) {
        setFailures(result.data);
      }

      setLoading(false);
    };

    fetchFailures();
  }, [jobId]);

  if (loading)
    return <div className="py-20 text-center">Loading failures…</div>;

  if (!failures.length)
    return (
      <div className="py-20 text-center text-gray-500">
        No failures found for this upload.
      </div>
    );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Upload Failures</h1>

      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Row</th>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Phone</th>
              <th className="px-6 py-4 text-left">Reason</th>
            </tr>
          </thead>

          <tbody>
            {failures.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="px-6 py-4">{f.rowNumber}</td>
                <td className="px-6 py-4">
                  {f.rowData?.firstName} {f.rowData?.lastName}
                </td>
                <td className="px-6 py-4">{f.rowData?.phone}</td>
                <td className="px-6 py-4 text-red-600">{f.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
