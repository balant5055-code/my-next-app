"use client";

import AnimatedInput from "@/components/ui/AnimatedInput";
import AnimatedSelect from "@/components/ui/AnimatedSelect";
import { MapPinIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import InfoTooltip from "@/components/ui/InfoTooltip";
import { FIELD_HELP } from "@/lib/formFieldHelp";
import {
  UserIcon,
} from "@heroicons/react/24/outline";
interface Props {
  form: any;
  errors: Record<string, string>;
  handleChange: (e: any) => void;
}

export default function AddressDetails({ form, errors, handleChange }: Props) {
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
              Address{" "}
              <span className="text-[var(--color-orange-500)]">Details</span>
            </h2>

            <p className="text-xs text-gray-500 mt-[2px]">
              Where should we contact you?
            </p>
          </div>
        </div>
      {/* CONTENT */}
      <div className="space-y-5">
        {/* ADDRESS */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            Residential Address
            <span className="text-red-500">*</span>
            <InfoTooltip text={FIELD_HELP.address} />
          </label>

          <AnimatedInput
            name="address"
            value={form.address}
            placeholder="Enter full address"
            required
            onChange={handleChange}
            icon={<MapPinIcon className="h-4 w-4" />}
          />

          <FieldError error={errors.address} />
        </div>

        {/* STATE + PINCODE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STATE */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              State
              <span className="text-red-500">*</span>
              <InfoTooltip text={FIELD_HELP.state} />
            </label>

            <AnimatedSelect
              name="state"
              value={form.state}
              required
              onChange={handleChange}
              icon={<BuildingOfficeIcon className="h-4 w-4" />}
            >
              <option value="">Select State</option>

              <option>Andhra Pradesh</option>
              <option>Arunachal Pradesh</option>
              <option>Assam</option>
              <option>Bihar</option>
              <option>Chhattisgarh</option>
              <option>Goa</option>
              <option>Gujarat</option>
              <option>Haryana</option>
              <option>Himachal Pradesh</option>
              <option>Jharkhand</option>
              <option>Karnataka</option>
              <option>Kerala</option>
              <option>Madhya Pradesh</option>
              <option>Maharashtra</option>
              <option>Manipur</option>
              <option>Meghalaya</option>
              <option>Mizoram</option>
              <option>Nagaland</option>
              <option>Odisha</option>
              <option>Punjab</option>
              <option>Rajasthan</option>
              <option>Sikkim</option>
              <option>Tamil Nadu</option>
              <option>Telangana</option>
              <option>Tripura</option>
              <option>Uttar Pradesh</option>
              <option>Uttarakhand</option>
              <option>West Bengal</option>

              <optgroup label="Union Territories">
                <option>Andaman and Nicobar Islands</option>
                <option>Chandigarh</option>
                <option>Dadra and Nagar Haveli and Daman and Diu</option>
                <option>Delhi</option>
                <option>Jammu and Kashmir</option>
                <option>Ladakh</option>
                <option>Lakshadweep</option>
                <option>Puducherry</option>
              </optgroup>
            </AnimatedSelect>

            <FieldError error={errors.state} />
          </div>

          {/* PINCODE */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Postal Code
              <span className="text-red-500">*</span>
              <InfoTooltip text={FIELD_HELP.pincode} />
            </label>

            <AnimatedInput
              name="pincode"
              value={form.pincode}
              placeholder="Enter pincode"
              required
              onChange={handleChange}
              icon={<MapPinIcon className="h-4 w-4" />}
            />

            <FieldError error={errors.pincode} />
          </div>
        </div>
      </div>
    </section>
  );
}
