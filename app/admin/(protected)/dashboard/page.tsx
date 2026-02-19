"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";

import { motion } from "framer-motion";
import { secureFetch } from "@/lib/secureFetch";
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

      const res = await secureFetch(
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

    const res = await secureFetch("/api/admin/delete-event", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

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
          <button
            onClick={async () => {
              await secureFetch("/api/admin/logout", {
                method: "POST",
              });

              await auth.signOut();

              router.replace("/admin/login");
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
