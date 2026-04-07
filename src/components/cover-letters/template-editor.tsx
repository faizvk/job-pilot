"use client";

export function TemplateEditor({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  // Highlight {{variables}} visually via a simple overlay approach
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[400px] border rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Dear Hiring Manager,&#10;&#10;I am writing about the {{jobTitle}} position at {{companyName}}..."
    />
  );
}
