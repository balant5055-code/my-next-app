"use client";

import AnimatedInput from "@/components/ui/AnimatedInput";
import { useMemo, useRef, useEffect } from "react";

import {
  UsersIcon,
  ChevronDownIcon,
  TagIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import { RUNNER_CLUBS } from "@/lib/runnerClubs";

interface Props {
  form: any;
  setForm: any;
  errors: Record<string, string>;
  handleChange: (e: any) => void;

  runnerSearch: string;
  setRunnerSearch: (v: string) => void;

  showRunnerDropdown: boolean;
  setShowRunnerDropdown: (v: boolean) => void;

  dropdownRef: any;

  showTerms: boolean;
  setShowTerms: (v: boolean) => void;

  isProcessing: boolean;
  formError: string;
}

export default function RunnerClubSection({
  form,
  setForm,
  errors,
  handleChange,
  runnerSearch,
  setRunnerSearch,
  showRunnerDropdown,
  setShowRunnerDropdown,
  dropdownRef,
  showTerms,
  setShowTerms,
  isProcessing,
  formError,
}: Props) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-xs text-red-600 mt-1">{error}</p>;
  };

  /* ---------- FAST FILTERING ---------- */

  const filteredClubs = useMemo(() => {
    return RUNNER_CLUBS.filter((club) =>
      club.toLowerCase().includes(runnerSearch.toLowerCase()),
    );
  }, [runnerSearch]);

  /* ---------- AUTO FOCUS SEARCH ---------- */

  useEffect(() => {
    if (showRunnerDropdown) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [showRunnerDropdown]);

  useEffect(() => {
    if (showRunnerDropdown) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showRunnerDropdown]);

  return (
    <section className="space-y-6">
      {/* HEADER */}

      <div className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-orange-500)]/10 text-[var(--color-orange-500)] text-sm font-semibold">
          5
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Coupon & Runner Club
          </h2>

          <p className="text-xs text-gray-500">
            Optional benefits and club selection
          </p>
        </div>
      </div>

      {/* CONTENT */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* COUPON */}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Coupon Code
          </label>

          <AnimatedInput
            name="couponCode"
            value={form.couponCode}
            placeholder="Enter coupon code"
            onChange={handleChange}
            icon={<TagIcon className="h-4 w-4" />}
          />
        </div>

        {/* RUNNER CLUB */}

        <div className="space-y-1.5" ref={dropdownRef}>
          <label className="text-sm font-medium text-gray-700">
            Runner Club
          </label>

          <div className="relative">
            {/* SELECT BUTTON */}

            <div
              className="w-full cursor-pointer border border-gray-300 bg-white
  px-3 py-2.5 rounded-md text-sm
  flex items-center justify-between
  transition-all hover:border-orange-400"
              onClick={() => {
                setShowRunnerDropdown(!showRunnerDropdown);
                setRunnerSearch("");
              }}
            >
              <div className="flex items-center gap-3 text-gray-700">
                <UsersIcon className="h-4 w-4 text-gray-400 shrink-0" />

                <span className={`${!form.runnerClub && "text-gray-400"}`}>
                  {form.runnerClub || "Please Select"}
                </span>
              </div>

              <ChevronDownIcon
                className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                  showRunnerDropdown ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* DROPDOWN */}

            {showRunnerDropdown && (
              <div className="absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
                {/* SEARCH */}

                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search club..."
                  className="w-full border-b px-3 py-2 text-sm border-gray-200 outline-none"
                  value={runnerSearch}
                  onChange={(e) => setRunnerSearch(e.target.value)}
                />

                {/* CLUB LIST */}

                <div className="max-h-48 overflow-y-auto">
                  {filteredClubs.map((club) => {
                    const isSelected = form.runnerClub === club;

                    return (
                      <div
                        key={club}
                        className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between
      ${isSelected ? "bg-orange-50 text-orange-600 font-medium" : "hover:bg-orange-50"}`}
                        onClick={() => {
                          setForm((prev: any) => ({
                            ...prev,
                            runnerClub: club,
                          }));
                          setShowRunnerDropdown(false);
                          setRunnerSearch("");
                        }}
                      >
                        {club}

                        {isSelected && (
                          <span className="text-xs text-orange-500">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTHER CLUB */}

      {form.runnerClub === "Others" && (
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Runner Club Name
          </label>

          <AnimatedInput
            name="runnerClubOther"
            value={form.runnerClubOther}
            placeholder="Enter your Runner Club name"
            onChange={handleChange}
            icon={<UsersIcon className="h-4 w-4" />}
          />
        </div>
      )}

      {/* TERMS */}

      {/* DECLARATIONS */}

      <div className="space-y-3 text-sm">
        {/* MEDICAL FITNESS */}

        <label className="flex items-start gap-2 text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            name="medicallyFit"
            checked={form.medicallyFit}
            onChange={handleChange}
            className="mt-1 accent-[var(--color-orange-500)]"
          />

          <span>
            I confirm that I am medically fit to participate in this event and
            understand that participation involves physical activity and risk.
          </span>
        </label>

        <FieldError error={errors.medicallyFit} />

        {/* TERMS */}

        <label className="flex items-start gap-2 text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
            className="mt-1 accent-[var(--color-orange-500)]"
          />

          <span>
            I have read and accept the{" "}
            <span
              onClick={() => setShowTerms(true)}
              className="text-blue-600 underline cursor-pointer"
            >
              Terms and Conditions
            </span>
            <p className="text-xs text-gray-500 mt-1">
              * Additional payment gateway charges may apply
            </p>
          </span>
        </label>

        <FieldError error={errors.agree} />
      </div>

      {/* SUBMIT */}

      {formError && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          {formError}
        </p>
      )}
    </section>
  );
}
