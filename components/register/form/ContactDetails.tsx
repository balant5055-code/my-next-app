"use client";

import AnimatedInput from "@/components/ui/AnimatedInput";
import { PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import InfoTooltip from "@/components/ui/InfoTooltip";
import { FIELD_HELP } from "@/lib/formFieldHelp";
import {
  UserIcon,
  IdentificationIcon,
  HeartIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
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
      {/* LEFT SIDE */}
      <div className="flex flex-col md:flex-row md:items-center bg-gray-50 rounded-lg px-5 py-4 gap-3">
        {/* ICON BADGE */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl 
  bg-red-50 text-[var(--color-orange-500)] ring-1  ring-red-100"
        >
          <UserIcon className="h-5 w-5" />
        </div>

        {/* TITLE */}
        <div className="min-w-0">
          <h2 className="text-[15px] text-gray-900">
            Contact{" "}
            <span className="text-[var(--color-orange-500)]">Details</span>
          </h2>

          <p className="text-xs text-gray-500 mt-[2px]">
            Communication details
          </p>
        </div>
      </div>
      {/* CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PHONE */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            Mobile Number (WhatsApp)
            <span className="text-red-500">*</span>
            <InfoTooltip text={FIELD_HELP.phone} />
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
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Email ID{" "}
              {!emailOptional && <span className="text-red-500">*</span>}
              <InfoTooltip text={FIELD_HELP.email} />
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
