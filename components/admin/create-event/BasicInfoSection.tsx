"use client";

import { useEffect, useState } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  PencilSquareIcon,
  LinkIcon,
  TagIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

interface Props {
  data: {
    name: string;
    slug: string;
    eventType: string;
    date: string;
    raceStart: string;
    venue: string;
    city: string;
    mapLink: string;
  };
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export default function BasicInfoSection({ data, errors, onChange }: Props) {
  const [autoSlug, setAutoSlug] = useState(true);

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (value: string) => {
    onChange("name", value);

    if (autoSlug) {
      onChange("slug", generateSlug(value));
    }
  };
  useEffect(() => {
    if (!data.raceStart) {
      onChange("raceStart", "05:00");
    }
  }, []);

  return (
    <section className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Event Basic Information
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Core identity and event metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Name */}
        {/* Event Name */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Event Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/30">
                <PencilSquareIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <input
              value={data.name || ""}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ooty Marathon 2026"
              className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-400 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Event Slug <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md shadow-blue-500/30">
                <LinkIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <input
              value={data.slug || ""}
              onChange={(e) => {
                setAutoSlug(false);
                onChange("slug", generateSlug(e.target.value));
              }}
              placeholder="ooty-marathon-2026"
              className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          {errors.slug && (
            <p className="text-xs text-rose-400 mt-1">{errors.slug}</p>
          )}
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Event Type
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-md shadow-purple-500/30">
                <TagIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <select
              value={data.eventType || "marathon"}
              onChange={(e) => onChange("eventType", e.target.value)}
              className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none"
            >
              <option value="marathon">Marathon</option>
              <option value="cycling">Cycling</option>
              <option value="triathlon">Triathlon</option>
              <option value="swimming">Swimming</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Event Date */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Event Date <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30">
                <CalendarDaysIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <DatePicker
              selected={data.date ? new Date(data.date) : null}
              onChange={(date: Date | null) => {
                if (!date) return;
                const formatted = date.toISOString().split("T")[0];
                onChange("date", formatted);
              }}
              minDate={new Date()}
              dateFormat="dd-MM-yyyy"
              wrapperClassName="w-full"
              className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
          {errors.date && (
            <p className="text-xs text-rose-400 mt-1">{errors.date}</p>
          )}
        </div>

        {/* Race Start */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Race Start Time <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/30">
                <ClockIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <DatePicker
              selected={
                data.raceStart
                  ? new Date(`1970-01-01T${data.raceStart}`)
                  : new Date(`1970-01-01T05:00`)
              }
              onChange={(date: Date | null) => {
                if (!date) return;
                const hours = date.getHours().toString().padStart(2, "0");
                const minutes = date.getMinutes().toString().padStart(2, "0");
                onChange("raceStart", `${hours}:${minutes}`);
              }}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              dateFormat="h:mm aa"
              wrapperClassName="w-full"
              className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>
          {errors.raceStart && (
            <p className="text-xs text-rose-400 mt-1">{errors.raceStart}</p>
          )}
        </div>

        {/* Venue */}

        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Venue <span className="text-rose-400">*</span>
          </label>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30">
                <BuildingOfficeIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            <input
              value={data.venue || ""}
              onChange={(e) => onChange("venue", e.target.value)}
              placeholder="Main Stadium"
              className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
            />
          </div>

          {errors.venue && (
            <p className="text-xs text-rose-400 mt-1">{errors.venue}</p>
          )}
        </div>

        {/* City */}
        {/* City */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            City <span className="text-rose-400">*</span>
          </label>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-pink-500 to-rose-500 shadow-md shadow-pink-500/30">
                <MapPinIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            <input
              value={data.city || ""}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="Ooty"
              className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
            />
          </div>

          {errors.city && (
            <p className="text-xs text-rose-400 mt-1">{errors.city}</p>
          )}
        </div>

        {/* Map Link */}
        {/* Google Map Link */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Google Map Link <span className="text-rose-400">*</span>
          </label>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-sky-500 shadow-md shadow-cyan-500/30">
                <LinkIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            <input
              value={data.mapLink || ""}
              onChange={(e) => onChange("mapLink", e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>

          {errors.mapLink && (
            <p className="text-xs text-rose-400 mt-1">{errors.mapLink}</p>
          )}
        </div>
      </div>
    </section>
  );
}
