"use client";

import { CheckIcon } from "@heroicons/react/24/solid";

interface Props {
  currentStep: number;
}

export default function FormProgress({ currentStep }: Props) {
  const steps = ["Personal", "Address", "Contact", "Emergency", "Runner Club"];

  const safeStep = Math.min(currentStep, steps.length - 1);

  const currentTitle = steps[safeStep];

  return (
    <div
      id="form-progress"
      className="hidden lg:block sticky top-20 z-40 bg-[#F3F6FB] py-2"
    >
      {/* MOBILE DESIGN */}

      <div className="md:hidden px-4">
        <div className="bg-white rounded-2xl shadow border border-gray-200 px-5 py-5">
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500">
              Step {safeStep + 1} of {steps.length}
            </p>

            <p className="text-sm font-semibold text-gray-900">
              {currentTitle}
            </p>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-4 h-[2px] bg-gray-200" />

            {steps.map((_, index) => {
              const completed = index < safeStep;
              const active = index === safeStep;

              return (
                <div
                  key={index}
                  className="relative flex items-center justify-center flex-1"
                >
                  <div
                    className={`z-10 w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold
                  ${
                    completed
                      ? "bg-green-600 text-white"
                      : active
                        ? "bg-green-500 text-white"
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

      <div className="hidden md:block max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const completed = index < safeStep;
              const active = index === safeStep;

              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                    ${
                      completed
                        ? "bg-green-600 text-white"
                        : active
                          ? "bg-green-500 text-white"
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
                      className={`text-sm font-medium
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
