"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface DateOfBirthInputProps {
  name: string;
  value: string;
  required?: boolean;
  onChange: (e: any) => void;
}

export default function DateOfBirthInput({
  name,
  value,
  required,
  onChange,
}: DateOfBirthInputProps) {
  const selectedDate = value ? new Date(value) : null;
  const today = new Date();

  return (
    <div className="relative w-full z-20">
      {/* Icon */}
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-30">
        <CalendarIcon className="h-5 w-5" />
      </span>

      <DatePicker
        wrapperClassName="w-full" // 🔥 IMPORTANT
        selected={selectedDate}
        onChange={(date: Date | null) => {
          const formatted = date ? date.toISOString().split("T")[0] : "";

          onChange({
            target: {
              name,
              value: formatted,
            },
          });
        }}
        maxDate={today}
        dateFormat="dd/MM/yyyy"
        showYearDropdown
        dropdownMode="select"
        required={required}
        popperPlacement="bottom-start"
        popperProps={{
          strategy: "fixed",
        }}
        popperClassName="z-[9999]"
        className="
          w-full block   /* 🔥 VERY IMPORTANT */
          border border-gray-300 bg-white py-3
          pl-12 pr-4 text-sm  transition
          focus:border-orange-500 focus:outline-none
          focus:ring-2 focus:ring-orange-200
        "
        calendarClassName="shadow-xl border border-gray-200 "
      />
    </div>
  );
}
