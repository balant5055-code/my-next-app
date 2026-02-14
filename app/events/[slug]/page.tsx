"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

/* ================= TYPES ================= */

interface Category {
  title: string;
  price: string;
  minAge: string;
  maxAge: string;
  distance: string;
}

interface EventData {
  id: string; // doc id only
  name: string;
  slug: string;
  date: string;
  gateOpen: string;
  raceStart: string;
  venue: string;
  city: string;
  mapLink: string;
  registrationStart: string;
  registrationEnd: string;
  maxParticipants: string;
  description: string;
  bannerURL: string;
  categories: Category[];
}

/* ================= PAGE ================= */

export default function EventPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullAbout, setShowFullAbout] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const q = query(collection(db, "events"), where("slug", "==", slug));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const data = docSnap.data() as Omit<EventData, "id">;

          setEvent({
            id: docSnap.id,
            ...data,
          });
        }
      } catch (err) {
        console.error("Error loading event", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
        <p className="animate-pulse text-lg">Loading event…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1220] text-white">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <button
          onClick={() => router.push("/events")}
          className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-black"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <main className="bg-[#0B1220] text-slate-100">
      {/* ================= HERO ================= */}
      <section className="relative h-[85vh]">
        <img
          src={event.bannerURL}
          alt={event.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/70 to-transparent" />

        {/* TOP BAR */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 pt-6 flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest text-orange-400">
            Upcoming Event
          </span>

          <button
            onClick={() => router.push(`/events/${event.slug}/register`)}
            className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-black hover:bg-orange-400 transition"
          >
            Register Now
          </button>
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto h-full flex items-end px-6 pb-20">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl">
              {event.name}
            </h1>

            <div className="mt-8 flex flex-wrap gap-4">
              {/* DATE */}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <CalendarDaysIcon className="h-5 w-5 text-orange-400" />
                {event.date}
              </span>

              {/* LOCATION */}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <MapPinIcon className="h-5 w-5 text-orange-400" />
                {event.venue}, {event.city}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INFO STRIP ================= */}
      <section className="border-t border-white/10 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <Info label="Gate Opens" value={event.gateOpen} />
          <Info label="Race Starts" value={event.raceStart} />
          <Info label="Registration Ends" value={event.registrationEnd} />
          <Info
            label="Participants"
            value={event.maxParticipants || "Unlimited"}
          />
        </div>
      </section>
      {/* ================= CATEGORIES ================= */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <h2 className="text-3xl font-bold mb-10 text-white">Race Categories</h2>

        <div className="space-y-6">
          {event.categories.map((cat, i) => (
            <div
              key={i}
              className="flex flex-col flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6"
            >
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {cat.title}
                </h3>
                <p className="text-sm text-slate-400">
                  Distance: {cat.distance} • Age {cat.minAge}–{cat.maxAge}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-2xl font-bold text-orange-400">
                  ₹ {cat.price}
                </span>
                <button
                  onClick={() =>
                    router.push(
                      `/events/${event.slug}/register?category=${encodeURIComponent(cat.title)}`,
                    )
                  }
                  className="rounded-full border border-orange-500 px-6 py-2 text-sm text-orange-400"
                >
                  Register
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-20">
        {/* ABOUT */}
        {/* ABOUT */}
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold mb-6 text-white">
            About This Event
          </h2>

          <div className="relative">
            <div
              className={`
        text-slate-300
        leading-relaxed
        whitespace-pre-line
        transition-all
        duration-500
        ${showFullAbout ? "max-h-full" : "max-h-[260px] overflow-hidden"}
      `}
            >
              {event.description}
            </div>

            {/* FADE EFFECT */}
            {!showFullAbout && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0B1220] to-transparent" />
            )}
          </div>

          {/* TOGGLE */}
          <button
            onClick={() => setShowFullAbout(!showFullAbout)}
            className="mt-4 text-sm font-semibold text-orange-400 hover:text-orange-300 transition"
          >
            {showFullAbout ? "Show less ↑" : "Read more ↓"}
          </button>
        </div>

        {/* STICKY REGISTER */}
        <div className="sticky top-24 h-fit rounded-2xl border border-white/10 bg-[#0F172A] p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Register Now
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Secure your spot before registrations close.
          </p>

          <button
            onClick={() => router.push(`/events/${event.slug}/register`)}
            className="w-full rounded-full bg-orange-500 py-3 font-semibold text-black hover:bg-orange-400 transition"
          >
            Proceed to Registration →
          </button>
        </div>
      </section>
    </main>
  );
}

/* ================= SMALL COMPONENT ================= */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-400 uppercase text-xs tracking-wide">{label}</p>
      <p className="text-white font-semibold mt-1">{value}</p>
    </div>
  );
}
