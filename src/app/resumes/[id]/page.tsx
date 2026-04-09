"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ResumeEditor } from "@/components/resumes/resume-editor";
import { ResumePreview } from "@/components/resumes/resume-preview";
import { Trash2, Download } from "lucide-react";

export default function ResumeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [resume, setResume] = useState<any>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isBase, setIsBase] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/resumes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setResume(data);
        setName(data.name);
        setContent(data.content);
        setIsBase(data.isBase);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content, isBase }),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this resume?")) return;
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    router.push("/resumes");
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />;
  if (!resume) return <p className="text-gray-500">Resume not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Resume</h1>
        <div className="flex items-center gap-2">
          {resume.filePath && (
            <a
              href={`/api/resumes/${id}/download`}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" /> Original PDF
            </a>
          )}
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

      <div className="flex items-center gap-4 bg-white border rounded-lg p-4">
        <input
          type="text"
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
