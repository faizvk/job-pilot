"use client";

export function WeeklyGoalRing({ goal }: { goal: { target: number; achieved: number } }) {
  const percentage = goal.target > 0 ? Math.min((goal.achieved / goal.target) * 100, 100) : 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="font-semibold mb-4">Weekly Goal</h2>
      <div className="flex flex-col items-center">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r={radius}
            fill="none" stroke="#e2e8f0" strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none" stroke="#2563eb" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            className="transition-all duration-500"
          />
          <text x="60" y="55" textAnchor="middle" className="text-2xl font-bold fill-gray-900">
            {goal.achieved}
          </text>
          <text x="60" y="72" textAnchor="middle" className="text-xs fill-gray-500">
            of {goal.target}
          </text>
        </svg>
        <p className="text-sm text-gray-500 mt-2">Applications this week</p>
      </div>
    </div>
  );
}
