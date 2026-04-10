"use client";

import { useRouter } from "next/navigation";
import type { QuickApplyState } from "@/types";
import { Check } from "lucide-react";

interface StepTrackProps {
  state: QuickApplyState;
  onTrack: () => void;
  onBack: () => void;
}

export function StepTrack({ state, onTrack, onBack }: StepTrackProps) {
  const router = useRouter();

  const handleComplete = async () => {
    await onTrack();
    router.push("/applications");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Application Summary</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Company:</span>
            <p className="font-medium">{state.applicationData.companyName}</p>
          </div>
          <div>
            <span className="text-slate-500">Position:</span>
            <p className="font-medium">{state.applicationData.jobTitle}</p>
          </div>
          {state.applicationData.location && (
            <div>
              <span className="text-slate-500">Location:</span>
              <p className="font-medium">{state.applicationData.location}</p>
            </div>
          )}
          {state.analysis && (
            <div>
              <span className="text-slate-500">Match Score:</span>
              <p className="font-medium">{state.analysis.matchScore}%</p>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Check className={`w-4 h-4 ${state.analysis ? "text-green-600" : "text-slate-300"}`} />
            <span className={state.analysis ? "" : "text-slate-400"}>Job Description Analyzed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className={`w-4 h-4 ${state.tailoredContent ? "text-green-600" : "text-slate-300"}`} />
            <span className={state.tailoredContent ? "" : "text-slate-400"}>Resume Tailored</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className={`w-4 h-4 ${state.coverLetterContent ? "text-green-600" : "text-slate-300"}`} />
            <span className={state.coverLetterContent ? "" : "text-slate-400"}>Cover Letter Generated</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="border px-4 py-2 rounded-lg text-sm hover:bg-slate-50">Back</button>
        <button onClick={handleComplete} className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium">
          Save & Track Application
        </button>
      </div>
    </div>
  );
}
