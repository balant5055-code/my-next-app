"use client";

interface Props {
  stats: {
    stats: Record<string, { total: number; assigned: number; pending: number }>;
    overall: {
      total: number;
      assigned: number;
      pending: number;
    };
  } | null;
}

export default function EventStatsPanel({ stats }: Props) {
  if (!stats) return null;

  const { overall } = stats;

  const percent =
    overall.total === 0
      ? 0
      : Math.round((overall.assigned / overall.total) * 100);

  const isReady = overall.pending === 0;

  const ordered = Object.entries(stats.stats).sort(([a], [b]) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900">
      {/* 🔥 OVERALL SUPER HIGHLIGHT */}
      <div className={`px-6 py-5 ${isReady ? "bg-emerald-600" : "bg-red-600"}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white">
          {/* LEFT SIDE */}
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80">
              Event Status
            </div>

            <div className="text-3xl font-bold mt-1">
              {isReady ? "RACE READY" : "CHIPS PENDING"}
            </div>
          </div>

          {/* RIGHT SIDE NUMBERS */}
          <div className="flex gap-8 text-lg font-semibold">
            <div>
              <div className="text-xs opacity-80">Total</div>
              <div>{overall.total}</div>
            </div>

            <div>
              <div className="text-xs opacity-80">Assigned</div>
              <div>{overall.assigned}</div>
            </div>

            <div>
              <div className="text-xs opacity-80">Pending</div>
              <div>{overall.pending}</div>
            </div>

            <div>
              <div className="text-xs opacity-80">Completion</div>
              <div>{percent}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY ROWS */}
      <div className="px-6 py-4 grid md:grid-cols-3 gap-4 text-sm">
        {ordered.map(([cat, stat]) => {
          const catPercent =
            stat.total === 0
              ? 0
              : Math.round((stat.assigned / stat.total) * 100);

          const isComplete = stat.pending === 0 && stat.total > 0;

          return (
            <div
              key={cat}
              className={`rounded-lg p-3 border transition-all
        ${
          isComplete
            ? "bg-emerald-900/30 border-emerald-500"
            : "bg-slate-800 border-slate-700"
        }`}
            >
              {/* TOP ROW */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">{cat}</span>

                {isComplete && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-semibold">
                    COMPLETED
                  </span>
                )}
              </div>

              {/* NUMBERS */}
              <div className="flex justify-between text-xs mt-2">
                <span className="text-slate-400">{stat.total} Total</span>

                <span className="text-emerald-400">{stat.assigned} A</span>

                <span className="text-red-400">{stat.pending} P</span>
              </div>

              {/* MINI PROGRESS BAR */}
              <div className="mt-2 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isComplete ? "bg-emerald-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${catPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
