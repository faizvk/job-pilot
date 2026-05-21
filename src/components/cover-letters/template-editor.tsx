"use client";

export function TemplateEditor({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[300px] sm:h-[400px] border border-slate-200 rounded-md p-3 sm:p-4 text-sm font-mono resize-y shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-colors duration-150"
      placeholder="Dear Hiring Manager,&#10;&#10;I am writing about the {{jobTitle}} position at {{companyName}}..."
    />
  );
}
