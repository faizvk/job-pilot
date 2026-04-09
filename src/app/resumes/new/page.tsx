"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ResumeEditor } from "@/components/resumes/resume-editor";
import { ResumePreview } from "@/components/resumes/resume-preview";
import { Upload, Loader2, FileUp, UserCheck } from "lucide-react";

export default function NewResumePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isBase, setIsBase] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("isBase", String(isBase));

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }

      // Auto-import resume data into profile
      try {
        await fetch("/api/profile/import-from-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId: data.id }),
        });
      } catch {
        // Non-blocking — profile import is best-effort
      }

      // Redirect to edit the uploaded resume
      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Create Resume</h1>
          <p className="text-sm text-gray-500 mt-0.5">Upload a file or write from scratch</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!name || !content || saving}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {saving ? "Saving..." : "Save Resume"}
        </button>
      </div>

      {/* Upload section */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-card overflow-hidden">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full p-6 border-b border-dashed border-gray-200 hover:bg-indigo-50/30 transition-all group disabled:opacity-50"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              ) : (
                <FileUp className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors">
                {uploading ? "Processing file..." : "Click to upload your resume"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Supports PDF, DOCX, DOC, and TXT files
              </p>
            </div>
          </div>
        </button>

        {uploadError && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-sm text-red-700">
            {uploadError}
          </div>
        )}

        {/* Name and options */}
        <div className="flex items-center gap-4 p-4">
          <input
            type="text"
            placeholder="Resume name (e.g., 'Full-Stack Developer Resume')"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={isBase}
              onChange={(e) => setIsBase(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-600">Base Resume</span>
          </label>
        </div>
      </div>

      {/* Or divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OR WRITE MANUALLY</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Edit</h3>
          <ResumeEditor content={content} onChange={setContent} />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-gray-700 mb-2">Preview</h3>
          <ResumePreview content={content} />
        </div>
      </div>
    </div>
  );
}
