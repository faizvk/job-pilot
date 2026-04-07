"use client";

export function ResumeEditor({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[500px] border rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="# Your Name&#10;&#10;## Summary&#10;Experienced developer...&#10;&#10;## Experience&#10;### Company Name | Role | Date&#10;- Achievement 1&#10;&#10;## Skills&#10;JavaScript, React, Node.js..."
    />
  );
}
