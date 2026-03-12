"use client";

import { CheckIcon } from "@heroicons/react/24/solid";

interface Props {
  currentStep: number;
  completionPercent: number;
  runnerName: string;
  scrollToSection: (id: string) => void;
}

export default function FormProgress({
  currentStep,
  completionPercent,
  runnerName,
  scrollToSection,
}: Props) {
  const steps = ["Personal", "Address", "Contact", "Emergency", "Runner Club"];

  const sectionIds = [
    "personal-section",
    "address-section",
    "contact-section",
    "emergency-section",
    "runner-section",
  ];

  const safeStep = Math.min(currentStep, steps.length - 1);

  return (
    <div id="form-progress" className="sticky top-20 z-40 bg-[#F3F6FB] py-2">
      {/* MOBILE DESIGN */}

      <div className="md:hidden">
        <div className="px-6  bg-white shadow border border-gray-200 px-4 py-4 space-y-3">
          {/* Header */}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Form Completion</span>
              <span className="text-gray-400">•</span>

              <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                {runnerName}
              </span>
            </div>

            <span className="font-semibold text-gray-900">
              {completionPercent}%
            </span>
          </div>

          {/* Progress Bar */}

          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          {/* Step Circles */}

          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-4 h-[2px] bg-gray-200" />

            {steps.map((_, index) => {
              const completed = index < safeStep;
              const active = index === safeStep;

              return (
                <div
                  key={index}
                  onClick={() => scrollToSection(sectionIds[index])}
                  className="relative flex items-center justify-center flex-1 cursor-pointer"
                >
                  <div
                    className={`z-10 w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-300
                    ${
                      completed
                        ? "bg-gradient-to-r from-red-600 to-red-800 text-white"
                        : active
                          ? "bg-gradient-to-r from-red-500 to-red-700 text-white"
                          : "bg-white border border-gray-300 text-gray-400"
                    }`}
                  >
                    {completed ? <CheckIcon className="h-4 w-4" /> : index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DESKTOP DESIGN */}

      <div className="hidden md:block max-w-6xl mx-auto">
        <div className="bg-white border border-gray-200 shadow-sm px-6 py-4 space-y-4">
          {/* Header */}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Form Completion</span>
              <span className="text-gray-400">•</span>

              <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                {runnerName}
              </span>
            </div>

            <span className="font-semibold text-gray-900">
              {completionPercent}%
            </span>
          </div>

          {/* Progress Bar */}

          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          {/* Step Navigation */}

          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const completed = index < safeStep;
              const active = index === safeStep;

              return (
                <div
                  key={step}
                  className="flex items-center flex-1 cursor-pointer"
                  onClick={() => scrollToSection(sectionIds[index])}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300
                      ${
                        completed
                          ? "bg-gradient-to-r from-red-600 to-red-800 text-white"
                          : active
                            ? "bg-gradient-to-r from-red-500 to-red-700 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {completed ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <span
                      className={`text-sm font-medium transition-colors duration-300
                      ${completed || active ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {step}
                    </span>
                  </div>

                  {index !== steps.length - 1 && (
                    <div className="flex-1 h-[2px] mx-4 bg-gray-200" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
