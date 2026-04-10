"use client";

import { useState, useRef } from "react";
import {
  ClipboardPaste, Sparkles, Loader2, Briefcase, MapPin, Monitor,
  Code2, CheckCircle, XCircle, FileText, ChevronDown, ChevronUp,
  Copy, Check, AlertTriangle, Plus, Download, Eye, Zap, ExternalLink,
  Save,
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

export default function QuickApplyPage() {
  const [rawText, setRawText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [generatingCL, setGeneratingCL] = useState(false);
  const [tone, setTone] = useState<"professional" | "technical" | "casual">("professional");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [addingSkills, setAddingSkills] = useState(false);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [generatingResume, setGeneratingResume] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);
  const [hasOriginalFile, setHasOriginalFile] = useState(false);
  const [isLatex, setIsLatex] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  // Track application state
  const [jobUrl, setJobUrl] = useState("");
  const [savingApp, setSavingApp] = useState(false);
  const [savedApp, setSavedApp] = useState<{ id: string } | null>(null);

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    setCoverLetter(null);
    setSelectedSkills(new Set());
    setAddedSkills(new Set());
    setSelectedSuggestions(new Set());
    setGeneratedResume(null);
    setShowResumePreview(false);
    setSavedResumeId(null);
    setHasOriginalFile(false);
    setIsLatex(false);
    setSavedApp(null);

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

  const toggleSkillSelection = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const selectAllMissing = () => {
    if (!result) return;
    const allMissing = result.skillMatch.missing;
    const allSelected = allMissing.every((s) => selectedSkills.has(s));
    if (allSelected) {
      setSelectedSkills(new Set());
    } else {
      setSelectedSkills(new Set(allMissing));
    }
  };

  const handleAddSkillsToProfile = async () => {
    if (selectedSkills.size === 0) return;
    setAddingSkills(true);
    const newlyAdded = new Set(addedSkills);

    const skillsToAdd = Array.from(selectedSkills);
    for (const skillName of skillsToAdd) {
      if (addedSkills.has(skillName)) continue;
      try {
        const res = await fetch("/api/profile/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: skillName.charAt(0).toUpperCase() + skillName.slice(1),
            category: "technical",
            level: "beginner",
          }),
        });
        if (res.ok) newlyAdded.add(skillName);
      } catch {
        // skip failures
      }
    }

    setAddedSkills(newlyAdded);
    setSelectedSkills(new Set());
    setAddingSkills(false);
  };

  const toggleSuggestion = (index: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const parsedSuggestions = result?.resumeSuggestions
    ? result.resumeSuggestions.split(/\d+\.\s+/).filter(Boolean).map((s) => {
        const match = s.match(/^\[(.+?)\]\s*[-–]\s*([\s\S]*)/);
        return {
          category: match?.[1] || "Suggestion",
          text: (match?.[2] || s).trim(),
          raw: s.trim(),
        };
      })
    : [];

  const handleGenerateResume = async () => {
    if (selectedSuggestions.size === 0 || !result) return;
    setGeneratingResume(true);
    setGeneratedResume(null);

    const suggestionsToApply = Array.from(selectedSuggestions).map(
      (i) => parsedSuggestions[i]?.raw || ""
    );

    try {
      const res = await fetch("/api/smart-paste/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestions: suggestionsToApply,
          jobTitle: result.extracted.jobTitle,
          companyName: result.extracted.companyName,
          techStack: result.extracted.techStack,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGeneratedResume(data.resume);
      setSavedResumeId(data.savedId || null);
      setHasOriginalFile(!!data.originalFilePath);
      setIsLatex(!!data.isLatex);
      setShowResumePreview(true);
    } catch (err: any) {
      setError(err.message || "Resume generation failed");
    } finally {
      setGeneratingResume(false);
    }
  };

  const handleSaveApplication = async () => {
    if (!result) return;
    setSavingApp(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: result.extracted.companyName,
          jobTitle: result.extracted.jobTitle,
          jobUrl: jobUrl || undefined,
          jobDescription: rawText,
          location: result.extracted.location,
          workType: result.extracted.workType.toLowerCase(),
          status: "applied",
          matchScore: result.skillMatch.score,
          extractedSkills: JSON.stringify(result.extracted.techStack),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSavedApp(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingApp(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!generatedResume) return;
    const html = markdownToHtml(generatedResume);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${result?.extracted.companyName || "Tailored"}</title>
        <style>
          @page { margin: 0.6in 0.7in; size: letter; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; line-height: 1.5; font-size: 11pt; }
          h1 { font-size: 20pt; margin: 0 0 4px; color: #111; }
          h2 { font-size: 12pt; color: #4f46e5; border-bottom: 1.5px solid #e5e7eb; padding-bottom: 3px; margin: 14px 0 6px; text-transform: uppercase; letter-spacing: 0.5px; }
          h3 { font-size: 11pt; margin: 8px 0 2px; color: #333; }
          p { margin: 2px 0; }
          ul { margin: 2px 0; padding-left: 18px; }
          li { margin: 1px 0; font-size: 10.5pt; }
          .contact { color: #555; font-size: 10pt; margin-bottom: 8px; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const scoreColor =
    (result?.skillMatch.score ?? 0) >= 70
      ? "text-emerald-600 bg-emerald-50"
      : (result?.skillMatch.score ?? 0) >= 40
        ? "text-amber-600 bg-amber-50"
        : "text-red-500 bg-red-50";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white shadow-lg shadow-indigo-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%221%22%20cy%3D%221%22%20r%3D%221%22%20fill%3D%22rgba(255%2C255%2C255%2C0.07)%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5" />
            <h1 className="text-2xl font-bold tracking-tight">Quick Apply</h1>
          </div>
          <p className="text-indigo-100 text-sm">Paste any job posting — analyze, tailor resume, generate cover letter, and track your application</p>
        </div>
      </div>

      {/* Paste Area */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <ClipboardPaste className="w-4 h-4 text-indigo-500" />
          Paste Job Posting
        </div>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste the full job posting here — title, description, requirements, anything you copied from the job page..."
          rows={8}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-y"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {rawText.length > 0 ? `${rawText.length.toLocaleString()} characters` : "Supports messy copy-paste from any job site"}
          </span>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !rawText.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.97]"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-4 stagger-children">
          {/* Extracted Job Info */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-card p-5 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Extracted Job Details</h2>

            <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
              <div>
                <p className="text-xs text-slate-500">Job Title</p>
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  {result.extracted.jobTitle}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Company</p>
                <p className="text-sm font-medium text-slate-800">{result.extracted.companyName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {result.extracted.location}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Work Type</p>
                <p className="text-sm text-slate-700 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  {result.extracted.workType}
                </p>
              </div>
              {result.extracted.salary !== "Not specified" && (
                <div>
                  <p className="text-xs text-slate-500">Salary</p>
                  <p className="text-sm text-slate-700">{result.extracted.salary}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500">Level</p>
                <p className="text-sm text-slate-700 capitalize">{result.extracted.experienceLevel}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Summary</p>
              <p className="text-sm text-slate-700 leading-relaxed">{result.extracted.description}</p>
            </div>

            {result.extracted.techStack.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5" /> Tech Stack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.extracted.techStack.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.extracted.requirements.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Key Requirements</p>
                <ul className="space-y-1">
                  {result.extracted.requirements.map((req, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Skill Match */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Skill Match</h2>
              <span className={`text-lg font-bold px-3 py-1 rounded-xl ${scoreColor}`}>
                {result.skillMatch.score}%
              </span>
            </div>

            {result.skillMatch.matched.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Skills You Have
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.skillMatch.matched.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.skillMatch.missing.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-red-400" /> Skills to Highlight or Learn
                  </p>
                  <button onClick={selectAllMissing} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    {result.skillMatch.missing.every((s) => selectedSkills.has(s)) ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.skillMatch.missing.map((s) => {
                    const isAdded = addedSkills.has(s);
                    const isSelected = selectedSkills.has(s);
                    return (
                      <button
                        key={s}
                        onClick={() => !isAdded && toggleSkillSelection(s)}
                        disabled={isAdded}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isAdded
                            ? "bg-emerald-50 text-emerald-600 cursor-default"
                            : isSelected
                              ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400/50"
                              : "bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                        }`}
                      >
                        {isAdded ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> {s}</span> : s}
                      </button>
                    );
                  })}
                </div>
                {selectedSkills.size > 0 && (
                  <button
                    onClick={handleAddSkillsToProfile}
                    disabled={addingSkills}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.97]"
                  >
                    {addingSkills ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Add {selectedSkills.size} skill{selectedSkills.size > 1 ? "s" : ""} to profile
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Resume Suggestions */}
          {result.resumeSuggestions ? (
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowSuggestions(!showSuggestions)} className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Resume Suggestions
                  </h2>
                  {showSuggestions ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {parsedSuggestions.length > 0 && (
                  <button
                    onClick={() => {
                      const allSelected = parsedSuggestions.every((_, i) => selectedSuggestions.has(i));
                      setSelectedSuggestions(allSelected ? new Set() : new Set(parsedSuggestions.map((_, i) => i)));
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {parsedSuggestions.every((_, i) => selectedSuggestions.has(i)) ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>

              {showSuggestions && (
                <div className="space-y-2.5 pt-1">
                  {parsedSuggestions.map((suggestion, i) => {
                    const isSelected = selectedSuggestions.has(i);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleSuggestion(i)}
                        className={`w-full text-left flex items-start gap-3 rounded-xl p-3 transition-all ${
                          isSelected ? "bg-indigo-50 ring-2 ring-indigo-400/50" : "bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{suggestion.category}</span>
                          <p className="text-sm text-slate-700 leading-relaxed mt-1">{suggestion.text}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedSuggestions.size > 0 && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={handleGenerateResume}
                    disabled={generatingResume}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.97]"
                  >
                    {generatingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generatingResume ? "Generating..." : `Generate Resume with ${selectedSuggestions.size} suggestion${selectedSuggestions.size > 1 ? "s" : ""}`}
                  </button>
                </div>
              )}
            </div>
          ) : !result.hasBaseResume ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                No base resume found. <a href="/resumes/new" className="underline font-medium">Create one</a> to get personalized resume suggestions.
              </p>
            </div>
          ) : null}

          {/* Generated Resume Preview */}
          {generatedResume && (
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    {isLatex ? "Tailored Resume (LaTeX)" : "Tailored Resume"}
                  </h2>
                  {savedResumeId && (
                    <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Saved to Resumes
                    </p>
                  )}
                  {isLatex && <p className="text-xs text-slate-500 mt-0.5">Copy and paste into Overleaf to generate your PDF</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowResumePreview(!showResumePreview)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {showResumePreview ? "Hide" : "Preview"}
                  </button>
                  <button
                    onClick={() => { handleCopy(generatedResume); if (isLatex) { setCopiedLatex(true); setTimeout(() => setCopiedLatex(false), 3000); } }}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-[0.97] ${
                      isLatex
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm shadow-emerald-600/20"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {(isLatex ? copiedLatex : copied) ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isLatex ? (copiedLatex ? "Copied! Paste in Overleaf" : "Copy LaTeX") : "Copy"}
                  </button>
                  {!isLatex && (
                    <button onClick={handleDownloadPdf} className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-1.5 rounded-xl text-xs font-medium hover:bg-slate-800 transition-all active:scale-[0.97]">
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  )}
                  {savedResumeId && (
                    <a href={`/resumes/${savedResumeId}`} className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-xs font-medium hover:bg-indigo-700 transition-all active:scale-[0.97]">
                      Edit in Resumes
                    </a>
                  )}
                </div>
              </div>

              {showResumePreview && (
                <div ref={resumePreviewRef} className={`border border-slate-200 rounded-xl max-h-[600px] overflow-y-auto ${isLatex ? "bg-slate-900" : "bg-white p-6"}`}>
                  {isLatex ? (
                    <pre className="p-4 text-sm text-gray-100 font-mono whitespace-pre-wrap break-words leading-relaxed"><code>{generatedResume}</code></pre>
                  ) : (
                    <ResumeMarkdownPreview content={generatedResume} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cover Letter Generator */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-card p-5 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Generate Cover Letter</h2>

            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-600">Tone:</label>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {(["professional", "technical", "casual"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                      tone === t ? "bg-white shadow-sm font-medium text-slate-900" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenerateCoverLetter}
                disabled={generatingCL}
                className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.97]"
              >
                {generatingCL ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generatingCL ? "Generating..." : "Generate"}
              </button>
            </div>

            {coverLetter && (
              <div className="relative">
                <button
                  onClick={() => handleCopy(coverLetter)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 pr-12 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed max-h-96 overflow-y-auto">
                  {coverLetter}
                </div>
              </div>
            )}
          </div>

          {/* Track Application */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-card p-5 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Save className="w-4 h-4 text-indigo-500" />
              Track Application
            </h2>

            {savedApp ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <p className="text-sm font-medium text-emerald-800">
                    Application saved — {result.extracted.jobTitle} at {result.extracted.companyName}
                  </p>
                </div>
                <a
                  href={`/applications/${savedApp.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View Application <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500">Save this as an application to track its progress through your pipeline.</p>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Job posting URL (optional)"
                    className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                  <button
                    onClick={handleSaveApplication}
                    disabled={savingApp}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.97]"
                  >
                    {savingApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingApp ? "Saving..." : "Save & Track"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResumeMarkdownPreview({ content }: { content: string }) {
  return (
    <div className="resume-preview">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("# "))
          return <h1 key={i} className="text-xl font-bold mb-1 text-slate-900">{line.slice(2)}</h1>;
        if (line.startsWith("## "))
          return <h2 key={i} className="text-sm font-semibold mt-4 mb-1.5 text-indigo-700 border-b border-slate-200 pb-1 uppercase tracking-wide">{line.slice(3)}</h2>;
        if (line.startsWith("### "))
          return <h3 key={i} className="text-sm font-semibold mt-2 text-slate-800">{line.slice(4)}</h3>;
        if (line.startsWith("- "))
          return <li key={i} className="text-sm ml-4 text-slate-700 leading-relaxed">{line.slice(2)}</li>;
        if (line.trim() === "") return <div key={i} className="h-1.5" />;
        return <p key={i} className="text-sm text-slate-700 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  let html = "";
  let inList = false;

  for (const line of lines) {
    if (line.startsWith("- ")) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${escapeHtml(line.slice(2))}</li>`;
      continue;
    }
    if (inList) { html += "</ul>"; inList = false; }

    if (line.startsWith("# ")) html += `<h1>${escapeHtml(line.slice(2))}</h1>`;
    else if (line.startsWith("## ")) html += `<h2>${escapeHtml(line.slice(3))}</h2>`;
    else if (line.startsWith("### ")) html += `<h3>${escapeHtml(line.slice(4))}</h3>`;
    else if (line.trim() === "") html += "<br/>";
    else html += `<p>${escapeHtml(line)}</p>`;
  }
  if (inList) html += "</ul>";
  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
