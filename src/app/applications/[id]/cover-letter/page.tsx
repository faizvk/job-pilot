"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TemplatePreview } from "@/components/cover-letters/template-preview";
import { Sparkles, FileText, Copy, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ApplicationCoverLetterPage() {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTone, setAiTone] = useState<"professional" | "technical" | "casual">("professional");
  const [copied, setCopied] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/applications/${id}`).then((r) => r.json()),
      fetch("/api/cover-letters/templates").then((r) => r.json()),
      fetch("/api/ai/status").then((r) => r.json()).catch(() => ({ gemini: false })),
    ])
      .then(([appData, templateData, aiStatus]) => {
        setApp(appData);
        setTemplates(templateData);
        setAiAvailable(aiStatus.ai);
        if (appData.coverLetter) {
          setGeneratedContent(appData.coverLetter.content);
          setSelectedTemplateId(appData.coverLetter.templateId || "");
        } else if (templateData.length > 0) {
          setSelectedTemplateId(templateData[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleGenerate = async () => {
    if (!selectedTemplateId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/cover-letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplateId, applicationId: id }),
      });
      const data = await res.json();
      setGeneratedContent(data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAIGenerate = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, tone: aiTone }),
      });
      const data = await res.json();
      if (data.content) setGeneratedContent(data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-64 bg-gray-100 rounded-lg animate-shimmer" />
        <div className="h-20 bg-gray-100 rounded-xl animate-shimmer" />
        <div className="h-96 bg-gray-100 rounded-xl animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/applications/${id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cover Letter</h1>
            <p className="text-sm text-gray-500">{app?.jobTitle} at {app?.companyName}</p>
          </div>
        </div>
        {generatedContent && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        )}
      </div>

      {/* Generation Options */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Template-based generation */}
        <div>
          <h3 className="text-[13px] font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" /> Template-Based
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            >
              <option value="">Select a template</option>
              {templates.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={!selectedTemplateId || generating}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* AI generation */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-[13px] font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> AI-Powered
            {!aiAvailable && <span className="text-[10px] text-gray-400 font-normal">(Set GEMINI_API_KEY or GROQ_API_KEY in .env)</span>}
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            >
              <option value="professional">Professional</option>
              <option value="technical">Technical</option>
              <option value="casual">Casual / Startup</option>
            </select>
            <button
              onClick={handleAIGenerate}
              disabled={!aiAvailable || aiGenerating}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 shadow-sm transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              {aiGenerating ? "Writing..." : "Generate with AI"}
            </button>
          </div>
        </div>
      </div>

      {generatedContent ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Edit</h3>
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="w-full h-[500px] border border-gray-200 rounded-xl p-4 text-sm font-mono resize-none shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Preview</h3>
            <TemplatePreview content={generatedContent} />
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No cover letter yet</p>
          <p className="text-sm text-gray-400 mt-1">Choose a template or use AI to generate one</p>
        </div>
      )}
    </div>
  );
}
