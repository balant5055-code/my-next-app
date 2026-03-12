"use client";

import { useEffect, useState, use } from "react";

type Params = {
  slug: string;
};

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

  const [leaders, setLeaders] = useState<any[]>([]);
  /* ADD HERE */
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");
  /* -----------------------------------
     LOAD EVENT
  ----------------------------------- */

  useEffect(() => {
    async function loadEvent() {
      const res = await fetch(`/api/results/event?slug=${slug}`);
      const data = await res.json();

      if (data.success) {
        setEvent(data.event);
      }

      setLoading(false);
    }

    loadEvent();
  }, [slug]);

  /* -----------------------------------
     LOAD LEADERBOARD
  ----------------------------------- */

  useEffect(() => {
    if (!event) return;

    async function loadLeaderboard() {
      const res = await fetch(`/api/results/leaderboard?eventId=${event.id}`);

      const data = await res.json();

      if (data.success) {
        setLeaders(data.runners);
      }
    }

    loadLeaderboard();
  }, [event]);

  /* -----------------------------------
     BIB SEARCH
  ----------------------------------- */

  async function searchBib() {
    if (!bib || !event) return;

    setSearching(true);
    setRunner(null);

    const res = await fetch(
      `/api/results/search?eventId=${event.id}&bib=${bib}`,
    );

    const data = await res.json();

    if (data.success) {
      setRunner(data.runner);
    } else {
      alert("Runner not found");
    }

    setSearching(false);
  }

  /* -----------------------------------
     STATES
  ----------------------------------- */

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4">Loading results...</div>
    );
  }

  if (!event) {
    return <div className="max-w-6xl mx-auto py-20 px-4">Event not found</div>;
  }

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
    } catch (err) {
      setMessage("Certificate generation failed");
      setDownloading(false);
    }
  }
  /* -----------------------------------
     PAGE
  ----------------------------------- */

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      {/* HEADER */}

      <h1 className="text-3xl font-bold mb-2">{event.name} Results</h1>

      <p className="text-gray-500 mb-10">
        {event.city} • {event.venue}
      </p>

      {/* BIB SEARCH */}

      <div className="bg-white border rounded-xl p-6 mb-10">
        <h2 className="font-semibold mb-4">Search by Bib Number</h2>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Bib Number"
            value={bib}
            onChange={(e) => setBib(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1"
          />

          <button
            onClick={searchBib}
            className="bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* RUNNER CARD */}

      {runner && (
        <div className="border rounded-xl overflow-hidden mb-10 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* Rank Box */}

            <div className="bg-red-600 text-white flex flex-col justify-center items-center px-8 py-6 min-w-[120px]">
              <div className="text-3xl font-bold">
                #{runner.result?.overallRank ?? "-"}
              </div>

              <div className="text-xs uppercase tracking-wide">Overall</div>
            </div>

            {/* Runner Info */}

            <div className="flex-1 p-6">
              <h3 className="text-xl font-semibold mb-4">
                {runner.participant.firstName} {runner.participant.lastName}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div>
                  <div className="text-gray-400 text-xs">Bib</div>
                  <div className="font-semibold">{runner.bibNumber}</div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs">Gun Time</div>
                  <div className="font-semibold">
                    {runner.result?.gunTime ?? "-"}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs">Net Time</div>
                  <div className="font-semibold">
                    {runner.result?.netTime ?? "-"}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs">Pace</div>
                  <div className="font-semibold">
                    {runner.result?.pace ?? "-"}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs">Speed</div>
                  <div className="font-semibold">
                    {runner.result?.speed ?? "-"} km/h
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs">Category</div>
                  <div className="font-semibold">{runner.category}</div>
                </div>
              </div>

              {/* CERTIFICATE BUTTON */}

              <div className="mt-8">
                <button
                  onClick={downloadCertificate}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg"
                >
                  {downloading ? "Preparing..." : "Download Certificate"}
                </button>

                {message && (
                  <div className="mt-3 text-sm text-gray-500">{message}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD */}

      <div className="border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Rank</th>
                <th>Bib</th>
                <th>Name</th>
                <th>Gun Time</th>
                <th>Net Time</th>
                <th>Pace</th>
                <th>Speed</th>
              </tr>
            </thead>

            <tbody>
              {leaders.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 font-semibold">
                    {r.result?.overallRank ?? "-"}
                  </td>

                  <td>{r.bibNumber}</td>

                  <td>
                    {r.participant.firstName} {r.participant.lastName}
                  </td>

                  <td>{r.result?.gunTime ?? "-"}</td>

                  <td>{r.result?.netTime ?? "-"}</td>

                  <td>{r.result?.pace ?? "-"}</td>

                  <td>{r.result?.speed ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
