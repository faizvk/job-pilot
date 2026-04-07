"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TemplateEditor } from "@/components/cover-letters/template-editor";
import { TemplatePreview } from "@/components/cover-letters/template-preview";
import { VariableInserter } from "@/components/cover-letters/variable-inserter";
import { Trash2 } from "lucide-react";

export default function CoverLetterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Template</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <input
        type="text"
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
