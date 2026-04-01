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
  useSameEmergency: boolean;
  setUseSameEmergency: (v: boolean) => void;
  runnerIndex: number;
}

export default function EmergencyContact({
  form,
  errors,
  handleChange,
  skipEmergency,
  setSkipEmergency,
  useSameEmergency,
  setUseSameEmergency,
  runnerIndex,
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
       bg-red-50 text-[var(--color-orange-500)] ring-1 ring-red-100"
               >
                 <UserIcon className="h-5 w-5" />
               </div>
     
               {/* TITLE */}
               <div className="min-w-0">
                 <h2 className="text-[15px] text-gray-900">
                   Emergency{" "}
                   <span className="text-[var(--color-orange-500)]">Contact</span>
                 </h2>
     
                 <p className="text-xs text-gray-500 mt-[2px]">
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

      {/* SAME FOR ALL RUNNERS */}
<div className="text-sm text-gray-600">
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={useSameEmergency}
      onChange={(e) => setUseSameEmergency(e.target.checked)}
      className="accent-[var(--color-orange-500)]"
    />
    Use same emergency contact for all runners
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
  className={
    skipEmergency || (useSameEmergency && runnerIndex !== 0)
      ? "pointer-events-none opacity-60"
      : ""
  }
>
           <AnimatedInput
  name="emergencyName"
  value={form.emergencyName}
  placeholder="Enter emergency contact name"
  required={!skipEmergency}
  onChange={handleChange}
  icon={<UserIcon className="h-4 w-4" />}
  disabled={skipEmergency || (useSameEmergency && runnerIndex !== 0)}
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
  className={
    skipEmergency || (useSameEmergency && runnerIndex !== 0)
      ? "pointer-events-none opacity-60"
      : ""
  }
>
<AnimatedInput
  type="tel"
  inputMode="numeric"
  name="emergencyNumber"
  value={form.emergencyNumber} // ✅ ADD THIS
  placeholder="Enter emergency contact number"
  required={!skipEmergency}
  onChange={handleChange}
  icon={<PhoneIcon className="h-4 w-4" />}
  disabled={skipEmergency || (useSameEmergency && runnerIndex !== 0)}
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
