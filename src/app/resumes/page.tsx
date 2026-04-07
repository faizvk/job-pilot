"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then(setResumes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resumes</h1>
        <Link
          href="/resumes/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> New Resume
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No resumes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <Link
              key={resume.id}
              href={`/resumes/${resume.id}`}
              className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <FileText className="w-8 h-8 text-blue-600" />
                {resume.isBase && (
                  <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    <Star className="w-3 h-3" /> Base
                  </span>
                )}
              </div>
              <h3 className="font-semibold">{resume.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Updated {formatDate(resume.updatedAt)}
              </p>
              {resume.tailoredCopies?.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {resume.tailoredCopies.length} tailored version(s)
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
