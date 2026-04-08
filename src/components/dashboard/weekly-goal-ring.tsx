"use client";

export function WeeklyGoalRing({ goal }: { goal: { target: number; achieved: number } }) {
  const percentage = goal.target > 0 ? Math.min((goal.achieved / goal.target) * 100, 100) : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-5">
      <h2 className="text-[15px] font-semibold text-gray-900 mb-5">Weekly Goal</h2>
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle
              cx="55" cy="55" r={radius}
              fill="none" stroke="#f3f4f6" strokeWidth="7"
            />
            <circle
              cx="55" cy="55" r={radius}
              fill="none"
              stroke="url(#goalGradient)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 55 55)"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <text x="55" y="50" textAnchor="middle" className="text-[22px] font-bold" fill="#111827">
              {goal.achieved}
            </text>
            <text x="55" y="68" textAnchor="middle" className="text-[11px]" fill="#9ca3af">
              of {goal.target}
            </text>
          </svg>
        </div>
        <p className="text-xs text-gray-500 mt-3">Applications this week</p>
        <div className="w-full mt-3 bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
