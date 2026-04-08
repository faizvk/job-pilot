"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PrepNotesEditor } from "@/components/interview-prep/prep-notes-editor";
import { QuestionList } from "@/components/interview-prep/question-list";
import { ResearchLinks } from "@/components/interview-prep/research-links";
import { Sparkles, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

export default function InterviewPrepPage() {
  const { id } = useParams();
  const [prep, setPrep] = useState<any>(null);
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/interview-prep/${id}`).then((r) => r.json()),
      fetch(`/api/applications/${id}`).then((r) => r.json()),
      fetch("/api/ai/status").then((r) => r.json()).catch(() => ({ gemini: false })),
    ])
      .then(([prepData, appData, aiStatus]) => {
        setPrep(prepData);
        setApp(appData);
        setAiAvailable(aiStatus.gemini);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (field: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/interview-prep/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...prep, [field]: value }),
      });
      const data = await res.json();
      setPrep(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/interview-prep/${id}/generate`, { method: "POST" });
      const questions = await res.json();
      setPrep((p: any) => ({ ...p, questions: JSON.stringify(questions) }));
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAIGenerate = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id }),
      });
      const questions = await res.json();
      if (Array.isArray(questions)) {
        setPrep((p: any) => ({ ...p, questions: JSON.stringify(questions) }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-64 bg-gray-100 rounded-lg animate-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="h-64 bg-gray-100 rounded-xl animate-shimmer" />
            <div className="h-32 bg-gray-100 rounded-xl animate-shimmer" />
          </div>
          <div className="h-96 bg-gray-100 rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/applications/${id}`}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Interview Prep</h1>
            <p className="text-sm text-gray-500">
              {app?.jobTitle} at {app?.companyName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(saving || saved) && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              {saved ? <><Check className="w-3 h-3 text-emerald-500" /> Saved</> : "Saving..."}
            </span>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 shadow-xs transition-all active:scale-[0.98]"
          >
            {generating ? "Generating..." : "Quick Generate"}
          </button>
          <button
            onClick={handleAIGenerate}
            disabled={!aiAvailable || aiGenerating}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 shadow-sm transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            {aiGenerating ? "AI Generating..." : "Generate with AI"}
          </button>
        </div>
      </div>

      {!app?.jobDescription && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          This application has no job description. Add one to get better auto-generated questions.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PrepNotesEditor
            notes={prep?.notes || ""}
            onChange={(notes) => handleSave("notes", notes)}
          />
          <ResearchLinks
            links={prep?.researchLinks || "[]"}
            onChange={(links) => handleSave("researchLinks", links)}
          />
        </div>
        <QuestionList
          questions={prep?.questions || "[]"}
          onChange={(questions) => handleSave("questions", questions)}
        />
      </div>
    </div>
  );
}
