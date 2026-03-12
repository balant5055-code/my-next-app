"use client";

import AnimatedInput from "@/components/ui/AnimatedInput";
import { UserIcon, PhoneIcon } from "@heroicons/react/24/outline";
import InfoTooltip from "@/components/ui/InfoTooltip";
import { FIELD_HELP } from "@/lib/formFieldHelp";
interface Props {
  form: any;
  errors: Record<string, string>;
  handleChange: (e: any) => void;
  skipEmergency: boolean;
  setSkipEmergency: (v: boolean) => void;
}

export default function EmergencyContact({
  form,
  errors,
  handleChange,
  skipEmergency,
  setSkipEmergency,
}: Props) {
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-xs text-red-600 mt-1">{error}</p>;
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-orange-500)]/10 text-[var(--color-orange-500)] text-sm font-semibold">
          4
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Emergency Contact
          </h2>
          <p className="text-xs text-gray-500">
            Emergency communication details
          </p>
        </div>
      </div>

      {/* SKIP OPTION */}
      <div className="text-sm text-gray-600">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={skipEmergency}
            onChange={(e) => setSkipEmergency(e.target.checked)}
            className="accent-[var(--color-orange-500)]"
          />
          I will provide emergency contact later
        </label>
      </div>

      {/* FIELDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NAME */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            Emergency Contact Name{" "}
            {!skipEmergency && <span className="text-red-500">*</span>}
            <InfoTooltip text={FIELD_HELP.emergencyName} />
          </label>

          <div
            className={skipEmergency ? "pointer-events-none opacity-60" : ""}
          >
            <AnimatedInput
              name="emergencyName"
              value={form.emergencyName}
              placeholder="Enter emergency contact name"
              required={!skipEmergency}
              onChange={handleChange}
              icon={<UserIcon className="h-4 w-4" />}
            />

            <FieldError
              error={!skipEmergency ? errors.emergencyName : undefined}
            />
          </div>
        </div>

        {/* NUMBER */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            Emergency Contact Number{" "}
            {!skipEmergency && <span className="text-red-500">*</span>}
            <InfoTooltip text={FIELD_HELP.emergencyNumber} />
          </label>

          <div
            className={skipEmergency ? "pointer-events-none opacity-60" : ""}
          >
            <AnimatedInput
              type="tel"
              inputMode="numeric"
              name="emergencyNumber"
              placeholder="Enter emergency contact number"
              required={!skipEmergency}
              onChange={handleChange}
              icon={<PhoneIcon className="h-4 w-4" />}
            />

            <FieldError
              error={!skipEmergency ? errors.emergencyNumber : undefined}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
