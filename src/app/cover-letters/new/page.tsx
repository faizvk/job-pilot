"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateEditor } from "@/components/cover-letters/template-editor";
import { TemplatePreview } from "@/components/cover-letters/template-preview";
import { VariableInserter } from "@/components/cover-letters/variable-inserter";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

const PRESETS: { label: string; name: string; content: string }[] = [
  {
    label: "Blank",
    name: "",
    content: `Dear Hiring Manager,

I am writing to express my interest in the {{jobTitle}} position at {{companyName}}.

[Write your cover letter here. Use the variables above to auto-fill details.]

Best regards,
{{userName}}`,
  },
  {
    label: "General",
    name: "General Application",
    content: `Dear Hiring Manager,

I am writing to express my interest in the {{jobTitle}} position at {{companyName}}. As a {{recentRole}} with experience in {{topSkills}}, I am excited about the opportunity to contribute to your team.

{{summary}}

In my most recent role at {{recentCompany}}, I developed strong expertise in {{topSkills}}. I am confident these skills align well with what you are looking for in a {{jobTitle}}.

{{#matchedSkills}}I noticed your job posting mentions several technologies I work with regularly, including {{matchedSkills}}. {{/matchedSkills}}I am eager to bring this experience to {{companyName}} and help drive results.

I would welcome the opportunity to discuss how my background and skills can benefit your team. Thank you for considering my application.

Best regards,
{{userName}}`,
  },
  {
    label: "Technical",
    name: "Technical / Engineering",
    content: `Dear Hiring Team,

I am excited to apply for the {{jobTitle}} role at {{companyName}}. With {{experienceYears}} of hands-on experience in software development, I bring a strong foundation in {{topSkills}} that I believe makes me a great fit for this position.

As a {{recentRole}} at {{recentCompany}}, I have worked extensively with modern development tools and frameworks. My technical stack includes {{allSkills}}, and I am always eager to learn and adopt new technologies.

{{#matchedSkills}}Your posting specifically mentions {{matchedSkills}} — these are technologies I use daily and am passionate about. {{/matchedSkills}}I am drawn to {{companyName}} because I want to work on challenging problems alongside talented engineers.

{{#education}}My educational background includes {{education}}, which gave me a solid theoretical foundation that I continue to build on through practical work. {{/education}}

I would love to discuss how my technical skills and experience can contribute to {{companyName}}'s engineering goals.

Best regards,
{{userName}}`,
  },
  {
    label: "Startup",
    name: "Startup / Growth Stage",
    content: `Hi there,

I came across the {{jobTitle}} opening at {{companyName}} and it immediately caught my attention. I thrive in fast-paced environments where I can wear multiple hats, and my background in {{topSkills}} positions me well to make an immediate impact.

At {{recentCompany}}, I worked as a {{recentRole}} where I learned to move quickly, ship often, and iterate based on feedback. I am comfortable owning projects end-to-end, from planning through deployment.

{{#matchedSkills}}I am especially excited that your team works with {{matchedSkills}} — tools I know well and enjoy working with. {{/matchedSkills}}Beyond technical skills, I bring strong communication, adaptability, and a genuine passion for building products that users love.

I would love to chat about how I can contribute to {{companyName}}'s growth. Looking forward to hearing from you!

Cheers,
{{userName}}`,
  },
];

export default function NewCoverLetterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState(PRESETS[0].content);
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

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setContent(preset.content);
    if (!name && preset.name) setName(preset.name);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/cover-letters" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Create Template</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={!name || !content || saving}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>

      {/* Preset selector */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Start from:</span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shadow-xs transition-all"
          >
            <FileText className="w-3 h-3" /> {p.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Template name (e.g., 'General Application')"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
      />

      <VariableInserter onInsert={handleInsertVariable} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Edit</h3>
          <TemplateEditor content={content} onChange={setContent} />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Preview</h3>
          <TemplatePreview content={content} />
        </div>
      </div>
    </div>
  );
}
