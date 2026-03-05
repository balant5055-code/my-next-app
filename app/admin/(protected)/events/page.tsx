"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { secureFetch } from "@/lib/secureFetch";

import { PieChart, Pie, Cell } from "recharts";
import RecalculateMetricsButton from "@/components/admin/RecalculateMetricsButton";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  XCircleIcon,
  EyeIcon,
  PencilSquareIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface EventItem {
  id: string;
  name: string;
  city: string;
  date: any;
  status: string;
  totalParticipants: number;
  totalRevenue: number;
}

export default function AllEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [pageSize] = useState(10);
  const [cursorStack, setCursorStack] = useState<any[]>([]);
  const [currentCursor, setCurrentCursor] = useState<any>(null);
  const [nextCursor, setNextCursor] = useState<any>(null);

  const fetchEvents = async (cursorOverride?: any) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        status: statusFilter,
        pageSize: pageSize.toString(),
        search,
      });

      if (cursorOverride?.lastValue && cursorOverride?.lastDocId) {
        params.append("lastValue", cursorOverride.lastValue);
        params.append("lastDocId", cursorOverride.lastDocId);
      }

      const res = await secureFetch(`/api/admin/events?${params.toString()}`);

      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();

      setEvents(json.data || []);
      setNextCursor(json.nextCursor || null);
      setCurrentCursor(cursorOverride || null);
    } catch (error) {
      console.error(error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setCursorStack([]);
    setCurrentCursor(null);
    fetchEvents();
  }, [statusFilter, search]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const isNearEvent = (date: any) => {
    if (!date) return false;

    const eventDate = new Date(date);
    const today = new Date();

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 12;
  };
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "live":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

      case "upcoming":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";

      case "completed":
        return "bg-slate-700/30 text-slate-200 border-slate-500/40";

      case "disabled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";

      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  const getRowHighlight = (status: string) => {
    switch (status) {
      case "live":
        return "bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-900 border-l-4 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.25)]";

      case "upcoming":
        return "bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border-l-4 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.25)]";

      case "completed":
        return "bg-gradient-to-r from-slate-800/60 to-slate-900 border-l-4 border-slate-500";

      case "disabled":
        return "bg-gradient-to-r from-rose-900/40 via-slate-900 to-slate-900 border-l-4 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.25)]";

      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live":
        return <BoltIcon className="h-4 w-4 text-emerald-600" />;
      case "upcoming":
        return <ClockIcon className="h-4 w-4 text-sky-600" />;
      case "completed":
        return <CheckCircleIcon className="h-4 w-4 text-slate-600" />;
      case "disabled":
        return <XCircleIcon className="h-4 w-4 text-rose-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-amber-600" />;
    }
  };

  const totalParticipants = useMemo(
    () => events.reduce((sum, e) => sum + (e.totalParticipants || 0), 0),
    [events],
  );

  const totalRevenue = useMemo(
    () => events.reduce((sum, e) => sum + (e.totalRevenue || 0), 0),
    [events],
  );
  const totalEvents = events.length;
  const filtered = events;

  const chartData = filtered
    .slice(-6) // show last 6 events only
    .map((event) => ({
      name: event.name?.slice(0, 12),
      revenue: event.totalRevenue || 0,
      participants: event.totalParticipants || 0,
    }));
  const statusChartData = [
    {
      name: "Live",
      value: events.filter((e) => e.status === "live").length,
    },
    {
      name: "Upcoming",
      value: events.filter((e) => e.status === "upcoming").length,
    },
    {
      name: "Completed",
      value: events.filter((e) => e.status === "completed").length,
    },
    {
      name: "Disabled",
      value: events.filter((e) => e.status === "disabled").length,
    },
  ];
  function AnimatedCounter({ value }: { value: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 800;
      const increment = value / (duration / 16);

      const counter = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(counter);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(counter);
    }, [value]);

    return <span className="text-2xl font-bold text-white">{count}</span>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#111827] dark:to-[#0b1220] text-slate-900 dark:text-slate-100 antialiased p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 backdrop-blur border border-indigo-500/20">
            <CalendarDaysIcon className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-white">
              Event Management
            </h1>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-emerald-400" />
              <span>Manage events, participants & revenue</span>
            </p>
          </div>
        </div>
      </header>

      {/* KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#1e293b] shadow-lg border border-slate-700">
          <div className="p-3 rounded-lg bg-indigo-600/20">
            <CalendarDaysIcon className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <CalendarDaysIcon className="h-4 w-4 text-indigo-400" />
              <span className="font-medium">Total Events</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {totalEvents}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#1e293b] shadow-lg border border-slate-700">
          <div className="p-3 rounded-lg bg-emerald-600/20">
            <UsersIcon className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">Participants</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {totalParticipants}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#1e293b] shadow-lg border border-slate-700">
          <div className="p-3 rounded-lg bg-pink-600/20">
            <CurrencyRupeeIcon className="h-6 w-6 text-pink-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <CurrencyRupeeIcon className="h-4 w-4 text-pink-400" />
              <span className="font-medium">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              ₹ {totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Search */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {["all", "upcoming", "live", "completed", "disabled"].map(
            (status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex items-center gap-2 px-3 py-1 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-[#1e293b] text-slate-300 border border-slate-600 hover:bg-slate-700"
                  }`}
                >
                  {status === "all" && (
                    <CalendarDaysIcon
                      className={`h-4 w-4 ${
                        active ? "text-white" : "text-indigo-400"
                      }`}
                    />
                  )}
                  {status === "upcoming" && (
                    <ClockIcon
                      className={`h-4 w-4 ${
                        active ? "text-white" : "text-sky-400"
                      }`}
                    />
                  )}
                  {status === "live" && (
                    <BoltIcon
                      className={`h-4 w-4 ${
                        active ? "text-white" : "text-emerald-400"
                      }`}
                    />
                  )}
                  {status === "completed" && (
                    <CheckCircleIcon
                      className={`h-4 w-4 ${
                        active ? "text-white" : "text-slate-400"
                      }`}
                    />
                  )}
                  {status === "disabled" && (
                    <XCircleIcon
                      className={`h-4 w-4 ${
                        active ? "text-white" : "text-rose-400"
                      }`}
                    />
                  )}
                  <span className="capitalize">{status}</span>
                </button>
              );
            },
          )}
        </div>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, city or id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-72 rounded-lg bg-[#1e293b] text-sm text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </section>

      {/* Table */}
      <section
        className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950
rounded-2xl
shadow-[0_15px_40px_rgba(79,70,229,0.15)]
overflow-hidden
border border-indigo-500/20
"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <h2 className="text-lg  text-white flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-indigo-400" />
              All Events
            </h2>
            <p className="text-sm text-slate-400">
              Showing{" "}
              <span className="font-medium text-white">{filtered.length}</span>{" "}
              of <span className="font-medium text-white">{totalEvents}</span>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0f172a] text-slate-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Event</th>
                <th className="px-6 py-3 text-left">City</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Participants</th>
                <th className="px-6 py-3 text-left">Revenue</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500">
                    Loading events...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500">
                    No events found
                  </td>
                </tr>
              ) : (
                filtered.map((event) => {
                  const nearEvent = isNearEvent(event.date);

                  return (
                    <tr
                      key={event.id}
                      className={`
            transition-colors duration-200
            hover:bg-slate-800/50
           ${nearEvent ? "bg-violet-900/20 border-l-4 border-violet-500" : ""}

          `}
                    >
                      {/* EVENT NAME */}
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center gap-4">
                          <div
                            className={`
                  w-11 h-11 rounded-lg flex items-center justify-center
                  ${nearEvent ? "bg-amber-500/20" : "bg-slate-700/40"}
                `}
                          >
                            <CalendarDaysIcon
                              className={`h-5 w-5 ${
                                nearEvent ? "text-amber-400" : "text-indigo-400"
                              }`}
                            />
                          </div>

                          <div>
                            <div className="text-white font-medium">
                              {event.name}
                            </div>

                            <div className="text-xs text-slate-500">
                              ID: {event.id}
                            </div>

                            {nearEvent && (
                              <span className="inline-block mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Happening Soon
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CITY */}
                      <td className="px-8 py-5 text-slate-300 align-middle">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-rose-400" />
                          {event.city || "-"}
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="px-8 py-5 text-slate-300 align-middle">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-sky-400" />
                          {formatDate(event.date)}
                        </div>
                      </td>

                      {/* PARTICIPANTS */}
                      <td className="px-8 py-5 text-white font-medium align-middle">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-emerald-400" />
                          {event.totalParticipants || 0}
                        </div>
                      </td>

                      {/* REVENUE */}
                      <td className="px-8 py-5 text-white font-medium align-middle">
                        <div className="flex items-center gap-2">
                          <CurrencyRupeeIcon className="h-4 w-4 text-pink-400" />
                          ₹ {event.totalRevenue?.toLocaleString() || 0}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center">
                          <div
                            className={`
        flex items-center gap-2
        px-3.5 py-1.5
        rounded-lg
        text-xs font-semibold tracking-wide
        backdrop-blur-sm
        border
        ${getStatusStyle(event.status)}
      `}
                          >
                            <span className="flex items-center">
                              {getStatusIcon(event.status)}
                            </span>
                            <span className="capitalize">{event.status}</span>
                          </div>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-8 py-5 align-middle">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/events/${event.id}/overview`}
                            rel="noopener noreferrer"
                            className="p-2 rounded-md hover:bg-slate-700 text-sky-400 transition"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>

                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="p-2 rounded-md hover:bg-slate-700 text-orange-400 transition"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </Link>

                          <Link
                            href={`/admin/registrations?eventId=${event.id}`}
                            className="p-2 rounded-md hover:bg-slate-700 text-purple-400 transition"
                          >
                            <UserGroupIcon className="h-5 w-5" />
                          </Link>

                          <RecalculateMetricsButton
                            eventId={event.id}
                            onSuccess={fetchEvents}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-sm text-slate-400 flex items-center gap-6">
            <span>{totalEvents} events</span>
            <span>{totalParticipants} participants</span>
            <span>₹ {totalRevenue.toLocaleString()}</span>
          </div>

          <div className="text-sm text-slate-500">
            Premium · Professional · Dark Mode
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
            <span>Showing {events.length} events</span>

            <div className="flex gap-2">
              {/* PREVIOUS */}
              <button
                disabled={cursorStack.length === 0}
                onClick={() => {
                  const newStack = [...cursorStack];
                  const prevCursor = newStack.pop();
                  setCursorStack(newStack);
                  fetchEvents(prevCursor);
                }}
                className="px-3 py-1 rounded bg-slate-700 disabled:opacity-50"
              >
                Previous
              </button>

              {/* NEXT */}
              <button
                disabled={!nextCursor}
                onClick={() => {
                  setCursorStack((prev) => [...prev, currentCursor]);
                  fetchEvents(nextCursor);
                }}
                className="px-3 py-1 rounded bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
