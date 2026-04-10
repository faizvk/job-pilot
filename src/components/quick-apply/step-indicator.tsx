"use client";

import { Check } from "lucide-react";

export function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-between bg-white border rounded-lg p-4">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i < currentStep
                  ? "bg-green-600 text-white"
                  : i === currentStep
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-slate-500"
              }`}
            >
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i === currentStep ? "font-medium" : "text-slate-500"}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${i < currentStep ? "bg-green-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
