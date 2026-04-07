"use client";

export function EmailDraftEditor({ content, onChange }: { content: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Email Draft</label>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Dear [Hiring Manager],&#10;&#10;I wanted to follow up on my application..."
      />
    </div>
  );
}
