const GITHUB_API = "https://api.github.com";
const headers = { "User-Agent": "JobPilot-App", Accept: "application/vnd.github.v3+json" };

export interface GitHubProfile {
  name: string | null;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  avatarUrl: string;
  htmlUrl: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  homepage: string | null;
  topics: string[];
  updatedAt: string;
}

export async function fetchGitHubProfile(username: string): Promise<GitHubProfile> {
  const res = await fetch(`${GITHUB_API}/users/${username}`, { headers });
  if (!res.ok) throw new Error(`GitHub user not found: ${username}`);
  const data = await res.json();
  return {
    name: data.name,
    bio: data.bio,
    publicRepos: data.public_repos,
    followers: data.followers,
    following: data.following,
    avatarUrl: data.avatar_url,
    htmlUrl: data.html_url,
  };
}

export async function fetchGitHubRepos(username: string, limit = 10): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${GITHUB_API}/users/${username}/repos?sort=updated&per_page=${limit}&type=owner`,
    { headers }
  );
  if (!res.ok) throw new Error("Failed to fetch repos");
  const data = await res.json();
  return data.map((r: any) => ({
    name: r.name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    url: r.html_url,
    homepage: r.homepage,
    topics: r.topics || [],
    updatedAt: r.updated_at,
  }));
}

export async function fetchGitHubLanguages(username: string): Promise<Record<string, number>> {
  const repos = await fetchGitHubRepos(username, 30);
  const languages: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  }
  return languages;
}

export async function fetchFullGitHubStats(username: string) {
  const [profile, repos, languages] = await Promise.all([
    fetchGitHubProfile(username),
    fetchGitHubRepos(username, 10),
    fetchGitHubLanguages(username),
  ]);

  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);

  return { profile, repos, languages, totalStars };
}
