"use client";

type Props = {
  runner: any;
  downloading: boolean;
  message: string;
  onDownload: () => void;
};

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="font-semibold text-gray-900 text-sm">
        {value ?? "-"}
      </span>
    </div>
  );
}

function RankStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: any;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`text-2xl font-bold ${
          highlight ? "text-[#c1342d]" : "text-gray-900"
        }`}
      >
        {value ?? "-"}
      </span>

      <span className="text-[10px] uppercase text-gray-400 tracking-wide">
        {label}
      </span>
    </div>
  );
}

export default function RunnerResultCard({
  runner,
  downloading,
  message,
  onDownload,
}: Props) {
  if (!runner) return null;

  const participant = runner.participant || {};
  const raw = runner.result || {};

  const result = {
    overallRank: raw["Place"],
    genderRank: raw["Gender Rank"],
    categoryRank: raw["AgeGroup Rank"],

    gunTime: raw["Gun Time"],
    netTime: raw["Chip time"],
    finishTime: raw["Finish"],

    pace: raw["Overall Pace"],
    speed: raw["Overall Speed"],

    splits: raw["splits"] || [],
  };

  const isPodium =
    result.overallRank &&
    (result.overallRank.startsWith("1/") ||
      result.overallRank.startsWith("2/") ||
      result.overallRank.startsWith("3/"));

  const name = `${participant.firstName ?? ""} ${participant.lastName ?? ""}`;

  function shareWhatsApp() {
    const text = `🏁 ${name}\n🏆 Rank: ${result.overallRank}\n⏱ Time: ${result.finishTime}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* HEADER */}
      <div
        className={`
          px-6 py-6 text-white
          ${
            isPodium
              ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
              : "bg-gradient-to-r from-[#9f2a25] via-[#c1342d] to-[#e0473f]"
          }
        `}
      >
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{name}</h2>

            <p className="text-xs opacity-90 mt-1">
              Bib {participant.bibNumber} • {runner.categoryTitle}
            </p>

            {isPodium && (
              <div className="text-xs mt-2 font-medium">🥇 Top Finisher</div>
            )}
          </div>

          <div className="text-center md:text-right">
            <div className="text-3xl font-bold">{result.finishTime ?? "-"}</div>
            <div className="text-[11px] uppercase opacity-90">Finish Time</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* RANKS */}
        <div className="grid grid-cols-3 gap-6 border-b pb-5">
          <RankStat label="Overall" value={result.overallRank} highlight />

          <RankStat label="Gender" value={result.genderRank} />
          <RankStat label="Category" value={result.categoryRank} />
        </div>

        {/* TIMES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <Stat label="Gun Time" value={result.gunTime} />
          <Stat label="Chip Time" value={result.netTime} />
          <Stat label="Pace" value={result.pace} />
          <Stat label="Speed" value={result.speed} />
        </div>

        {/* PERFORMANCE BADGE */}
        <div className="bg-gray-50 border rounded-lg px-4 py-3 text-sm text-center">
          ⚡ Consistent Performance — Great pacing maintained
        </div>

        {/* SPLITS TABLE 🔥 */}
        {result.splits.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-800">
              Split Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Distance</th>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Pace</th>
                    <th className="px-3 py-2">Rank</th>
                  </tr>
                </thead>

                <tbody>
                  {result.splits.map((s: any, i: number) => (
                    <tr key={i} className="border-t text-center">
                      <td className="px-3 py-2 text-left">{s.distance}</td>
                      <td>{s.split}</td>
                      <td>{s.pace}</td>
                      <td>{s.rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <button
            onClick={onDownload}
            disabled={downloading}
            className="bg-gradient-to-r from-[#9f2a25] via-[#c1342d] to-[#e0473f] text-white px-6 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto"
          >
            {downloading ? "Preparing..." : "Download Certificate"}
          </button>

          <button
            onClick={shareWhatsApp}
            className="border border-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto"
          >
            Share Result
          </button>

          <button className="border border-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto">
            View Photos (AI)
          </button>
        </div>

        {message && (
          <div className="text-xs text-gray-500 text-center">{message}</div>
        )}
      </div>
    </div>
  );
}
