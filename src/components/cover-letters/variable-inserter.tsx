"use client";

const VARIABLES = [
  "companyName", "jobTitle", "userName", "topSkills",
  "recentRole", "recentCompany", "location", "date",
];

export function VariableInserter({ onInsert }: { onInsert: (variable: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 bg-gray-50 border rounded-lg p-3">
      <span className="text-xs text-gray-500 self-center mr-1">Insert:</span>
      {VARIABLES.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onInsert(v)}
          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-mono"
        >
          {`{{${v}}}`}
        </button>
      ))}
    </div>
  );
}
