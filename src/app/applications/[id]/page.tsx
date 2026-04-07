"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/applications/status-badge";
import { formatDate, formatSalary, timeAgo } from "@/lib/utils";
import {
  Building2, MapPin, DollarSign, Globe, Calendar, User, Mail,
  FileText, PenLine, MessageSquare, ClipboardList, Trash2, ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/applications/${id}`)
      .then((res) => res.json())
      .then(setApp)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    router.push("/applications");
  };

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const res = await fetch(`/api/applications/${id}`);
    setApp(await res.json());
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />;
  if (!app) return <p className="text-gray-500">Application not found.</p>;

  const statuses = ["saved", "applied", "phone_screen", "interview", "offer", "accepted", "rejected"];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{app.jobTitle}</h1>
          <p className="text-lg text-gray-600 flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4" />
            {app.companyName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/applications/${id}/edit`}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            <PenLine className="w-4 h-4" /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded transition-colors ${
                s === app.status
                  ? "bg-blue-600 text-white"
                  : statuses.indexOf(s) < statuses.indexOf(app.status)
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {s.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-semibold text-lg">Details</h2>
          {app.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{app.location}</span>
              {app.workType && <StatusBadge status={app.workType} />}
            </div>
          )}
          {(app.salaryMin || app.salaryMax) && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span>{formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency)}</span>
            </div>
          )}
          {app.jobUrl && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-gray-400" />
              <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                Job Posting <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {app.deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Deadline: {formatDate(app.deadline)}</span>
            </div>
          )}
          {app.contactName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span>{app.contactName}</span>
            </div>
          )}
          {app.contactEmail && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <a href={`mailto:${app.contactEmail}`} className="text-blue-600 hover:underline">{app.contactEmail}</a>
            </div>
          )}
          {app.matchScore != null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Match:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      app.matchScore >= 70 ? "bg-green-500" : app.matchScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${app.matchScore}%` }}
                  />
                </div>
                <span className="font-medium">{app.matchScore}%</span>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400">Added {timeAgo(app.createdAt)}</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border p-6 space-y-3">
          <h2 className="font-semibold text-lg">Tools</h2>
          <Link href={`/applications/${id}/resume`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-sm">Tailored Resume</p>
              <p className="text-xs text-gray-500">Customize resume for this job</p>
            </div>
          </Link>
          <Link href={`/applications/${id}/cover-letter`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
            <Mail className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-sm">Cover Letter</p>
              <p className="text-xs text-gray-500">Generate targeted cover letter</p>
            </div>
          </Link>
          <Link href={`/applications/${id}/interview-prep`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
            <ClipboardList className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-sm">Interview Prep</p>
              <p className="text-xs text-gray-500">Notes, questions, research</p>
            </div>
          </Link>
          <Link href={`/applications/${id}/follow-ups`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-sm">Follow-ups</p>
              <p className="text-xs text-gray-500">Schedule reminders and drafts</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Notes */}
      {app.notes && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-lg mb-3">Notes</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.notes}</p>
        </div>
      )}

      {/* Job Description */}
      {app.jobDescription && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-lg mb-3">Job Description</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.jobDescription}</p>
        </div>
      )}

      {/* Status History */}
      {app.statusHistory?.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-lg mb-3">Status History</h2>
          <div className="space-y-3">
            {app.statusHistory.map((change: any) => (
              <div key={change.id} className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-32">{formatDate(change.changedAt)}</span>
                <StatusBadge status={change.fromStatus} />
                <span className="text-gray-400">→</span>
                <StatusBadge status={change.toStatus} />
                {change.note && <span className="text-gray-500">— {change.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
