"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

interface CopyFieldProps {
  label: string;
  value: string;
  isLink?: boolean;
}

function CopyField({ label, value, isLink }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-all group">
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-800 truncate mt-0.5">{value}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {isLink && (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        <button
          onClick={handleCopy}
          className={`p-1.5 rounded-md transition-all ${
            copied
              ? "bg-emerald-50 text-emerald-600"
              : "text-slate-300 hover:text-indigo-500 hover:bg-indigo-50"
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export function QuickCopyPanel({ profile }: { profile: any }) {
  const [allCopied, setAllCopied] = useState(false);

  const fields = [
    { label: "Full Name", value: profile?.name || "" },
    { label: "Email", value: profile?.email || "" },
    { label: "Phone", value: profile?.phone || "" },
    { label: "Location", value: profile?.location || "" },
    { label: "LinkedIn", value: profile?.linkedin || "", isLink: true },
    { label: "GitHub", value: profile?.github || "", isLink: true },
    { label: "Portfolio", value: profile?.portfolio || "", isLink: true },
  ].filter((f) => f.value);

  const skills = (profile?.skills || []).map((s: any) => s.name).join(", ");
  const summary = profile?.summary || "";

  const copyAll = () => {
    const text = fields.map((f) => `${f.label}: ${f.value}`).join("\n");
    navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 1500);
  };

  if (fields.length === 0) {
    return (
      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 text-sm text-amber-800 animate-scale-in">
        Fill in your profile first to use Quick Copy. Switch to the &ldquo;Personal Info&rdquo; tab below.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-card animate-scale-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-[13px] font-semibold text-slate-900">Quick Copy — Click any field to copy</p>
        <button
          onClick={copyAll}
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${
            allCopied
              ? "bg-emerald-50 text-emerald-600"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          {allCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {allCopied ? "Copied!" : "Copy All"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Personal fields */}
        <div className="p-2">
          {fields.slice(0, 4).map((f) => (
            <CopyField key={f.label} label={f.label} value={f.value} isLink={f.isLink} />
          ))}
        </div>

        {/* Links */}
        <div className="p-2">
          {fields.slice(4).map((f) => (
            <CopyField key={f.label} label={f.label} value={f.value} isLink={f.isLink} />
          ))}
          {skills && <CopyField label="Skills" value={skills} />}
        </div>

        {/* Summary */}
        {summary && (
          <div className="p-2">
            <CopyField label="Summary" value={summary} />
          </div>
        )}
      </div>
    </div>
  );
}
