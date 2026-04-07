"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResumeEditor } from "@/components/resumes/resume-editor";
import { ResumePreview } from "@/components/resumes/resume-preview";
import { KeywordMatcher } from "@/components/resumes/keyword-matcher";

export default function TailoredResumePage() {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [tailoredContent, setTailoredContent] = useState("");
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tailoring, setTailoring] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/applications/${id}`).then((r) => r.json()),
      fetch("/api/resumes").then((r) => r.json()),
    ])
      .then(([appData, resumeData]) => {
        setApp(appData);
        setResumes(resumeData);
        if (appData.tailoredResume) {
          setTailoredContent(appData.tailoredResume.content);
          setMatchedKeywords(JSON.parse(appData.tailoredResume.matchedKeywords || "[]"));
          setMissingKeywords(JSON.parse(appData.tailoredResume.missingKeywords || "[]"));
          setSelectedResumeId(appData.tailoredResume.baseResumeId);
        } else if (resumeData.length > 0) {
          const base = resumeData.find((r: any) => r.isBase) || resumeData[0];
          setSelectedResumeId(base.id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleTailor = async () => {
    if (!selectedResumeId) return;
    setTailoring(true);
    try {
      const res = await fetch(`/api/resumes/${selectedResumeId}/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, baseResumeId: selectedResumeId }),
      });
      const data = await res.json();
      setTailoredContent(data.content);
      setMatchedKeywords(JSON.parse(data.matchedKeywords || "[]"));
      setMissingKeywords(JSON.parse(data.missingKeywords || "[]"));
    } catch (err) {
      console.error(err);
    } finally {
      setTailoring(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tailored Resume</h1>
          <p className="text-gray-500">
            {app?.jobTitle} at {app?.companyName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white border rounded-lg p-4">
        <label className="text-sm font-medium">Base Resume:</label>
        <select
          value={selectedResumeId}
          onChange={(e) => setSelectedResumeId(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select a resume</option>
          {resumes.map((r: any) => (
            <option key={r.id} value={r.id}>
              {r.name} {r.isBase ? "(Base)" : ""}
            </option>
          ))}
        </select>
        <button
          onClick={handleTailor}
          disabled={!selectedResumeId || tailoring}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {tailoring ? "Tailoring..." : "Tailor Resume"}
        </button>
      </div>

      {(matchedKeywords.length > 0 || missingKeywords.length > 0) && (
        <KeywordMatcher matched={matchedKeywords} missing={missingKeywords} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Edit</h3>
          <ResumeEditor
            content={tailoredContent}
            onChange={setTailoredContent}
          />
        </div>
        <div>
          <h3 className="font-medium mb-2">Preview</h3>
          <ResumePreview content={tailoredContent} />
        </div>
      </div>
    </div>
  );
}
