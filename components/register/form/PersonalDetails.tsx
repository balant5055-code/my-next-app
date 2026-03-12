"use client";
import React from "react";
import AnimatedInput from "@/components/ui/AnimatedInput";
import AnimatedSelect from "@/components/ui/AnimatedSelect";
import AnimatedRadioGroup from "@/components/ui/AnimatedRadioGroup";
import DateOfBirthInput from "@/components/ui/DateOfBirthInput";
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
  categories: any[];
  runnerIndex: number;
}

function PersonalDetails({
  form,
  errors,
  handleChange,
  categories,
  runnerIndex,
}: Props) {
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-xs text-red-600 mt-1">{error}</p>;
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center bg-gray-50 rounded-lg px-5 py-4 gap-3">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
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
              Personal{" "}
              <span className="text-[var(--color-orange-500)]">Details</span>
            </h2>

            <p className="text-xs text-gray-500 mt-[2px]">
              Tell us about the runner
            </p>
          </div>
        </div>
        {/* CATEGORY DROPDOWN */}
        {runnerIndex > 0 && (
          <div className="md:w-[220px] ml-auto">
            <AnimatedSelect
              name="categoryId"
              value={form.categoryId}
              className="text-sm"
              icon={<TicketIcon className="h-4 w-4 text-gray-400" />}
              onChange={(e: any) => {
                const selected = categories.find(
                  (c) => c.id === e.target.value,
                );

                if (!selected) return;

                handleChange({
                  target: { name: "categoryId", value: selected.id },
                });

                handleChange({
                  target: { name: "categoryTitle", value: selected.title },
                });

                handleChange({
                  target: {
                    name: "categoryDistance",
                    value: selected.distance,
                  },
                });

                handleChange({
                  target: { name: "categoryPrice", value: selected.price },
                });
              }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </AnimatedSelect>
          </div>
        )}
      </div>
      {/* CONTENT */}
      <div className="space-y-6">
        {/* FIRST + LAST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              First Name
              <span className="text-red-500">*</span>
              <InfoTooltip text={FIELD_HELP.firstName} />
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
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Last Name
              <span className="text-red-500">*</span>
              <InfoTooltip text={FIELD_HELP.lastName} />
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
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Date of Birth
              <span className="text-red-500">*</span>
              <InfoTooltip text={FIELD_HELP.dob} />
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
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Biological Gender
              <span className="text-red-500">*</span>
              <InfoTooltip text={FIELD_HELP.gender} />
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
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Blood Group
              <span className="text-red-500">*</span>
              <InfoTooltip text={FIELD_HELP.bloodGroup} />
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
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Name to appear on Race Bib
              <span className="text-red-500">*</span>
              <InfoTooltip text={FIELD_HELP.bibName} />
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
              {form?.bibName?.length || 0}/12 characters
            </p>
          </div>
        </div>

        {/* TSHIRT */}
        <div className="space-y-1.5 md:max-w-xs">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            T-Shirt Size
            <span className="text-red-500">*</span>
            <InfoTooltip text={FIELD_HELP.tshirtSize} />
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
