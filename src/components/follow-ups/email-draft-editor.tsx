"use client";

export function EmailDraftEditor({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-slate-700">Email Draft</label>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full border border-slate-200 rounded-md p-3 text-sm resize-y shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-colors duration-150"
        placeholder="Dear [Hiring Manager],&#10;&#10;I wanted to follow up on my application..."
      />
    </div>
  );
}
