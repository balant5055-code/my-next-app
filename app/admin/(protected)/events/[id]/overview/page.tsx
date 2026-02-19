"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { secureFetch } from "@/lib/secureFetch";
import Breadcrumb from "@/components/admin/Breadcrumb";
import Link from "next/link";
import EventControlCenter from "@/components/admin/EventControlCenter";
import CategoryControlCard from "@/components/admin/events/CategoryControlCard";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface EventData {
  id: string;
  name: string;
  slug: string;
  city: string;
  venue: string;
  date: string;
  status: string;
  bannerURL: string;
  eventType: string;
  description: string;
  gateOpen: string;
  raceStart: string;
  maxParticipants: number;
  categories: {
    id: string;
    title: string;
    price: number;
    maxSeats: number;
    bookedSeats: number;
    nextBib: number;
    bibStart: number;
    bibEnd: number;
    distance: string;
    status?: "open" | "closed";
  }[];
  metrics: {
    totalParticipants: number;
    totalRevenue: number;
    totalCapacity: number;
    occupancyRate: number;
  };

  organizer: {
    name: string;
    email: string;
    phone: string;
    supportEmail: string;
  };

  registration: {
    start: {
      seconds: number;
    };
    end: {
      seconds: number;
    };
    status: "open" | "paused" | "closed";
  };

  createdAt?: {
    seconds: number;
  };

  categoryBreakdown: {
    name: string;
    participants: number;
    revenue: number;
  }[];
}

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
export default function EventOverviewPage() {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null,
  );

  const params = useParams();
  const eventId = params?.id as string;
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, "events", eventId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setEventData(null);
          setLoading(false);
          return;
        }
        const data = snapshot.data();
        setEventData({
          id: snapshot.id,
          name: data.name || "",
          slug: data.slug || "",
          city: data.city || "",
          venue: data.venue || "",
          date: data.date || "",
          status: data.status || "",
          bannerURL: data.bannerURL || "",
          eventType: data.eventType || "",
          description: data.description || "",
          gateOpen: data.gateOpen || "",
          raceStart: data.raceStart || "",
          maxParticipants: data.maxParticipants || 0,
          categories: data.categories || [],
          organizer: data.organizer || {
            name: "",
            email: "",
            phone: "",
            supportEmail: "",
          },
          registration: data.registration || {
            start: { seconds: 0 },
            end: { seconds: 0 },
            status: "closed",
          },
          createdAt: data.createdAt,
          metrics: data.metrics || {
            totalParticipants: 0,
            totalRevenue: 0,
            totalCapacity: 0,
            occupancyRate: 0,
          },
          categoryBreakdown: (data.categories || []).map((cat: any) => ({
            name: cat.title,
            participants: cat.bookedSeats || 0,
            revenue: (cat.bookedSeats || 0) * (cat.price || 0),
          })),
        });
        setLoading(false);
      },
      (error) => {
        console.error("Realtime Event Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [eventId]);

  if (loading) {
    return <div className="p-10 text-slate-400">Loading event overview...</div>;
  }

  if (!eventData) {
    return <div className="p-10 text-rose-400">Event not found.</div>;
  }
  /* ================= REAL DB CATEGORY METRICS ================= */

  /* ================= REAL-TIME DERIVED METRICS ================= */

  const categories = eventData.categories || [];

  const totalParticipants = categories.reduce(
    (sum, cat) => sum + (cat.bookedSeats || 0),
    0,
  );

  const totalRevenue = categories.reduce(
    (sum, cat) => sum + (cat.bookedSeats || 0) * (cat.price || 0),
    0,
  );

  const revenuePerParticipant =
    totalParticipants > 0 ? Math.round(totalRevenue / totalParticipants) : 0;

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (cat) => cat.status === "open",
  ).length;

  const closedCategories = categories.filter(
    (cat) => cat.status === "closed",
  ).length;

  const eventDate = new Date(eventData.date);
  const today = new Date();

  const diffDays = Math.ceil(
    (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const capacityPercent = eventData.maxParticipants
    ? Math.round(
        (eventData.metrics.totalParticipants / eventData.maxParticipants) * 100,
      )
    : 0;
  const refreshEvent = async () => {
    try {
      const res = await secureFetch(`/api/admin/events/${eventId}/overview`);
      const json = await res.json();
      setEventData(json.data);
    } catch {
      console.error("Failed to refresh event");
    }
  };

  return (
    <div className="min-h-screen text-slate-100">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Events", href: "/admin/events" },
          { label: eventData.name },
          { label: "Overview" },
        ]}
      />

      <div className="space-y-10">
        {/* ================= ENTERPRISE EVENT HEADER ================= */}
        <section className="relative rounded-2xl overflow-hidden border border-slate-700 bg-[#0f172a]">
          {/* Banner */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${eventData.bannerURL})` }}
          />

          <div className="relative p-8 backdrop-blur-md space-y-8">
            {/* ================= TOP ROW ================= */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
              <div className="space-y-4">
                {/* TITLE */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    {eventData.name}
                  </h1>

                  <span className="px-3 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wide">
                    {eventData.eventType}
                  </span>

                  <span className="px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-600">
                    {eventData.slug}
                  </span>
                </div>

                {/* BASIC META */}
                <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                  <span>📍 {eventData.city}</span>
                  <span>
                    📅 {new Date(eventData.date).toLocaleDateString("en-IN")}
                  </span>
                  <span>🏁 Start: {eventData.raceStart}</span>
                </div>
              </div>
            </div>

            {/* ================= SECOND ROW: INTELLIGENCE STRIP ================= */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 text-sm">
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs uppercase">Status</p>
                <p className="text-white d capitalize">{eventData.status}</p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs uppercase">Participants</p>
                <p className="text-white d">
                  {eventData.metrics.totalParticipants} /{" "}
                  {eventData.maxParticipants}
                </p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs uppercase">Revenue</p>
                <p className="text-white d">
                  ₹ {eventData.metrics.totalRevenue?.toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs uppercase">Organizer</p>
                <p className="text-white d">{eventData.organizer?.name}</p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs uppercase">Registration</p>
                <p className="text-white d">
                  {eventData.registration?.start?.seconds
                    ? new Date(
                        eventData.registration.start.seconds * 1000,
                      ).toLocaleDateString("en-IN")
                    : "-"}
                  {" - "}
                  {eventData.registration?.end?.seconds
                    ? new Date(
                        eventData.registration.end.seconds * 1000,
                      ).toLocaleDateString("en-IN")
                    : "-"}
                </p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs uppercase">Created</p>
                <p className="text-white d">
                  {eventData.createdAt
                    ? new Date(
                        eventData.createdAt.seconds * 1000,
                      ).toLocaleDateString("en-IN")
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= EXECUTIVE KPI INTELLIGENCE ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* ================= KPI CARD WRAPPER STYLE ================= */}
          {[
            {
              title: "Total Participants",
              value: totalParticipants || 0,
              subtitle: "Active registrations",
              color: "emerald",
            },
            {
              title: "Total Revenue",
              value: `₹ ${totalRevenue?.toLocaleString() || 0}`,
              subtitle: "Gross earnings",
              color: "indigo",
            },
            {
              title: "Revenue / Participant",
              value: `₹ ${
                eventData.metrics.totalParticipants
                  ? Math.round(revenuePerParticipant)
                  : 0
              }`,
              subtitle: "Average ticket value",
              color: "pink",
            },
          ].map((card, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-between bg-[#1e293b] border border-slate-700 rounded-2xl p-6 min-h-[160px] hover:border-slate-600 transition-all duration-300"
            >
              {/* Soft Glow */}
              <div
                className={`absolute -top-10 -right-10 w-28 h-28 bg-${card.color}-500/10 rounded-full blur-3xl`}
              ></div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  {card.title}
                </p>

                <p className="text-3xl font-bold text-white tracking-tight">
                  {card.value}
                </p>
              </div>

              <p className={`text-xs mt-4 text-${card.color}-400`}>
                {card.subtitle}
              </p>
            </div>
          ))}

          {/* ================= CATEGORY CARD ================= */}
          <div className="relative flex flex-col justify-between bg-[#1e293b] border border-slate-700 rounded-2xl p-6 min-h-[160px] hover:border-slate-600 transition-all duration-300">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-3xl"></div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 uppercase tracking-wide">
                Categories
              </p>

              <p className="text-3xl font-bold text-white tracking-tight">
                {totalCategories}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {activeCategories} Active
              </span>

              {closedCategories > 0 && (
                <span className="px-2 py-1 text-xs rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {closedCategories} Closed
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ================= CATEGORY CONTROL ENGINE ================= */}
        <section className="space-y-6">
          <h2 className="text-lg d text-white">Category Control Engine</h2>

          <div
            className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2
 gap-6"
          >
            {eventData.categories.map((cat) => (
              <CategoryControlCard
                key={cat.id}
                eventId={eventId}
                category={cat}
                onRefresh={refreshEvent}
              />
            ))}
          </div>
        </section>
        <EventControlCenter
          eventId={eventData.id}
          currentStatus={eventData.status}
          currentRegistrationStatus={eventData.registration?.status}
          onStatusChange={(newStatus) =>
            setEventData((prev) =>
              prev ? { ...prev, status: newStatus } : prev,
            )
          }
        />
      </div>
    </div>
  );
}
