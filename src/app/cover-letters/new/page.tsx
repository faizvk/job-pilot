"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateEditor } from "@/components/cover-letters/template-editor";
import { TemplatePreview } from "@/components/cover-letters/template-preview";
import { VariableInserter } from "@/components/cover-letters/variable-inserter";

export default function NewCoverLetterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState(
    `Dear Hiring Manager,

I am writing to express my strong interest in the {{jobTitle}} position at {{companyName}}. With my background in {{topSkills}} and experience as a {{recentRole}} at {{recentCompany}}, I am confident in my ability to contribute meaningfully to your team.

[Your body paragraph here - describe relevant experience and achievements]

I am excited about the opportunity to bring my skills to {{companyName}} and would welcome the chance to discuss how I can contribute to your team's success.

Thank you for your consideration.

Sincerely,
{{userName}}`
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cover-letters/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/cover-letters/${data.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInsertVariable = (variable: string) => {
    setContent((prev) => prev + `{{${variable}}}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Template</h1>
        <button
          onClick={handleSave}
          disabled={!name || !content || saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Template name (e.g., 'General Application')"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <VariableInserter onInsert={handleInsertVariable} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Edit</h3>
          <TemplateEditor content={content} onChange={setContent} />
        </div>
        <div>
          <h3 className="font-medium mb-2">Preview</h3>
          <TemplatePreview content={content} />
        </div>
      </div>
    </div>
  );
}
