"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

import {
  PowerIcon,
  CalendarDaysIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

/* ---------- TYPES ---------- */
interface EventItem {
  id: string;
  name: string;
  date: any;
  city: string;
  registrationStatus: "open" | "closed";
}

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all",
  );
  const [cursor, setCursor] = useState<string | null>(null);

  const [sorting, setSorting] = useState<any[]>([]);

  const [events, setEvents] = useState<EventItem[]>([]);

  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const totalPages = Math.ceil(total / pageSize);

  /* ---------- FETCH FROM API ---------- */
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      const res = await fetch(
        `/api/events?pageSize=${pageSize}&pageIndex=${pageIndex}`,
      );

      const json = await res.json();

      setEvents(json.data || []);
      setTotal(json.total || 0);
      setLoading(false);
    };

    fetchEvents();
  }, [pageIndex, pageSize]);

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    await deleteDoc(doc(db, "events", id));
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  /* ---------- TABLE COLUMNS ---------- */
  const columns: ColumnDef<EventItem>[] = [
    {
      id: "serial",
      header: "S.No",
      cell: ({ row }) => pageIndex * pageSize + row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Event",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.date;
        if (!date) return "-";

        if (date?.seconds) {
          return new Date(date.seconds * 1000).toLocaleDateString();
        }

        return new Date(date).toLocaleDateString();
      },
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "registrationStatus",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.original.registrationStatus === "open"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.original.registrationStatus}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: events,
    columns,
    state: { sorting },
    manualSorting: true,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage events, registrations & payments
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/create-event"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-semibold shadow-lg hover:scale-[1.03] transition"
          >
            <PlusIcon className="h-5 w-5" />
            Create Event
          </Link>

          <button
            onClick={() => {
              document.cookie = "admin-auth=; Max-Age=0; path=/";
              auth.signOut();
              router.push("/admin/login");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-white font-semibold shadow-md hover:bg-red-700 transition"
          >
            <PowerIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Events"
          value={total.toString()}
          icon={<CalendarDaysIcon />}
          color="from-blue-500 to-blue-600"
        />

        <StatCard
          title="Open Events"
          value={events
            .filter((e) => e.registrationStatus === "open")
            .length.toString()}
          icon={<UsersIcon />}
          color="from-green-500 to-green-600"
        />

        <StatCard
          title="Closed Events"
          value={events
            .filter((e) => e.registrationStatus === "closed")
            .length.toString()}
          icon={<CurrencyRupeeIcon />}
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">All Events</h2>

          <div className="flex gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search event..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[500px] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-6 py-4 text-left font-semibold cursor-pointer select-none hover:text-blue-600 transition"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: " ▲",
                        desc: " ▼",
                      }[header.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    Loading events...
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}

                    <td className="px-6 py-4 space-x-3">
                      <Link
                        href={`/admin/events/${row.original.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </Link>

                      <Link
                        href={`/admin/events/${row.original.id}/bulk-upload`}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Bulk Upload
                      </Link>

                      <button
                        onClick={() => handleDelete(row.original.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="text-sm text-gray-500 mt-4 px-4">
            Showing{" "}
            <span className="font-medium">{pageIndex * pageSize + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min((pageIndex + 1) * pageSize, total)}
            </span>{" "}
            of <span className="font-medium">{total}</span> events
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 mb-6 px-4">
            {/* Rows per page */}
            <div className="flex items-center gap-2 text-sm">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageIndex(0);
                }}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
              <button
                disabled={pageIndex === 0}
                onClick={() => setPageIndex((prev) => prev - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPageIndex(i)}
                  className={`px-3 py-1 rounded border ${
                    pageIndex === i ? "bg-blue-600 text-white" : "bg-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={pageIndex + 1 >= totalPages}
                onClick={() => setPageIndex((prev) => prev + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- STAT CARD ---------- */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl bg-gradient-to-br ${color}`}
    >
      <div className="absolute top-0 right-0 opacity-10 text-7xl">{icon}</div>

      <div className="relative z-10">
        <p className="text-sm opacity-80">{title}</p>
        <p className="text-4xl font-bold mt-2">{value}</p>
      </div>
    </motion.div>
  );
}
