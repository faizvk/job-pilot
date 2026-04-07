"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeEditor } from "@/components/resumes/resume-editor";
import { ResumePreview } from "@/components/resumes/resume-preview";

export default function NewResumePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isBase, setIsBase] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content, isBase }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/resumes/${data.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Resume</h1>
        <button
          onClick={handleSave}
          disabled={!name || !content || saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Resume"}
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white border rounded-lg p-4">
        <input
          type="text"
          placeholder="Resume name (e.g., 'Full-Stack Developer Resume')"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isBase}
            onChange={(e) => setIsBase(e.target.checked)}
            className="rounded"
          />
          Base Resume
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Edit</h3>
          <ResumeEditor content={content} onChange={setContent} />
        </div>
        <div>
          <h3 className="font-medium mb-2">Preview</h3>
          <ResumePreview content={content} />
        </div>
      </div>
    </div>
  );
}
