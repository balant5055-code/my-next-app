"use client";

import { UserIcon, PhoneIcon } from "@heroicons/react/24/outline";

interface Props {
  data: {
    name: string;
    phone: string;
  };
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export default function OrganizerRegistrationSection({
  data,
  errors,
  onChange,
}: Props) {
  return (
    <section className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 space-y-10">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Organizer & Registration Setup
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure event ownership and registration window.
        </p>
      </div>

      {/* ORGANIZER INFO */}
      <div className="space-y-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Organizer Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Organizer Name */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Organizer Name <span className="text-rose-400">*</span>
            </label>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
              </div>

              <input
                value={data?.name || ""}
                onChange={(e) =>
                  onChange("organizer.name", e.target.value)
                }
                placeholder="Rotary Club Ooty"
                className="w-full pl-14 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            {errors["organizer.name"] && (
              <p className="text-xs text-rose-400 mt-1">
                {errors["organizer.name"]}
              </p>
            )}
          </div>

          {/* Organizer Phone */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Organizer Phone <span className="text-rose-400">*</span>
            </label>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                  <PhoneIcon className="w-4 h-4 text-white" />
                </div>
              </div>

              <input
                value={data?.phone || ""}
                onChange={(e) =>
                  onChange("organizer.phone", e.target.value)
                }
                placeholder="+91 9876543210"
                className="w-full pl-14 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            {errors["organizer.phone"] && (
              <p className="text-xs text-rose-400 mt-1">
                {errors["organizer.phone"]}
              </p>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}