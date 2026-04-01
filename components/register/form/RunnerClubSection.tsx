"use client";

import AnimatedInput from "@/components/ui/AnimatedInput";
import { useMemo, useRef, useEffect } from "react";
import InfoTooltip from "@/components/ui/InfoTooltip";
import { FIELD_HELP } from "@/lib/formFieldHelp";
import {
  UsersIcon,
  UserIcon,
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
  applyCoupon: () => void;
  couponLoading: boolean;
  couponApplied: boolean;
  couponMessage: string;
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
  applyCoupon,
  couponLoading,
  couponApplied,
  couponMessage,
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

  /* ---------- AUTO SCROLL INTO VIEW (mobile fix) ---------- */

  useEffect(() => {
    if (showRunnerDropdown && dropdownRef.current) {
      dropdownRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [showRunnerDropdown, dropdownRef]);

  /* ---------- CLICK OUTSIDE ---------- */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowRunnerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, setShowRunnerDropdown]);

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
                   Coupon & {" "}
                   <span className="text-[var(--color-orange-500)]">Runner Club</span>
                 </h2>
     
                 <p className="text-xs text-gray-500 mt-[2px]">
                     Optional benefits and club selection
                 </p>
               </div>
             </div>
   
      {/* CONTENT */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* COUPON */}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            Coupon Code
            <InfoTooltip text={FIELD_HELP.couponCode} />
          </label>

          <div className="relative">
            <AnimatedInput
              name="couponCode"
              value={form.couponCode}
              placeholder="Enter coupon code"
              onChange={handleChange}
              icon={<TagIcon className="h-4 w-4" />}
            />

            <button
              type="button"
              onClick={applyCoupon}
              disabled={couponLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 
px-3 py-1.5 rounded-md text-xs font-semibold 
bg-[var(--color-orange-500)] text-white 
hover:bg-[var(--color-orange-600)] 
disabled:bg-gray-400 transition"
            >
              {couponLoading ? "..." : "Apply"}
            </button>
          </div>

          {couponMessage && (
            <p
              className={`text-xs mt-1 ${
                couponApplied ? "text-green-600" : "text-red-600"
              }`}
            >
              {couponMessage}
            </p>
          )}
        </div>

        {/* RUNNER CLUB */}

        <div className="space-y-1.5" ref={dropdownRef}>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            Running Club
            <InfoTooltip text={FIELD_HELP.runnerClub} />
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
              <div className="absolute left-0 top-full z-[80] mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
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

                <div className="max-h-60 overflow-y-auto overscroll-contain">
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
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            Other Running Club
            <InfoTooltip text={FIELD_HELP.runnerClubOther} />
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

      {/* DECLARATIONS */}

      <div className="space-y-4 text-sm">
        {/* MEDICAL FITNESS */}

        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-orange-300 cursor-pointer transition">
          <input
            type="checkbox"
            name="medicallyFit"
            checked={!!form.medicallyFit}
            onChange={handleChange}
            className="mt-[3px] shrink-0 accent-[var(--color-orange-500)]"
          />

          <div className="flex items-start gap-1 leading-relaxed text-gray-700">
            <span>
              I confirm that I am medically fit to participate in this event and
              understand that participation involves physical activity and
              associated risks.
            </span>

            <InfoTooltip text={FIELD_HELP.medicallyFit} />
          </div>
        </label>

        <FieldError error={errors.medicallyFit} />

        {/* TERMS */}

        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-orange-300 cursor-pointer transition">
          <input
            type="checkbox"
            name="agree"
            checked={!!form.agree}
            onChange={handleChange}
            className="mt-[3px] shrink-0 accent-[var(--color-orange-500)]"
          />

          <div className="flex flex-col leading-relaxed text-gray-700">
            <div className="flex flex-wrap items-center gap-1">
              <span>I have read and accept the</span>

              <span
                onClick={() => setShowTerms(true)}
                className="text-blue-600 underline cursor-pointer"
              >
                Terms & Conditions
              </span>

              <InfoTooltip text={FIELD_HELP.agree} />
            </div>

            <p className="text-xs text-gray-500 mt-1">
              * Additional payment gateway charges may apply.
            </p>
          </div>
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
