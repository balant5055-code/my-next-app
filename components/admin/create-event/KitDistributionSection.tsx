"use client";

interface Props {
  data: any;
  onChange: (path: string, value: string) => void;
}

export default function KitDistributionSection({ data, onChange }: Props) {
  return (
    <section className="bg-[#111827] border border-slate-700 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Kit Distribution</h2>

        <p className="text-sm text-slate-400">
          Provide details about race kit collection.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* DATE */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">
            Distribution Date
          </label>

          <input
            type="date"
            value={data.kitDistribution?.date || ""}
            onChange={(e) => onChange("kitDistribution.date", e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm"
          />
        </div>

        {/* VENUE */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">
            Distribution Venue
          </label>

          <input
            type="text"
            placeholder="Example: Decathlon Coimbatore"
            value={data.kitDistribution?.venue || ""}
            onChange={(e) => onChange("kitDistribution.venue", e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm"
          />
        </div>

        {/* TIME */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">
            Distribution Time
          </label>

          <input
            type="text"
            placeholder="Example: 10 AM - 6 PM"
            value={data.kitDistribution?.time || ""}
            onChange={(e) => onChange("kitDistribution.time", e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm"
          />
        </div>
      </div>
    </section>
  );
}
