"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PrepNotesEditor } from "@/components/interview-prep/prep-notes-editor";
import { QuestionList } from "@/components/interview-prep/question-list";
import { ResearchLinks } from "@/components/interview-prep/research-links";

export default function InterviewPrepPage() {
  const { id } = useParams();
  const [prep, setPrep] = useState<any>(null);
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/interview-prep/${id}`).then((r) => r.json()),
      fetch(`/api/applications/${id}`).then((r) => r.json()),
    ])
      .then(([prepData, appData]) => {
        setPrep(prepData);
        setApp(appData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (field: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/interview-prep/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...prep, [field]: value }),
      });
      const data = await res.json();
      setPrep(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interview Prep</h1>
          <p className="text-gray-500">
            {app?.jobTitle} at {app?.companyName}
          </p>
        </div>
        {saving && <span className="text-sm text-gray-400">Saving...</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PrepNotesEditor
            notes={prep?.notes || ""}
            onChange={(notes) => handleSave("notes", notes)}
          />
          <ResearchLinks
            links={prep?.researchLinks || "[]"}
            onChange={(links) => handleSave("researchLinks", links)}
          />
        </div>
        <QuestionList
          questions={prep?.questions || "[]"}
          onChange={(questions) => handleSave("questions", questions)}
        />
      </div>
    </div>
  );
}
