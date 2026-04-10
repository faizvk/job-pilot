"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TemplateEditor } from "@/components/cover-letters/template-editor";
import { TemplatePreview } from "@/components/cover-letters/template-preview";
import { VariableInserter } from "@/components/cover-letters/variable-inserter";
import { Trash2, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

export default function CoverLetterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/cover-letters/templates/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name);
        setContent(data.content);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/cover-letters/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/cover-letters/templates/${id}`, { method: "DELETE" });
    router.push("/cover-letters");
  };

  const handleInsertVariable = (variable: string) => {
    setContent((prev) => prev + `{{${variable}}}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-slate-100 rounded-lg animate-shimmer" />
        <div className="h-10 bg-slate-100 rounded-xl animate-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-slate-100 rounded-xl animate-shimmer" />
          <div className="h-[400px] bg-slate-100 rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/cover-letters" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Edit Template</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm border border-slate-200 text-slate-500 rounded-lg hover:text-red-600 hover:border-red-200 hover:bg-red-50 shadow-xs transition-all"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
      />

      <VariableInserter onInsert={handleInsertVariable} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-700 mb-2">Edit</h3>
          <TemplateEditor content={content} onChange={setContent} />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-slate-700 mb-2">Preview</h3>
          <TemplatePreview content={content} />
        </div>
      </div>
    </div>
  );
}
