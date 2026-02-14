"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";


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
  date: string;
  city: string;
  registrationStatus: "open" | "closed";
}

export default function AdminDashboard() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all",
  );



  /* ---------- FETCH EVENTS ---------- */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, "events"));

        const data: EventItem[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<EventItem, "id">),
        }));

        const sorted = data.sort(
          (a, b) => getDateValue(a.date) - getDateValue(b.date),
        );

        setEvents(sorted);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  const getDateValue = (date: any) => {
    if (!date) return Infinity;

    // Firestore Timestamp
    if (date.seconds) {
      return new Date(date.seconds * 1000).getTime();
    }

    // yyyy-mm-dd (HTML date input)
    if (typeof date === "string" && date.includes("-")) {
      const parts = date.split("-");
      if (parts[0].length === 4) {
        // yyyy-mm-dd
        return new Date(date).getTime();
      }
      // dd-mm-yyyy
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }

    return new Date(date).getTime();
  };

  /* ---------- DELETE EVENT ---------- */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    await deleteDoc(doc(db, "events", id));
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  /* ---------- FILTER + SEARCH ---------- */
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.city.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || e.registrationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  return (

    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">Manage all events from one place</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/create-event"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5
                       text-white font-semibold shadow-md hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5" />
            Create Event
          </Link>

          <button
            onClick={() => {
              // 🔐 Clear admin auth cookie (prevents middleware flicker)
              document.cookie = "admin-auth=; Max-Age=0; path=/";

              // 🔓 Firebase logout
              auth.signOut();

              // 🔁 Redirect to login
              router.push("/admin/login");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5
             text-white font-semibold hover:bg-red-700 transition"
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
          value={events.length.toString()}
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

      {/* EVENTS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* TABLE CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">All Events</h2>

          <div className="flex gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search event or city"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border text-sm"
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

        {/* TABLE */}
        {loading ? (
          <p className="text-gray-500">Loading events…</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 text-left">Event</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">City</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{e.name}</td>
                    <td>{e.date}</td>
                    <td>{e.city}</td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            e.registrationStatus === "open"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                      >
                        {e.registrationStatus}
                      </span>
                    </td>
                    <td className="space-x-3">
                      <Link
                        href={`/admin/events/${e.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

  );
}

/* ---------- COMPONENT ---------- */

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
      whileHover={{ scale: 1.03 }}
      className={`rounded-2xl p-6 text-white shadow-lg bg-gradient-to-r ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
          <div className="h-6 w-6">{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
