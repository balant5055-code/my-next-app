"use client";

import { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  text: string;
}

export default function InfoTooltip({ text }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <InformationCircleIcon
        className="h-4 w-4 text-gray-400 cursor-pointer"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      />

      {open && (
        <div className="absolute left-5 top-0 z-50 w-56 rounded-lg bg-gray-900 text-white text-xs p-2 shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
}
