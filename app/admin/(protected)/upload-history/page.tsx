"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UploadJob = {
  id: string;
  eventName: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
  status: string;
  startedAt: string;
};
import { secureFetch } from "@/lib/secureFetch";

export default function UploadHistoryPage() {
  const router = useRouter();

  const [data, setData] = useState<UploadJob[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortField, setSortField] = useState("startedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
      status,
      sortField,
      sortOrder,
    });

    const res = await secureFetch(`/api/upload-history?${params}`);
    const result = await res.json();

    if (result.success) {
      setData(result.data);
      setTotalPages(result.totalPages);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, search, status, sortField, sortOrder]);

  const columns: ColumnDef<UploadJob>[] = [
    {
      header: "Event",
      accessorFn: (row) => row.eventName,

      id: "eventName",
    },
    {
      header: "Total",
      accessorFn: (row) => row.totalRows,
      id: "totalRows",
    },
    {
      header: "Success",
      accessorFn: (row) => row.successCount,
      id: "successCount",
      cell: (info) => (
        <span className="text-green-600 font-semibold">
          {info.getValue<number>()}
        </span>
      ),
    },
    {
      header: "Failed",
      accessorFn: (row) => row.failedCount,
      id: "failedCount",
      cell: (info) => (
        <span className="text-red-600 font-semibold">
          {info.getValue<number>()}
        </span>
      ),
    },
    {
      header: "Status",
      accessorFn: (row) => row.status,
      id: "status",
      cell: (info) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            info.getValue() === "completed"
              ? "bg-green-100 text-green-700"
              : info.getValue() === "processing"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {info.getValue<string>()}
        </span>
      ),
    },
    {
      header: "Uploaded At",
      accessorFn: (row) => row.startedAt,
      id: "startedAt",
      cell: (info) =>
        info.getValue()
          ? new Date(info.getValue<string>()).toLocaleString()
          : "-",
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) =>
        row.original.failedCount > 0 ? (
          <button
            onClick={() =>
              router.push(`/admin/upload-history/${row.original.id}`)
            }
            className="text-red-600 hover:underline"
          >
            View Failures
          </button>
        ) : (
          <span className="text-gray-400 text-xs">No Failures</span>
        ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload History</h1>
        <p className="text-gray-500">Monitor all bulk Excel uploads</p>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          placeholder="Search Event ID..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border px-4 py-2 rounded-lg"
        />

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border px-4 py-2 rounded-lg"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>

        <span className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left cursor-pointer select-none"
                    onClick={() => {
                      const field = header.column.id;
                      setSortField(field);
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}

                    {sortField === header.column.id && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-400"
                >
                  No uploads found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-4 py-2 rounded-lg text-sm ${
              page === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
