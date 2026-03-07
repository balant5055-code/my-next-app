"use client";
import React from "react";
import AnimatedInput from "@/components/ui/AnimatedInput";
import AnimatedSelect from "@/components/ui/AnimatedSelect";
import AnimatedRadioGroup from "@/components/ui/AnimatedRadioGroup";
import DateOfBirthInput from "@/components/ui/DateOfBirthInput";

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
}

function PersonalDetails({ form, errors, handleChange }: Props) {
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-xs text-red-600 mt-1">{error}</p>;
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-orange-500)]/10 text-[var(--color-orange-500)] text-sm font-semibold">
          1
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Personal Details
          </h2>
          <p className="text-xs text-gray-500">Tell us about the runner</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-5">
        {/* FIRST + LAST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>

            <AnimatedInput
              name="firstName"
              value={form.firstName}
              placeholder="Enter first name"
              required
              onChange={handleChange}
              icon={<UserIcon className="h-4 w-4" />}
            />

            <FieldError error={errors.firstName} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>

            <AnimatedInput
              name="lastName"
              value={form.lastName}
              placeholder="Enter last name"
              required
              onChange={handleChange}
              icon={<UserIcon className="h-4 w-4" />}
            />

            <FieldError error={errors.lastName} />
          </div>
        </div>

        {/* DOB + GENDER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>

            <DateOfBirthInput
              name="dob"
              value={form.dob}
              required
              onChange={handleChange}
            />

            <FieldError error={errors.dob} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Biological Gender <span className="text-red-500">*</span>
            </label>

            <AnimatedRadioGroup
              name="gender"
              required
              value={form.gender}
              options={["Male", "Female", "Other"]}
              onChange={handleChange}
            />

            <FieldError error={errors.gender} />
          </div>
        </div>

        {/* BLOOD + BIB NAME */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Blood Group <span className="text-red-500">*</span>
            </label>

            <AnimatedSelect
              name="bloodGroup"
              value={form.bloodGroup}
              required
              onChange={handleChange}
              icon={<HeartIcon className="h-4 w-4" />}
            >
              <option value="">Select Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>O+</option>
              <option>O-</option>
              <option>AB+</option>
              <option>AB-</option>
            </AnimatedSelect>

            <FieldError error={errors.bloodGroup} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Name to appear on Race Bib <span className="text-red-500">*</span>
            </label>

            <AnimatedInput
              name="bibName"
              value={form.bibName}
              placeholder="Enter name to print on bib"
              required
              onChange={handleChange}
              icon={<IdentificationIcon className="h-4 w-4" />}
            />

            <FieldError error={errors.bibName} />

            <p className="text-xs text-gray-400">
              {form.bibName.length}/12 characters
            </p>
          </div>
        </div>

        {/* TSHIRT */}
        <div className="space-y-1.5 max-w-sm">
          <label className="text-sm font-medium text-gray-700">
            T-Shirt Size <span className="text-red-500">*</span>
          </label>

          <AnimatedSelect
            name="tshirtSize"
            value={form.tshirtSize}
            required
            onChange={handleChange}
            icon={<TicketIcon className="h-4 w-4" />}
          >
            <option value="">Please Select</option>
            <option>XS</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
            <option>XXL</option>
            <option>3XL</option>

            <optgroup label="Kids">
              <option>2-4 Yrs — 24 inches</option>
              <option>4-5 Yrs — 26 inches</option>
              <option>5-7 Yrs — 28 inches</option>
              <option>7-8 Yrs — 30 inches</option>
              <option>8-10 Yrs — 32 inches</option>
            </optgroup>
          </AnimatedSelect>

          <FieldError error={errors.tshirtSize} />
        </div>
      </div>
    </section>
  );
}

export default React.memo(PersonalDetails);
