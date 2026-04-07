"use client";

import type { JdAnalysis } from "@/types";
import { MatchScoreRing } from "@/components/jd-analyzer/match-score-ring";
import { SkillComparison } from "@/components/jd-analyzer/skill-comparison";
import { ExtractedSkills } from "@/components/jd-analyzer/extracted-skills";

interface StepAnalyzeProps {
  analysis: JdAnalysis | null;
  onNext: () => void;
  onBack: () => void;
}

export function StepAnalyze({ analysis, onNext, onBack }: StepAnalyzeProps) {
  if (!analysis) return <p className="text-gray-500">No analysis data.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6 flex justify-center">
          <MatchScoreRing score={analysis.matchScore} />
        </div>
        <div className="md:col-span-2 bg-white border rounded-lg p-6">
          <h3 className="font-medium mb-3">Extracted Skills ({analysis.extractedSkills.length})</h3>
          <ExtractedSkills skills={analysis.extractedSkills} />
        </div>
      </div>

      <SkillComparison matched={analysis.matchedSkills} missing={analysis.missingSkills} />

      {analysis.experienceRequirements.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-medium mb-2">Experience Requirements</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {analysis.experienceRequirements.map((req, i) => <li key={i}>{req}</li>)}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Back</button>
        <button onClick={onNext} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Continue to Resume</button>
      </div>
    </div>
  );
}
