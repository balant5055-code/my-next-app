"use client";

import AnimatedInput from "@/components/ui/AnimatedInput";
import AnimatedSelect from "@/components/ui/AnimatedSelect";
import { MapPinIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import InfoTooltip from "@/components/ui/InfoTooltip";
import { FIELD_HELP } from "@/lib/formFieldHelp";

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
      <div className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-orange-500)]/10 text-[var(--color-orange-500)] text-sm font-semibold">
          2
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Address Details
          </h2>
          <p className="text-xs text-gray-500">Where should we contact you?</p>
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
