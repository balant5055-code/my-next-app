"use client";

interface Props {
  stats: {
    stats: Record<
      string,
      {
        online: { total: number; assigned: number; pending: number };
        offline: { total: number; assigned: number; pending: number };
      }
    >;
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

  const format = (n: number) => n.toLocaleString("en-IN");

  const ordered = Object.entries(stats.stats).sort(([a], [b]) => {
    const numA = parseInt(a);
    const numB = parseInt(b);

    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;

    return a.localeCompare(b);
  });

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900 shadow-lg">

      {/* HEADER */}
      <div
        className={`px-6 py-5 transition-colors ${
          isReady ? "bg-emerald-600" : "bg-red-600"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-white">

          <div>
            <div className="text-xs uppercase tracking-wider opacity-80">
              Event Status
            </div>

            <div className="text-3xl font-bold mt-1">
              {isReady ? "RACE READY" : "CHIPS PENDING"}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-lg font-semibold">

            <div>
              <div className="text-xs opacity-80">Total</div>
              <div>{format(overall.total)}</div>
            </div>

            <div>
              <div className="text-xs opacity-80">Assigned</div>
              <div>{format(overall.assigned)}</div>
            </div>

            <div>
              <div className="text-xs opacity-80">Pending</div>
              <div>{format(overall.pending)}</div>
            </div>

            <div>
              <div className="text-xs opacity-80">Completion</div>
              <div>{percent}%</div>
            </div>
          </div>
        </div>

        <div className="mt-4 h-2 w-full bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div className="px-6 py-4 grid md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">

        {ordered.map(([cat, stat]) => {

          const online = stat.online;
          const offline = stat.offline;

          const total = online.total + offline.total;
          const assigned = online.assigned + offline.assigned;
          const pending = online.pending + offline.pending;

          const catPercent =
            total === 0 ? 0 : Math.round((assigned / total) * 100);

          const isComplete = pending === 0 && total > 0;

          return (
            <div
              key={cat}
              className={`rounded-lg p-4 border transition-all hover:scale-[1.01]
                ${
                  isComplete
                    ? "bg-emerald-900/30 border-emerald-500"
                    : "bg-slate-800 border-slate-700"
                }`}
            >

              {/* CATEGORY TITLE */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">{cat}</span>

                {isComplete && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-semibold">
                    COMPLETED
                  </span>
                )}
              </div>

              {/* ONLINE */}
              <div className="flex justify-between text-xs mt-3">
                <span className="text-indigo-400">
                  Online: {format(online.total)}
                </span>

                <span className="text-emerald-400">
                  A {format(online.assigned)}
                </span>

                <span className="text-red-400">
                  P {format(online.pending)}
                </span>
              </div>

              {/* OFFLINE */}
              <div className="flex justify-between text-xs mt-1">
                <span className="text-yellow-400">
                  Offline: {format(offline.total)}
                </span>

                <span className="text-emerald-400">
                  A {format(offline.assigned)}
                </span>

                <span className="text-red-400">
                  P {format(offline.pending)}
                </span>
              </div>

              {/* TOTAL */}
              <div className="flex justify-between text-xs mt-2 text-slate-400">
                <span>Total {format(total)}</span>
                <span>A {format(assigned)}</span>
                <span>P {format(pending)}</span>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-3 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
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