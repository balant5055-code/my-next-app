"use client";

interface Props {
  data: any;
  onChange: (path: string, value: any) => void;
}

export default function KitDistributionSection({ data, onChange }: Props) {
  const kitList = Array.isArray(data.kitDistribution)
  ? data.kitDistribution
  : data.kitDistribution
    ? [data.kitDistribution] // convert old object → array
    : [];

  const updateKit = (index: number, field: string, value: string) => {
    const updated = [...kitList];
    updated[index] = { ...updated[index], [field]: value };
    onChange("kitDistribution", updated);
  };

  const addKit = () => {
    const updated = [
      ...kitList,
      { date: "", venue: "", time: "" },
    ];
    onChange("kitDistribution", updated);
  };

  const removeKit = (index: number) => {
    const updated = kitList.filter((_: any, i: number) => i !== index);
    onChange("kitDistribution", updated);
  };

  return (
    <section className="bg-[#111827] border border-slate-700 rounded-xl p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Kit Distribution
        </h2>
        <p className="text-sm text-slate-400">
          Provide details about race kit collection (multiple days supported).
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-5">
        {kitList.map((kit: any, index: number) => (
          <div
            key={index}
            className="grid md:grid-cols-3 gap-5 border border-slate-700 p-4 rounded-xl"
          >
            {/* DATE */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">
                Date
              </label>
              <input
                type="date"
                value={kit.date || ""}
                onChange={(e) =>
                  updateKit(index, "date", e.target.value)
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm"
              />
            </div>

            {/* VENUE */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">
                Venue
              </label>
              <input
                type="text"
                placeholder="Example: Decathlon Coimbatore"
                value={kit.venue || ""}
                onChange={(e) =>
                  updateKit(index, "venue", e.target.value)
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm"
              />
            </div>

            {/* TIME */}
            <div>
              <label className="block text-xs text-slate-400 mb-2">
                Time
              </label>
              <input
                type="text"
                placeholder="Example: 10 AM - 6 PM"
                value={kit.time || ""}
                onChange={(e) =>
                  updateKit(index, "time", e.target.value)
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm"
              />
            </div>

            {/* REMOVE BUTTON */}
            {kitList.length > 1 && (
              <div className="col-span-3 text-right">
                <button
                  onClick={() => removeKit(index)}
                  className="text-rose-400 hover:text-rose-300 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        {/* ADD BUTTON */}
        <button
          onClick={addKit}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm"
        >
          + Add Another Date
        </button>
      </div>
    </section>
  );
}