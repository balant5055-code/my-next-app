"use client";

interface Props {
  data: any;
  onSubmit: () => void;
  loading?: boolean;
  onEdit: (tab: string) => void;
}

export default function ReviewSubmitSection({
  data,
  onSubmit,
  loading,
  onEdit,
}: Props) {
  const getCategoryColor = (distance: string) => {
    const d = Number(distance);

    if (d === 2) return "from-green-500 to-emerald-600";
    if (d === 3) return "from-sky-500 to-blue-600";
    if (d === 5) return "from-blue-500 to-indigo-600";
    if (d === 10) return "from-orange-500 to-amber-600";
    if (d === 21) return "from-purple-500 to-violet-600";
    if (d === 42) return "from-rose-500 to-red-600";

    return "from-slate-600 to-slate-700";
  };

  return (
    <section className="space-y-8">
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-2xl font-bold text-white">
          Final Review & Publish
        </h2>
        <p className="text-slate-300 mt-2 text-sm">
          Carefully verify all event information before publishing.
        </p>
      </div>

      {/* ================= EVENT OVERVIEW ================= */}
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8 space-y-6">
        <h3 className="text-lg font-semibold text-indigo-400 border-b border-slate-700 pb-3">
          Event Overview
        </h3>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <Info label="Event Name" value={data.name} />
          <Info label="Slug" value={`/events/${data.slug}`} />
          <Info label="Event Type" value={data.eventType} />
          <Info label="City" value={data.city} />
          <Info label="Venue" value={data.venue} />
          <Info label="Race Start" value={data.raceStart} />
          <Info label="Event Date" value={data.date} />
          <Info
            label="Registration Window"
            value={`${data.registration?.start || "—"} → ${
              data.registration?.end || "—"
            }`}
          />
        </div>
      </div>

      {/* ================= ORGANIZER ================= */}
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8 space-y-6">
        <h3 className="text-lg font-semibold text-emerald-400 border-b border-slate-700 pb-3">
          Organizer Information
        </h3>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <Info label="Organizer Name" value={data.organizer?.name} />
          <Info label="Phone" value={data.organizer?.phone} />
        </div>
      </div>

      {/* ================= CATEGORIES ================= */}
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8 space-y-6">
        <h3 className="text-lg font-semibold text-purple-400 border-b border-slate-700 pb-3">
          Categories ({data.categories?.length || 0})
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {data.categories?.map((cat: any, index: number) => {
            const gradient = getCategoryColor(cat.distance);

            return (
              <div
                key={index}
                className={`rounded-xl p-5 space-y-3 text-white shadow-lg bg-gradient-to-br ${gradient}`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">{cat.title}</p>

                  <span className="text-xs bg-white/20 backdrop-blur px-2 py-1 rounded-md">
                    {cat.distance} KM
                  </span>
                </div>

                <div className="text-sm flex justify-between opacity-90">
                  <span>₹ {cat.price}</span>
                  <span>{cat.maxSeats} Seats</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= DESCRIPTION & POLICIES ================= */}
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8 space-y-6">
        <h3 className="text-lg font-semibold text-amber-400 border-b border-slate-700 pb-3">
          Event Policies
        </h3>

        <Block title="Description" content={data.description} />
        <Block title="Refund Policy" content={data.refundPolicy} />
        <Block title="Terms & Conditions" content={data.terms} />
        {data.medicalNote && (
          <Block title="Medical Note" content={data.medicalNote} />
        )}
      </div>

      {/* ================= SOCIAL ================= */}
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8 space-y-6">
        <h3 className="text-lg font-semibold text-pink-400 border-b border-slate-700 pb-3">
          Social Links
        </h3>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {Object.entries(data.socialLinks || {}).map(([key, value]) => {
            const link = value as string;

            if (!link) return null;

            return (
              <div key={key} className="text-slate-300">
                <span className="text-slate-400 capitalize">{key}:</span>{" "}
                <span className="text-indigo-400 break-all">{link}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= BANNER ================= */}
      {data.bannerURL && (
        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-8 space-y-4">
          <h3 className="text-lg font-semibold text-cyan-400 border-b border-slate-700 pb-3">
            Event Poster Preview
          </h3>

          <div className="rounded-xl overflow-hidden border border-slate-700">
            <img
              src={data.bannerURL}
              alt="Event Banner"
              className="w-full object-contain bg-black"
            />
          </div>
        </div>
      )}

      {/* ================= WARNING ================= */}
      <div className="bg-amber-900/20 border border-amber-600 rounded-xl p-4 text-sm text-amber-300">
        After publishing, Bib ranges and secure configurations will be generated
        automatically by the server.
      </div>

      {/* ================= PUBLISH BUTTON ================= */}

      {/* FIXED FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-700 p-6 z-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
          {/* Draft Button */}
          <button
            onClick={() => {
              localStorage.setItem("eventDraft", JSON.stringify(data));
              alert("Draft saved successfully");
            }}
            className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition"
          >
            💾 Save as Draft
          </button>

          {/* Publish Button */}
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition text-white font-bold text-lg shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? "Publishing Event..." : "🚀 Publish Event"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Info({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-white font-medium">{value || "—"}</p>
    </div>
  );
}

function Block({ title, content }: any) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-2">{title}</p>
      <p className="text-white text-sm leading-relaxed whitespace-pre-line">
        {content || "—"}
      </p>
    </div>
  );
}
