"use client";

interface StepPasteJdProps {
  jobDescription: string;
  applicationData: any;
  onJobDescriptionChange: (v: string) => void;
  onApplicationDataChange: (data: any) => void;
  onAnalyze: () => void;
}

export function StepPasteJd({ jobDescription, applicationData, onJobDescriptionChange, onApplicationDataChange, onAnalyze }: StepPasteJdProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <input
            type="text" value={applicationData.companyName}
            onChange={(e) => onApplicationDataChange({ companyName: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input
            type="text" value={applicationData.jobTitle}
            onChange={(e) => onApplicationDataChange({ jobTitle: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job URL</label>
          <input
            type="url" value={applicationData.jobUrl}
            onChange={(e) => onApplicationDataChange({ jobUrl: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text" value={applicationData.location}
            onChange={(e) => onApplicationDataChange({ location: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
        <textarea
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          rows={12}
          className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste the full job description here..."
        />
      </div>

      <button
        onClick={onAnalyze}
        disabled={!applicationData.companyName || !applicationData.jobTitle || jobDescription.length < 20}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Analyze Job Description
      </button>
    </div>
  );
}
