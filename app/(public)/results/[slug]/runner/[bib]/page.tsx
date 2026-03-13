"use client";

import { useEffect, useState, use } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumb from "@/components/ui/Breadcrumb";
import RunnerResultCard from "@/components/results/RunnerResultCard";
import { TrophyIcon } from "@heroicons/react/24/outline";

type Params = {
  slug: string;
  bib: string;
};

export default function RunnerPage({ params }: { params: Promise<Params> }) {
  const { slug, bib } = use(params);

  const [runner, setRunner] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadRunner() {
      try {
        const res = await fetch(`/api/results/runner?slug=${slug}&bib=${bib}`);

        const data = await res.json();

        if (data.success) {
          setRunner(data.runner);
          setEvent(data.event);
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    }

    loadRunner();
  }, [slug, bib]);

  async function downloadCertificate() {
    if (!runner) return;

    try {
      setDownloading(true);
      setMessage("Preparing certificate...");

      const res = await fetch(
        `/api/results/certificate?id=${runner.registrationId}`,
      );

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
    } catch {
      setMessage("Certificate generation failed");
    }

    setDownloading(false);
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="text-sm text-gray-500">Loading result...</div>
      </PageContainer>
    );
  }

  if (!runner) {
    return (
      <PageContainer>
        <div className="text-sm text-gray-500">Runner not found</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Results", href: "/results" },
            { label: event?.name, href: `/results/${slug}` },
            { label: `Bib ${bib}` },
          ]}
        />

        <PageHeader
          title={`${runner.participant.firstName} ${runner.participant.lastName}`}
          subtitle={`Bib ${runner.bibNumber}`}
          icon={<TrophyIcon className="w-5 h-5" />}
        />

        <RunnerResultCard
          runner={runner}
          downloading={downloading}
          message={message}
          onDownload={downloadCertificate}
        />
      </div>
    </PageContainer>
  );
}
