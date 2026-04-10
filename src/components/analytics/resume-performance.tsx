"use client";

interface ResumePerf {
  name: string;
  totalApps: number;
  responseRate: number;
}

export function ResumePerformance({ data }: { data: ResumePerf[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No resume data yet. Start applying with tailored resumes!</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((r) => (
        <div key={r.name} className="flex items-center gap-3">
          <span className="text-sm w-40 truncate">{r.name}</span>
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${r.responseRate}%` }}
            />
          </div>
          <span className="text-sm font-medium w-16 text-right">{r.responseRate}%</span>
          <span className="text-xs text-slate-400 w-12 text-right">{r.totalApps} apps</span>
        </div>
      ))}
    </div>
  );
}
