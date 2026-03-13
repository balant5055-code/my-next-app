"use client";

type Runner = {
  id: string;
  bibNumber: string;
  participant: {
    firstName: string;
    lastName: string;
  };
  result?: {
    overallRank?: number;
    gunTime?: string;
  };
};

interface Props {
  runners: Runner[];
}

export default function Podium({ runners }: Props) {
  if (!runners || runners.length === 0) return null;

  const sorted = runners
    .filter((r) => r.result?.overallRank && r.result.overallRank <= 3)
    .sort((a, b) => rRank(a) - rRank(b));

  const first = sorted.find((r) => rRank(r) === 1);
  const second = sorted.find((r) => rRank(r) === 2);
  const third = sorted.find((r) => rRank(r) === 3);

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-8 text-center">
        Podium Finishers
      </h2>

      <div className="flex items-end justify-center gap-8 flex-wrap">
        {/* 2nd */}
        {second && (
          <PodiumBlock
            runner={second}
            place={2}
            color="bg-gray-300"
            height="h-28"
          />
        )}

        {/* 1st */}
        {first && (
          <PodiumBlock
            runner={first}
            place={1}
            color="bg-gradient-to-r from-[#9f2a25] via-[#c1342d] to-[#e0473f]"
            height="h-36"
            highlight
          />
        )}

        {/* 3rd */}
        {third && (
          <PodiumBlock
            runner={third}
            place={3}
            color="bg-orange-300"
            height="h-24"
          />
        )}
      </div>
    </div>
  );
}

function rRank(r: Runner) {
  return r.result?.overallRank ?? 999;
}

function PodiumBlock({ runner, place, color, height, highlight }: any) {
  return (
    <div className="flex flex-col items-center">
      {/* Avatar */}

      <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 mb-2">
        {runner.participant.firstName?.charAt(0)}
      </div>

      {/* Name */}

      <div className="text-sm font-semibold text-gray-900 text-center">
        {runner.participant.firstName} {runner.participant.lastName}
      </div>

      <div className="text-xs text-gray-500 mb-2">Bib {runner.bibNumber}</div>

      {/* Podium block */}

      <div
        className={`w-28 ${height} ${color} rounded-t-lg flex items-center justify-center text-white font-bold text-lg ${
          highlight ? "shadow-lg scale-105" : ""
        }`}
      >
        #{place}
      </div>

      {/* Time */}

      <div
        className={`w-28 border border-gray-200 rounded-b-lg bg-white text-center py-2 text-xs font-medium ${
          highlight ? "shadow-md" : ""
        }`}
      >
        {runner.result?.gunTime ?? "-"}
      </div>
    </div>
  );
}
