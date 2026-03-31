"use client";

interface Props {
  data: any;
  bannerPreview: string | null;
  onSubmit: () => void;
  loading?: boolean;
  onEdit: (tab: string) => void;
}
/* ================= VALIDATION ================= */
function getWarnings(data: any) {
  const warnings: string[] = [];

  if (!data.city) warnings.push("City is required");
  if (!data.venue) warnings.push("Venue is required");
  if (!data.mapLink) warnings.push("Google Map link is required");

  if (!data.organizer?.name) warnings.push("Organizer name is required");

  if (!data.organizer?.phone)
    warnings.push("Organizer phone number is required");

  if (!data.registration?.start)
    warnings.push("Registration start date missing");

  if (!data.registration?.end) warnings.push("Registration end date missing");

  return warnings;
}

/* ================= COMPONENT ================= */

export default function ReviewSubmitSection({
  data,
  bannerPreview,
  onSubmit,
  loading,
}: Props) {
  const warnings = getWarnings(data);

  return (
    <section className="max-w-6xl mx-auto px-6 space-y-8 pb-40">
      {/* HEADER */}
      <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white">Final Review</h2>
        <p className="text-slate-400 text-sm mt-1">
          Verify event information before publishing.
        </p>
      </div>

      {/* WARNINGS */}
      {warnings.length > 0 && (
        <div className="border border-amber-500/40 bg-amber-900/20 rounded-xl p-6">
          <h3 className="text-amber-400 font-semibold mb-3">
            Please review the following issues before publishing
          </h3>

          <ul className="space-y-1 text-sm text-amber-300 list-disc pl-5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* EVENT OVERVIEW */}
      <Card title="Event Overview">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
          <Info label="Event Name" value={data.name} />
          <Info label="Slug" value={`/events/${data.slug}`} />

          <Info label="Type" value={data.eventType} />
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
      </Card>

      {/* ORGANIZER */}
      <Card title="Organizer">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
          <Info label="Organizer Name" value={data.organizer?.name} />

          <Info label="Organizer Phone" value={data.organizer?.phone} />
        </div>
      </Card>

      {/* CATEGORIES */}
      <Card
        title={`Categories (${Array.isArray(data.categories) ? data.categories.length : 0})`}
      >
        <div className="grid md:grid-cols-2 gap-5">
          {Array.isArray(data.categories) &&
            data.categories.map((cat: any, i: number) => (
              <div
                key={cat.title || i}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-2 text-sm"
              >
                <div className="flex justify-between text-white font-medium">
                  <span>{cat.title}</span>

                  <span>{cat.distance} KM</span>
                </div>

                <div className="text-slate-300 space-y-1">
                  <div>Price: ₹{cat.price}</div>

                  <div>Seats: {cat.maxSeats}</div>

                  <div>
                    Age: {cat.minAge} – {cat.maxAge}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* INCLUSIONS */}
      {data.inclusions && (
        <Card title="Event Inclusions">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            {Array.isArray(data.inclusions) &&
              data.inclusions.map((cat: any) => {
                if (!cat.items || cat.items.length === 0) return null;

                return (
                  <div key={cat.key}>
                    <p className="text-slate-400 mb-2">{cat.title}</p>

                    <ul className="space-y-1 text-white">
                      {cat.items.map((item: string, i: number) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* POLICIES */}
      <Card title="Event Policies">
        <Policy title="Description" content={data.description} />

        <Policy title="Refund Policy" content={data.refundPolicy} />

        <Policy title="Terms & Conditions" content={data.terms} />

        {data.medicalNote && (
          <Policy title="Medical Note" content={data.medicalNote} />
        )}
      </Card>

      {/* SOCIAL */}
      {data.socialLinks && (
        <Card title="Social Links">
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            {Object.entries(data.socialLinks).map(([key, value]) => {
              if (!value) return null;

              return (
                <div key={key} className="text-white">
                  <span className="text-slate-400 capitalize">{key}:</span>{" "}
                  {value as string}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* BANNER */}
      {(bannerPreview || data.bannerURL) && (
        <Card title="Event Poster">
          <div className="relative h-[420px] rounded-xl overflow-hidden border border-slate-700">
            <img
              src={bannerPreview || data.bannerURL}
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={bannerPreview || data.bannerURL}
                className="max-h-[380px] object-contain shadow-2xl"
              />
            </div>
          </div>
        </Card>
      )}

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-slate-700 py-5">
        <div className="max-w-6xl mx-auto px-6 flex gap-4">
          <button
            onClick={() => {
              localStorage.setItem("eventDraft", JSON.stringify(data));
              alert("Draft saved successfully");
            }}
            className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white"
          >
            Save Draft
          </button>

          <button
            onClick={onSubmit}
            disabled={loading || warnings.length > 0}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-40"
          >
            {loading ? "Publishing Event..." : "Publish Event"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ================= UI COMPONENTS ================= */

function Card({ title, children }: any) {
  return (
    <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-indigo-400">{title}</h3>
      {children}
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-white">{value || "—"}</p>
    </div>
  );
}

function Policy({ title, content }: any) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{title}</p>
      <p className="text-white text-sm whitespace-pre-line">{content || "—"}</p>
    </div>
  );
}
