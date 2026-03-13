"use client";

type Props = {
  runner: any;
  downloading: boolean;
  message: string;
  onDownload: () => void;
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

export default function RunnerResultCard({
  runner,
  downloading,
  message,
  onDownload,
}: Props) {
  if (!runner) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* RANK */}

        <div className="bg-gradient-to-r from-[#9f2a25] via-[#c1342d] to-[#e0473f] text-white flex flex-col justify-center items-center px-10 py-8 md:min-w-[160px]">
          <span className="text-4xl font-bold">
            #{runner.result?.overallRank ?? "-"}
          </span>

          <span className="text-xs uppercase tracking-wider opacity-90">
            Overall Rank
          </span>
        </div>

        {/* INFO */}

        <div className="flex-1 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {runner.participant.firstName} {runner.participant.lastName}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Stat label="Bib" value={runner.bibNumber} />

            <Stat label="Gun Time" value={runner.result?.gunTime} />

            <Stat label="Net Time" value={runner.result?.netTime} />

            <Stat label="Pace" value={runner.result?.pace} />

            <Stat label="Speed" value={`${runner.result?.speed ?? "-"} km/h`} />

            <Stat label="Category" value={runner.category} />
          </div>

          <div className="mt-8">
            <button
              onClick={onDownload}
              className="bg-gradient-to-r from-[#9f2a25] via-[#c1342d] to-[#e0473f] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              {downloading ? "Preparing..." : "Download Certificate"}
            </button>

            {message && (
              <div className="text-sm text-gray-500 mt-2">{message}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
