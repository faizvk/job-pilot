"use client";

import { useEffect, useState } from "react";
import { ResumePreview } from "@/components/resumes/resume-preview";

interface StepTailorResumeProps {
  tailoredContent: string;
  onTailor: (baseResumeId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepTailorResume({ tailoredContent, onTailor, onNext, onBack }: StepTailorResumeProps) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((data) => {
        setResumes(data);
        if (data.length > 0) {
          const base = data.find((r: any) => r.isBase) || data[0];
          setSelectedId(base.id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white border rounded-lg p-4">
        <label className="text-sm font-medium">Base Resume:</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="flex-1 border rounded-xl px-3 py-2 text-sm">
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>{r.name} {r.isBase ? "(Base)" : ""}</option>
          ))}
        </select>
        <button onClick={() => onTailor(selectedId)} disabled={!selectedId} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          Tailor
        </button>
      </div>

      {tailoredContent && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-2">Tailored Resume Preview</h3>
          <ResumePreview content={tailoredContent} />
        </div>
      )}

      {resumes.length === 0 && !loading && (
        <div className="text-center py-8 text-slate-500">
          <p>No resumes found. <a href="/resumes/new" className="text-blue-600 hover:underline">Create one first</a>.</p>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="border px-4 py-2 rounded-lg text-sm hover:bg-slate-50">Back</button>
        <button onClick={onNext} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          {tailoredContent ? "Continue to Cover Letter" : "Skip"}
        </button>
      </div>
    </div>
  );
}
