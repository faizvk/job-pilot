"use client";

import { useState } from "react";
import { Github, Star, GitFork, ExternalLink, Loader2, Code2, Users } from "lucide-react";

interface GitHubData {
  profile: { name: string; bio: string; publicRepos: number; followers: number; following: number; avatarUrl: string; htmlUrl: string };
  repos: { name: string; description: string | null; language: string | null; stars: number; forks: number; url: string; homepage: string | null; topics: string[] }[];
  languages: Record<string, number>;
  totalStars: number;
}

const LANG_COLORS: Record<string, string> = {
  JavaScript: "bg-yellow-400", TypeScript: "bg-blue-500", Python: "bg-green-500", Java: "bg-red-500",
  "C++": "bg-pink-500", Go: "bg-cyan-500", Rust: "bg-orange-500", Ruby: "bg-red-600",
  PHP: "bg-indigo-400", CSS: "bg-purple-500", HTML: "bg-orange-400", Shell: "bg-green-600",
  Solidity: "bg-gray-600", Dart: "bg-blue-400",
};

export function GitHubStats({ username }: { username: string | null }) {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/github/stats?username=${username}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (!username) {
    return (
      <div className="border border-gray-200 rounded-xl p-5 text-center">
        <Github className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Add your GitHub username in the profile above to see stats</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-gray-900" />
          <h3 className="text-sm font-semibold text-gray-900">GitHub Stats</h3>
          <span className="text-xs text-gray-400">@{username}</span>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Code2 className="w-3.5 h-3.5" />}
          {data ? "Refresh" : "Fetch Stats"}
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {data && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Repos" value={data.profile.publicRepos} />
            <StatCard label="Stars" value={data.totalStars} />
            <StatCard label="Followers" value={data.profile.followers} />
            <StatCard label="Following" value={data.profile.following} />
          </div>

          {/* Languages */}
          {Object.keys(data.languages).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Top Languages</h4>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(data.languages)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([lang, count]) => (
                    <span key={lang} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-50 rounded-full text-gray-700">
                      <span className={`w-2 h-2 rounded-full ${LANG_COLORS[lang] || "bg-gray-400"}`} />
                      {lang} <span className="text-gray-400">({count})</span>
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Top Repos */}
          <div>
            <h4 className="text-xs font-semibold text-gray-600 mb-2">Top Repositories</h4>
            <div className="space-y-2">
              {data.repos.slice(0, 6).map((repo) => (
                <div key={repo.name} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-all">
                  <div className="flex items-center justify-between">
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      {repo.name} <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${LANG_COLORS[repo.language] || "bg-gray-400"}`} />
                          {repo.language}
                        </span>
                      )}
                      {repo.stars > 0 && <span className="flex items-center gap-0.5"><Star className="w-3 h-3" />{repo.stars}</span>}
                      {repo.forks > 0 && <span className="flex items-center gap-0.5"><GitFork className="w-3 h-3" />{repo.forks}</span>}
                    </div>
                  </div>
                  {repo.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{repo.description}</p>}
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {repo.topics.slice(0, 5).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-2 bg-gray-50 rounded-lg">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}
