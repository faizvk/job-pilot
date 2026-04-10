"use client";

import { useEffect, useState } from "react";
import { TemplatePreview } from "@/components/cover-letters/template-preview";

interface StepCoverLetterProps {
  coverLetterContent: string;
  onGenerate: (templateId: string) => void;
  onContentChange: (content: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepCoverLetter({ coverLetterContent, onGenerate, onContentChange, onNext, onBack }: StepCoverLetterProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    fetch("/api/cover-letters/templates")
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data);
        if (data.length > 0) setSelectedId(data[0].id);
      });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-white border rounded-lg p-4">
        <label className="text-sm font-medium">Template:</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="flex-1 border rounded-xl px-3 py-2 text-sm">
          {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button onClick={() => onGenerate(selectedId)} disabled={!selectedId} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          Generate
        </button>
      </div>

      {coverLetterContent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <textarea
            value={coverLetterContent}
            onChange={(e) => onContentChange(e.target.value)}
            className="h-[400px] border rounded-lg p-4 text-sm font-mono resize-none"
          />
          <TemplatePreview content={coverLetterContent} />
        </div>
      )}

      {templates.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No templates found. <a href="/cover-letters/new" className="text-blue-600 hover:underline">Create one first</a>.</p>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="border px-4 py-2 rounded-lg text-sm hover:bg-slate-50">Back</button>
        <button onClick={onNext} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          {coverLetterContent ? "Review & Track" : "Skip"}
        </button>
      </div>
    </div>
  );
}
