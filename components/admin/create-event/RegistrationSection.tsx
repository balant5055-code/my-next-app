"use client";

import { useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  CalendarIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";

interface Props {
  data: {
    registration: {
      start: string;
      end: string;
    };
    description: string;
    refundPolicy: string;
    terms: string;
    medicalNote: string;
  };
  errors: Record<string, string>;
  onChange: (path: string, value: string) => void;
}

export default function RegistrationSection({ data, errors, onChange }: Props) {
  /* 🔐 Auto Validation: End must be after Start */
  useEffect(() => {
    if (
      data.registration.start &&
      data.registration.end &&
      new Date(data.registration.end) < new Date(data.registration.start)
    ) {
      onChange("registration.end", data.registration.start);
    }
  }, [data.registration.start]);

  return (
    <section className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Registration Window
        </h2>
        <p className="text-sm text-slate-400">
          Configure registration opening and closing dates.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Registration Start */}
        {/* Registration Start */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Registration Start <span className="text-rose-400">*</span>
          </label>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md shadow-blue-500/30">
                <CalendarIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            <DatePicker
              selected={
                data.registration?.start
                  ? new Date(data.registration.start)
                  : null
              }
              onChange={(date: Date | null) => {
                if (!date) return;
                const formatted = date.toISOString().split("T")[0];
                onChange("registration.start", formatted);
              }}
              minDate={new Date()}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select start date"
              wrapperClassName="w-full"
              className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {errors.registrationStart && (
            <p className="text-xs text-rose-400 mt-1">
              {errors.registrationStart}
            </p>
          )}
        </div>

        {/* Registration End */}
        {/* Registration End */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">
            Registration End <span className="text-rose-400">*</span>
          </label>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md shadow-purple-500/30">
                <ArrowRightCircleIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            <DatePicker
              selected={
                data.registration?.end ? new Date(data.registration.end) : null
              }
              onChange={(date: Date | null) => {
                if (!date) return;
                const formatted = date.toISOString().split("T")[0];
                onChange("registration.end", formatted);
              }}
              minDate={
                data.registration?.start
                  ? new Date(data.registration.start)
                  : new Date()
              }
              dateFormat="dd-MM-yyyy"
              placeholderText="Select end date"
              wrapperClassName="w-full"
              className="w-full pl-14 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
          </div>

          {errors.registrationEnd && (
            <p className="text-xs text-rose-400 mt-1">
              {errors.registrationEnd}
            </p>
          )}
        </div>
      </div>
      {/* ================= CONTENT SECTION ================= */}
      <div className="pt-6 border-t border-slate-700 space-y-8">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Registration Content & Policies
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Description */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-300 mb-2">
              Event Description
            </label>
            <textarea
              value={data.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
              rows={5}
              placeholder="Explain event highlights, race format, inclusions..."
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
            />
          </div>

          {/* Refund Policy */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-300 mb-2">Refund Policy</label>
            <textarea
              value={data.refundPolicy || ""}
              onChange={(e) => onChange("refundPolicy", e.target.value)}
              rows={5}
              placeholder="State refund eligibility and rules..."
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
            />
          </div>

          {/* Terms */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-300 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={data.terms || ""}
              onChange={(e) => onChange("terms", e.target.value)}
              rows={5}
              placeholder="Participant agreement terms..."
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
            />
          </div>

          {/* Medical Note */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-300 mb-2">
              Medical Note (Optional)
            </label>
            <textarea
              value={data.medicalNote || ""}
              onChange={(e) => onChange("medicalNote", e.target.value)}
              rows={5}
              placeholder="Health advisory or disclaimer..."
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-sm text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition resize-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
