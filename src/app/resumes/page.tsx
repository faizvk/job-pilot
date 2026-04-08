"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, Star, Upload, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then(setResumes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("isBase", "true");

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

      router.push(`/resumes/${data.id}`);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Resumes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your resumes and tailored versions</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xs hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload Resume</>
            )}
          </button>
          <Link
            href="/resumes/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> New Resume
          </Link>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 animate-scale-in">
          {uploadError}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-indigo-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">No resumes yet</p>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">Upload your existing resume or create a new one from scratch</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" /> Upload Resume
            </button>
            <Link
              href="/resumes/new"
              className="inline-flex items-center gap-2 border border-gray-200 px-5 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" /> Create from Scratch
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Upload card */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border-2 border-dashed border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-center group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center mx-auto mb-3 transition-colors">
              <Upload className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <p className="text-sm font-medium text-gray-600 group-hover:text-indigo-700 transition-colors">Upload Resume</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT</p>
          </button>

          {/* Resume cards */}
          {resumes.map((resume) => (
            <Link
              key={resume.id}
              href={`/resumes/${resume.id}`}
              className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-indigo-50">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                {resume.isBase && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium ring-1 ring-inset ring-amber-600/10">
                    <Star className="w-3 h-3" /> Base
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-[14px]">{resume.name}</h3>
              <p className="text-xs text-gray-400 mt-1.5">
                Updated {formatDate(resume.updatedAt)}
              </p>
              {resume.tailoredCopies?.length > 0 && (
                <p className="text-[11px] text-indigo-500 font-medium mt-2">
                  {resume.tailoredCopies.length} tailored version{resume.tailoredCopies.length > 1 ? "s" : ""}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
