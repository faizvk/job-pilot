"use client";

export function MatchScoreRing({ score }: { score: number }) {
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 70 70)"
          className="transition-all duration-700"
        />
        <text x="70" y="65" textAnchor="middle" className="text-3xl font-bold" fill={color}>
          {score}%
        </text>
        <text x="70" y="85" textAnchor="middle" className="text-xs fill-gray-500">
          match
        </text>
      </svg>
    </div>
  );
}
