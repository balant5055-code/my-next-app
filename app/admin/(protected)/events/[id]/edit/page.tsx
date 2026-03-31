"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EventForm from "@/components/admin/EventForm";

/* ================= HELPERS ================= */

function toDate(ts: any) {
  if (!ts) return "";

  // Firestore timestamp
  if (ts._seconds) {
    return new Date(ts._seconds * 1000).toISOString().split("T")[0];
  }

  // already string
  if (typeof ts === "string") return ts;

  return "";
}

/* ================= PAGE ================= */

export default function EditEventPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const res = await fetch(`/api/admin/events/${id}`);
      const json = await res.json();

      /* ================= NORMALIZE ================= */

      const e: any = JSON.parse(JSON.stringify(json));

      /* 🔥 DATE */
      e.date = toDate(e.date);

      /* 🔥 REGISTRATION */
      e.registration = {
        ...e.registration,
        start: toDate(e.registration?.start),
        end: toDate(e.registration?.end),
      };

      /* 🔥 ORGANIZER */
      e.organizer = {
        name: e.organizer?.name || "",
        phone: e.organizer?.phone || "",
        email: e.organizer?.email || "",
        supportEmail: e.organizer?.supportEmail || "",
      };

      /* 🔥 ARRAYS SAFE */
      if (!Array.isArray(e.categories)) e.categories = [];
      if (!Array.isArray(e.routeStops)) e.routeStops = [];

      /* 🔥 KIT DISTRIBUTION */
      if (Array.isArray(e.kitDistribution)) {
        // ok
      } else if (e.kitDistribution) {
        e.kitDistribution = [e.kitDistribution];
      } else {
        e.kitDistribution = [];
      }

      /* 🔥 INCLUSIONS (IMPORTANT) */
      if (!Array.isArray(e.inclusions)) {
        e.inclusions = [];
      }

      /* 🔥 SOCIAL */
      if (!e.socialLinks) {
        e.socialLinks = {};
      }

      /* 🔥 DEFAULT SAFE FIELDS */
      e.name = e.name || "";
      e.slug = e.slug || "";
      e.city = e.city || "";
      e.venue = e.venue || "";
      e.mapLink = e.mapLink || "";
      e.raceStart = e.raceStart || "";

      setData(e);
    };

    load();
  }, [id]);

  if (!data) {
    return <div className="p-10 text-white">Loading event data...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <EventForm mode="edit" initialData={data} eventId={id as string} />
    </div>
  );
}
