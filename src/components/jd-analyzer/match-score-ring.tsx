"use client";

export function MatchScoreRing({ score }: { score: number }) {
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  // emerald-600 / amber-500 / rose-500
  const color = score >= 70 ? "#059669" : score >= 40 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="flex flex-col items-center group">
      <svg width="140" height="140" viewBox="0 0 140 140" className="transition-transform duration-200 group-hover:scale-105">
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
