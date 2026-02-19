"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

interface PopupModalProps {
  open: boolean;
  message: string;
  type?: "error" | "success";
  onClose: () => void;
}

export default function PopupModal({
  open,
  message,
  type = "error",
  onClose,
}: PopupModalProps) {
  if (!open) return null;

  const isError = type === "error";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* MODAL CARD */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl 
        p-6 sm:p-8 animate-[fadeIn_0.25s_ease-out]"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div
            className={`h-14 w-14 rounded-full flex items-center justify-center
            ${
              isError
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {isError ? "!" : "✓"}
          </div>
        </div>

        {/* TITLE */}
        <h3
          className={`text-lg font-bold text-center mb-2 ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {isError ? "Registration Failed" : "Success"}
        </h3>

        {/* MESSAGE */}
        <p className="text-sm text-gray-600 text-center leading-relaxed">
          {message}
        </p>

        {/* BUTTON */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-semibold transition-all
              ${
                isError
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
