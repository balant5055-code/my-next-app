"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ImportantInfoProps {
  event: {
    medicalNote?: string;
  };
}

export default function ImportantInfo({ event }: ImportantInfoProps) {
  if (!event.medicalNote) return null;

  return (
    <section>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="
          flex h-9 w-9 items-center justify-center
          rounded-lg
          bg-orange-50
          "
          >
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Important Information
          </h2>
        </div>

        {/* Content */}
        <div
          className="text-sm text-gray-600 leading-relaxed space-y-2"
          dangerouslySetInnerHTML={{ __html: event.medicalNote }}
        />
      </div>
    </section>
  );
}
