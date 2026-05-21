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
      {data.map((r, i) => (
        <div key={`${r.name}-${i}`} className="flex items-center gap-2 sm:gap-3 group">
          <span className="text-sm w-32 sm:w-40 truncate text-slate-700 group-hover:text-slate-900 transition-colors">{r.name}</span>
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out group-hover:bg-emerald-600"
              style={{ width: `${r.responseRate}%` }}
            />
          </div>
          <span className="text-sm font-medium w-12 sm:w-16 text-right tabular-nums">{r.responseRate}%</span>
          <span className="text-xs text-slate-400 w-12 text-right hidden sm:inline">{r.totalApps} apps</span>
        </div>
      ))}
    </div>
  );
}
