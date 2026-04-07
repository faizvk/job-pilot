"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TemplatePreview } from "@/components/cover-letters/template-preview";

export default function ApplicationCoverLetterPage() {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/applications/${id}`).then((r) => r.json()),
      fetch("/api/cover-letters/templates").then((r) => r.json()),
    ])
      .then(([appData, templateData]) => {
        setApp(appData);
        setTemplates(templateData);
        if (appData.coverLetter) {
          setGeneratedContent(appData.coverLetter.content);
          setSelectedTemplateId(appData.coverLetter.templateId);
        } else if (templateData.length > 0) {
          setSelectedTemplateId(templateData[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleGenerate = async () => {
    if (!selectedTemplateId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/cover-letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplateId, applicationId: id }),
      });
      const data = await res.json();
      setGeneratedContent(data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cover Letter</h1>
        <p className="text-gray-500">
          {app?.jobTitle} at {app?.companyName}
        </p>
      </div>

      <div className="flex items-center gap-4 bg-white border rounded-lg p-4">
        <label className="text-sm font-medium">Template:</label>
        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select a template</option>
          {templates.map((t: any) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button
          onClick={handleGenerate}
          disabled={!selectedTemplateId || generating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate"}
        </button>
      </div>

      {generatedContent ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Edit</h3>
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="w-full h-[500px] border rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">Preview</h3>
            <TemplatePreview content={generatedContent} />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>Select a template and click Generate to create a cover letter.</p>
        </div>
      )}
    </div>
  );
}
