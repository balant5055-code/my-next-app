"use client";

import AnimatedInput from "@/components/ui/AnimatedInput";
import { PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

interface Props {
  form: any;
  errors: Record<string, string>;
  handleChange: (e: any) => void;
  emailOptional: boolean;
  setEmailOptional: (value: boolean) => void;
}

export default function ContactDetails({
  form,
  errors,
  handleChange,
  emailOptional,
  setEmailOptional,
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
          3
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Contact Details
          </h2>
          <p className="text-xs text-gray-500">Communication details</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PHONE */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            WhatsApp Number <span className="text-red-500">*</span>
          </label>

          <AnimatedInput
            type="tel"
            inputMode="numeric"
            name="phone"
            value={form.phone}
            placeholder="Enter WhatsApp number"
            required
            onChange={handleChange}
            icon={<PhoneIcon className="h-4 w-4" />}
          />

          <FieldError error={errors.phone} />
        </div>

        {/* EMAIL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Email ID{" "}
              {!emailOptional && <span className="text-red-500">*</span>}
            </label>

            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={emailOptional}
                onChange={(e) => setEmailOptional(e.target.checked)}
                className="accent-[var(--color-orange-500)]"
              />
              Skip Email
            </label>
          </div>

          <div
            className={
              emailOptional ? "pointer-events-none opacity-60 select-none" : ""
            }
          >
            <AnimatedInput
              type="email"
              name="email"
              value={form.email}
              placeholder="Enter email address"
              required={!emailOptional}
              onChange={handleChange}
              icon={<EnvelopeIcon className="h-4 w-4" />}
            />

            <FieldError error={!emailOptional ? errors.email : undefined} />
          </div>
        </div>
      </div>
    </section>
  );
}
