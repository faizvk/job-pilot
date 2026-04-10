"use client";

export function TemplateEditor({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[400px] border border-slate-200 rounded-xl p-4 text-sm font-mono resize-none shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
      placeholder="Dear Hiring Manager,&#10;&#10;I am writing about the {{jobTitle}} position at {{companyName}}..."
    />
  );
}
