"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function EventSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const activeEventId = params?.id as string;

  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) {
        setLoading(false);
        return;
      }

      const userData = userSnap.data();

      // ⚠️ IMPORTANT: keep your original field name
      const eventIds = userData.eventids || [];

      const eventList: { id: string; name: string }[] = [];

      for (const id of eventIds) {
        const eventSnap = await getDoc(doc(db, "events", id));

        if (eventSnap.exists()) {
          eventList.push({
            id,
            name: eventSnap.data().name || id,
          });
        }
      }

      setEvents(eventList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div className="px-4 py-2 text-sm text-gray-400">Loading...</div>;
  }

  if (events.length === 0) {
    return <div className="px-4 py-2 text-sm text-red-500">No Events</div>;
  }

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  function switchEvent(eventId: string) {
    setOpen(false);

    const newPath = pathname.replace(activeEventId, eventId);
    router.push(newPath);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition text-sm font-medium"
      >
        {activeEvent.name}
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 transition-all duration-200 origin-top ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => switchEvent(event.id)}
            className={`relative w-full text-left px-4 py-2 text-sm transition group ${
              event.id === activeEvent.id
                ? "text-red-600 font-semibold bg-red-50"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {event.id === activeEvent.id && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full" />
            )}
            {event.name}
          </button>
        ))}
      </div>
    </div>
  );
}
