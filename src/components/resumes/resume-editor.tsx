"use client";

export function ResumeEditor({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[500px] border border-slate-200 rounded-xl p-4 text-sm font-mono resize-none shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
      placeholder="# Your Name&#10;&#10;## Summary&#10;Experienced developer...&#10;&#10;## Experience&#10;### Company Name | Role | Date&#10;- Achievement 1&#10;&#10;## Skills&#10;JavaScript, React, Node.js..."
    />
  );
}
