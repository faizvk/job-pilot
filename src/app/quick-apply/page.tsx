"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/quick-apply/step-indicator";
import { StepPasteJd } from "@/components/quick-apply/step-paste-jd";
import { StepAnalyze } from "@/components/quick-apply/step-analyze";
import { StepTailorResume } from "@/components/quick-apply/step-tailor-resume";
import { StepCoverLetter } from "@/components/quick-apply/step-cover-letter";
import { StepTrack } from "@/components/quick-apply/step-track";
import type { JdAnalysis, QuickApplyState } from "@/types";

const STEPS = ["Paste JD", "Analyze", "Resume", "Cover Letter", "Track"];

export default function QuickApplyPage() {
  const [state, setState] = useState<QuickApplyState>({
    step: 0,
    jobDescription: "",
    analysis: null,
    selectedResumeId: "",
    tailoredContent: "",
    coverLetterContent: "",
    applicationData: {
      companyName: "",
      jobTitle: "",
      jobUrl: "",
      location: "",
      workType: "",
      salaryMin: null,
      salaryMax: null,
    },
  });

  const updateState = (updates: Partial<QuickApplyState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => updateState({ step: Math.min(state.step + 1, 4) });
  const prevStep = () => updateState({ step: Math.max(state.step - 1, 0) });

  const handleAnalyze = async () => {
    const res = await fetch("/api/analyze-jd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription: state.jobDescription }),
    });
    const analysis: JdAnalysis = await res.json();
    updateState({ analysis, step: 1 });
  };

  const handleTailor = async (baseResumeId: string) => {
    // First create the application to get an ID
    const appRes = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...state.applicationData,
        jobDescription: state.jobDescription,
        status: "saved",
        matchScore: state.analysis?.matchScore,
        extractedSkills: JSON.stringify(state.analysis?.extractedSkills || []),
      }),
    });
    const app = await appRes.json();

    const res = await fetch(`/api/resumes/${baseResumeId}/tailor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: app.id, baseResumeId }),
    });
    const data = await res.json();
    updateState({
      selectedResumeId: baseResumeId,
      tailoredContent: data.content,
      step: 2,
      applicationData: { ...state.applicationData },
    });
  };

  const handleGenerateCoverLetter = async (templateId: string) => {
    const res = await fetch("/api/cover-letters/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, applicationId: "" }),
    });
    if (res.ok) {
      const data = await res.json();
      updateState({ coverLetterContent: data.content, step: 3 });
    } else {
      nextStep();
    }
  };

  const handleTrack = async () => {
    // Application was already created in the tailor step
    // Just update the status to "applied"
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quick Apply</h1>
        <p className="text-gray-500">Streamlined workflow to apply faster with quality</p>
      </div>

      <StepIndicator steps={STEPS} currentStep={state.step} />

      {state.step === 0 && (
        <StepPasteJd
          jobDescription={state.jobDescription}
          applicationData={state.applicationData}
          onJobDescriptionChange={(jd) => updateState({ jobDescription: jd })}
          onApplicationDataChange={(data) =>
            updateState({ applicationData: { ...state.applicationData, ...data } })
          }
          onAnalyze={handleAnalyze}
        />
      )}

      {state.step === 1 && (
        <StepAnalyze
          analysis={state.analysis}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {state.step === 2 && (
        <StepTailorResume
          tailoredContent={state.tailoredContent}
          onTailor={handleTailor}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {state.step === 3 && (
        <StepCoverLetter
          coverLetterContent={state.coverLetterContent}
          onGenerate={handleGenerateCoverLetter}
          onContentChange={(content) => updateState({ coverLetterContent: content })}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {state.step === 4 && (
        <StepTrack
          state={state}
          onTrack={handleTrack}
          onBack={prevStep}
        />
      )}
    </div>
  );
}
