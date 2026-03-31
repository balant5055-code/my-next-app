"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  CalendarIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";
import RichTextEditor from "@/components/admin/RichTextEditor";

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
  onChange: (path: string, value: any) => void;
}

export default function RegistrationSection({ data, errors, onChange }: Props) {
  const [previewMode, setPreviewMode] = useState({
    description: false,
    refundPolicy: false,
    terms: false,
    medicalNote: false,
  });
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

          {errors["registration.start"] && (
            <p className="text-xs text-rose-400 mt-1">
              {errors["registration.start"]}
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

          {errors["registration.end"] && (
            <p className="text-xs text-rose-400 mt-1">
              {errors["registration.end"]}
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">
                Event Description
              </label>

              <button
                type="button"
                onClick={() =>
                  setPreviewMode((p) => ({
                    ...p,
                    description: !p.description,
                  }))
                }
                className="text-xs px-3 py-1 rounded bg-slate-700 text-white hover:bg-slate-600"
              >
                {previewMode.description ? "Edit" : "Preview"}
              </button>
            </div>

            {previewMode.description ? (
              <div
                className="prose prose-invert max-w-none bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm"
                dangerouslySetInnerHTML={{
                  __html: (data.description || "")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">"),
                }}
              />
            ) : (
              <RichTextEditor
                value={data.description || ""}
                onChange={(value) => onChange("description", value)}
              />
            )}
          </div>

          {/* Refund Policy */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-300 mb-2">Refund Policy</label>
            <RichTextEditor
              value={data.refundPolicy || ""}
              onChange={(value) => onChange("refundPolicy", value)}
            />
          </div>

          {/* Terms */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-300 mb-2">
              Terms & Conditions
            </label>
            <RichTextEditor
              value={data.terms || ""}
              onChange={(value) => onChange("terms", value)}
            />
          </div>

          {/* Medical Note */}
          <div className="flex flex-col">
            <label className="text-sm text-slate-300 mb-2">
              Medical Note (Optional)
            </label>
            <RichTextEditor
              value={data.medicalNote || ""}
              onChange={(value) => onChange("medicalNote", value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
