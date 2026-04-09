"use client";

import { useState } from "react";
import {
  ClipboardPaste, Sparkles, Loader2, Briefcase, MapPin, Monitor,
  Code2, CheckCircle, XCircle, FileText, ChevronDown, ChevronUp,
  Copy, Check, AlertTriangle,
} from "lucide-react";

interface ExtractedJob {
  jobTitle: string;
  companyName: string;
  location: string;
  workType: string;
  description: string;
  requirements: string[];
  techStack: string[];
  experienceLevel: string;
  salary: string;
}

interface AnalysisResult {
  extracted: ExtractedJob;
  resumeSuggestions: string | null;
  hasBaseResume: boolean;
  skillMatch: {
    matched: string[];
    missing: string[];
    score: number;
  };
}

export default function SmartPastePage() {
  const [rawText, setRawText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [generatingCL, setGeneratingCL] = useState(false);
  const [tone, setTone] = useState<"professional" | "technical" | "casual">("professional");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    setCoverLetter(null);

    try {
      const res = await fetch("/api/smart-paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, action: "analyze" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!result) return;
    setGeneratingCL(true);
    setCoverLetter(null);

    try {
      const res = await fetch("/api/smart-paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          action: "cover-letter",
          jobTitle: result.extracted.jobTitle,
          companyName: result.extracted.companyName,
          description: result.extracted.description,
          tone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoverLetter(data.coverLetter);
    } catch (err: any) {
      setError(err.message || "Cover letter generation failed");
    } finally {
      setGeneratingCL(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor =
    (result?.skillMatch.score ?? 0) >= 70
      ? "text-emerald-600 bg-emerald-50"
      : (result?.skillMatch.score ?? 0) >= 40
        ? "text-amber-600 bg-amber-50"
        : "text-red-500 bg-red-50";

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">Smart Paste</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Paste any job posting — we&apos;ll extract details, match your resume, and generate a cover letter
        </p>
      </div>

      {/* Paste Area */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <ClipboardPaste className="w-4 h-4 text-indigo-500" />
          Paste Job Posting
        </div>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste the full job posting here — title, description, requirements, anything you copied from the job page..."
          rows={8}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-y"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {rawText.length > 0 ? `${rawText.length.toLocaleString()} characters` : "Supports messy copy-paste from any job site"}
          </span>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !rawText.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-4">
          {/* Extracted Job Info */}
          <div className="bg-white border border-gray-200/80 rounded-xl shadow-card p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Extracted Job Details</h2>

            <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
              <div>
                <p className="text-xs text-gray-500">Job Title</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  {result.extracted.jobTitle}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Company</p>
                <p className="text-sm font-medium text-gray-800">{result.extracted.companyName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {result.extracted.location}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Work Type</p>
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-gray-400" />
                  {result.extracted.workType}
                </p>
              </div>
              {result.extracted.salary !== "Not specified" && (
                <div>
                  <p className="text-xs text-gray-500">Salary</p>
                  <p className="text-sm text-gray-700">{result.extracted.salary}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Level</p>
                <p className="text-sm text-gray-700 capitalize">{result.extracted.experienceLevel}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Summary</p>
              <p className="text-sm text-gray-700 leading-relaxed">{result.extracted.description}</p>
            </div>

            {result.extracted.techStack.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5" /> Tech Stack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.extracted.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.extracted.requirements.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Key Requirements</p>
                <ul className="space-y-1">
                  {result.extracted.requirements.map((req, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Skill Match */}
          <div className="bg-white border border-gray-200/80 rounded-xl shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Skill Match</h2>
              <span className={`text-lg font-bold px-3 py-1 rounded-lg ${scoreColor}`}>
                {result.skillMatch.score}%
              </span>
            </div>

            {result.skillMatch.matched.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Skills You Have
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.skillMatch.matched.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.skillMatch.missing.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-400" /> Skills to Highlight or Learn
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.skillMatch.missing.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resume Suggestions */}
          {result.resumeSuggestions ? (
            <div className="bg-white border border-gray-200/80 rounded-xl shadow-card p-5 space-y-3">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="flex items-center justify-between w-full"
              >
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Resume Suggestions
                </h2>
                {showSuggestions ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {showSuggestions && (
                <div className="space-y-2.5 pt-1">
                  {result.resumeSuggestions.split(/\d+\.\s+/).filter(Boolean).map((suggestion, i) => {
                    const match = suggestion.match(/^\[(.+?)\]\s*[-–]\s*([\s\S]*)/);
                    const category = match?.[1] || "Suggestion";
                    const text = match?.[2] || suggestion;
                    return (
                      <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0 mt-0.5">
                          {category}
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed">{text.trim()}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : !result.hasBaseResume ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                No base resume found. <a href="/resumes/new" className="underline font-medium">Create one</a> to get personalized resume suggestions.
              </p>
            </div>
          ) : null}

          {/* Cover Letter Generator */}
          <div className="bg-white border border-gray-200/80 rounded-xl shadow-card p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Generate Cover Letter</h2>

            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-600">Tone:</label>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {(["professional", "technical", "casual"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-all capitalize ${
                      tone === t
                        ? "bg-white shadow-xs font-medium text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenerateCoverLetter}
                disabled={generatingCL}
                className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
              >
                {generatingCL ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generatingCL ? "Generating..." : "Generate"}
              </button>
            </div>

            {coverLetter && (
              <div className="relative">
                <button
                  onClick={() => handleCopy(coverLetter)}
                  className="absolute top-3 right-3 p-1.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 pr-12 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed max-h-96 overflow-y-auto">
                  {coverLetter}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
