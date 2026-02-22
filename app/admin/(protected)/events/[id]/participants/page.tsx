"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import ParticipantStats from "@/components/admin/events/participants/ParticipantStats";
import ParticipantFilters from "@/components/admin/events/participants/ParticipantFilters";
import ParticipantTable from "@/components/admin/events/participants/ParticipantTable";
import BibGeneratorModal from "@/components/admin/events/participants/BibGeneratorModal";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ParticipantsPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const [showBibModal, setShowBibModal] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    paymentStatus: "all",
    status: "all",
  });
  /* 🔥 Real-Time Metrics Listener */
  useEffect(() => {
    if (!eventId) return;

    const unsubscribe = onSnapshot(doc(db, "events", eventId), (snapshot) => {
      const data = snapshot.data();
      if (data?.metrics) {
        setMetrics(data.metrics);
      }
    });

    return () => unsubscribe();
  }, [eventId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Participants</h1>
          <p className="text-sm text-slate-400">
            Manage registrations & bib assignments
          </p>
        </div>
        <button
          onClick={() => setShowBibModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 
               rounded-xl text-sm font-medium text-white transition"
        >
          Bulk BIB Generator
        </button>
        {showBibModal && (
          <BibGeneratorModal
            eventId={eventId}
            onClose={() => setShowBibModal(false)}
          />
        )}
      </div>

      <ParticipantStats metrics={metrics} />

      <ParticipantFilters
        eventId={eventId}
        filters={filters}
        setFilters={setFilters}
      />

      <ParticipantTable eventId={eventId} filters={filters} />
    </div>
  );
}
