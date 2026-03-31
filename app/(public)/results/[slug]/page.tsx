"use client";

import { useEffect, useState, use } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { TrophyIcon } from "@heroicons/react/24/outline";

import Podium from "@/components/results/Podium";
import Leaderboard from "@/components/results/Leaderboard";
import ResultFilters from "@/components/results/ResultFilters";

type Params = {
  slug: string;
};

type Filters = {
  distance: string;
  gender: string;
  category: string;
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

  /* FILTER STATE */

  const [filters, setFilters] = useState<Filters>({
    distance: "",
    gender: "overall",
    category: "overall",
  });

  /* LOAD EVENT */

  useEffect(() => {
    async function loadEvent() {
      const res = await fetch(`/api/results/event?slug=${slug}`);
      const data = await res.json();

      if (data.success) {
        setEvent(data.event);

        /* FIND SMALLEST DISTANCE */

        const distances =
          data.event?.categories?.map((c: any) =>
            Number(String(c.distance).replace(/[^\d]/g, "")),
          ) || [];

        if (distances.length > 0) {
          const smallest = Math.min(...distances);

          setFilters((prev) => ({
            ...prev,
            distance: String(smallest),
          }));
        }
      }

      setLoading(false);
    }

    loadEvent();
  }, [slug]);

  /* LOAD PODIUM (legacy safe — does not affect filtered podium) */

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
      <Breadcrumb />

      <PageHeader
        title={`${event.name} Results`}
        subtitle={`${event.city} • ${event.venue}`}
        icon={<TrophyIcon className="w-5 h-5" />}
      />

      {/* FILTERS */}
      <div className="sticky top-0 z-50 bg-white/95">
        <div className="max-w-7xl mx-auto">
          <ResultFilters
            eventId={event.id}
            onChange={(f: Filters) => {
              setFilters((prev: Filters) => {
                if (
                  prev.distance === f.distance &&
                  prev.gender === f.gender &&
                  prev.category === f.category
                ) {
                  return prev;
                }
                return f;
              });
            }}
          />
        </div>
      </div>

      <div className="h-6"></div>

      {/* PODIUM */}

      <Podium eventId={event.id} filters={filters} />

      {/* LEADERBOARD */}

      <Leaderboard eventId={event.id} eventSlug={slug} filters={filters} />
    </PageContainer>
  );
}
