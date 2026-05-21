"use client";

export function WeeklyGoalRing({ goal }: { goal: { target: number; achieved: number } }) {
  const percentage = goal.target > 0 ? Math.min((goal.achieved / goal.target) * 100, 100) : 0;
  const remaining = Math.max(0, goal.target - goal.achieved);

  return (
    <section className="rounded-xl border border-slate-200/70 bg-white">
      <header className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Weekly goal</h2>
        <span className="text-xs text-slate-400 tabular-nums">{Math.round(percentage)}%</span>
      </header>
      <div className="px-4 sm:px-5 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{goal.achieved}</span>
          <span className="text-sm text-slate-400 tabular-nums">/ {goal.target}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {remaining === 0 ? "Goal hit. Nice." : `${remaining} more to hit your weekly target.`}
        </p>
        <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </section>
  );
}
