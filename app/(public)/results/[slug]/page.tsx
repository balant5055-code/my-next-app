"use client";

import { useEffect, useState, use } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { TrophyIcon } from "@heroicons/react/24/outline";
import Podium from "@/components/results/Podium";
import Leaderboard from "@/components/results/Leaderboard";

type Params = {
  slug: string;
};

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="font-semibold text-gray-900 text-sm">
        {value ?? "-"}
      </span>
    </div>
  );
}

export default function EventResultsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = use(params);

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [bib, setBib] = useState("");
  const [runner, setRunner] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const [podium, setPodium] = useState<any[]>([]);

  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  /* LOAD EVENT */

  useEffect(() => {
    async function loadEvent() {
      const res = await fetch(`/api/results/event?slug=${slug}`);
      const data = await res.json();

      if (data.success) setEvent(data.event);

      setLoading(false);
    }

    loadEvent();
  }, [slug]);

  /* LOAD PODIUM */

  useEffect(() => {
    if (!event) return;

    async function loadPodium() {
      const res = await fetch(`/api/results/podium?eventId=${event.id}`);
      const data = await res.json();

      if (data.success) setPodium(data.runners);
    }

    loadPodium();
  }, [event]);

  /* SEARCH BIB */

  async function searchBib() {
    if (!bib || !event) return;

    setSearching(true);
    setRunner(null);

    const res = await fetch(
      `/api/results/search?eventId=${event.id}&bib=${bib}`,
    );

    const data = await res.json();

    if (data.success) setRunner(data.runner);
    else alert("Runner not found");

    setSearching(false);
  }

  /* DOWNLOAD CERTIFICATE */

  async function downloadCertificate() {
    if (!runner) return;

    try {
      setDownloading(true);
      setMessage("Preparing certificate...");

      const res = await fetch(
        `/api/results/certificate?id=${runner.registrationId}`,
      );

      if (!res.ok) {
        setMessage("Certificate generation failed");
        setDownloading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${runner.bibNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      setMessage("Certificate downloaded");
      setDownloading(false);
    } catch {
      setMessage("Certificate generation failed");
      setDownloading(false);
    }
  }

  /* LOADING STATES */

  if (loading) {
    return (
      <PageContainer>
        <p className="text-gray-500">Loading results...</p>
      </PageContainer>
    );
  }

  if (!event) {
    return (
      <PageContainer>
        <p className="text-gray-500">Event not found</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Breadcrumb
        items={[{ label: "Results", href: "/results" }, { label: event.name }]}
      />

      <PageHeader
        title={`${event.name} Results`}
        subtitle={`${event.city} • ${event.venue}`}
        icon={<TrophyIcon className="w-5 h-5" />}
      />

      {/* SEARCH */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <h2 className="font-semibold text-lg text-gray-900">
            Find Your Result
          </h2>
          <span className="text-xs text-gray-500">Enter your bib number</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Bib Number"
            value={bib}
            onChange={(e) => setBib(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
          />

          <button
            onClick={searchBib}
            className="bg-gradient-to-r from-[#9f2a25] via-[#c1342d] to-[#e0473f] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* PODIUM */}

      <Podium runners={podium} />

      {/* LEADERBOARD */}

      <Leaderboard eventId={event.id} eventSlug={slug} />
    </PageContainer>
  );
}
