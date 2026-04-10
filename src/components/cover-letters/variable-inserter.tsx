"use client";

const VARIABLES = [
  { key: "companyName", label: "Company" },
  { key: "jobTitle", label: "Job Title" },
  { key: "userName", label: "Your Name" },
  { key: "topSkills", label: "Top Skills" },
  { key: "allSkills", label: "All Skills" },
  { key: "matchedSkills", label: "Matched Skills" },
  { key: "recentRole", label: "Recent Role" },
  { key: "recentCompany", label: "Recent Company" },
  { key: "summary", label: "Summary" },
  { key: "experienceYears", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "location", label: "Location" },
  { key: "date", label: "Date" },
];

export function VariableInserter({ onInsert }: { onInsert: (variable: string) => void }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Variables</span>
        <span className="text-[10px] text-slate-400">Click to insert</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {VARIABLES.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => onInsert(v.key)}
            className="px-2 py-1 text-[11px] bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors font-mono ring-1 ring-inset ring-indigo-600/10"
            title={`Insert {{${v.key}}}`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-2">
        Use <code className="font-mono text-indigo-600">{`{{#var}}...{{/var}}`}</code> for conditional sections (shown only when variable has a value)
      </p>
    </div>
  );
}
