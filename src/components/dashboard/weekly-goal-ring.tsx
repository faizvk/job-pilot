"use client";

export function WeeklyGoalRing({ goal }: { goal: { target: number; achieved: number } }) {
  const percentage = goal.target > 0 ? Math.min((goal.achieved / goal.target) * 100, 100) : 0;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-card p-5">
      <h2 className="text-[15px] font-semibold text-slate-900 mb-5">Weekly Goal</h2>
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="116" height="116" viewBox="0 0 116 116">
            <circle
              cx="58" cy="58" r={radius}
              fill="none" stroke="#f1f5f9" strokeWidth="8"
            />
            <circle
              cx="58" cy="58" r={radius}
              fill="none"
              stroke="url(#goalGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 58 58)"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <text x="58" y="52" textAnchor="middle" className="text-[24px] font-bold" fill="#0f172a">
              {goal.achieved}
            </text>
            <text x="58" y="72" textAnchor="middle" className="text-[11px] font-medium" fill="#94a3b8">
              of {goal.target}
            </text>
          </svg>
        </div>
        <p className="text-xs text-slate-500 mt-3 font-medium">Applications this week</p>
        <div className="w-full mt-3 bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
