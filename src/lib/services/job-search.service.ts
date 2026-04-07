import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { jdAnalyzerService } from "./jd-analyzer.service";

export interface SearchParams {
  jobTitles: string[];
  locations: string[];
  workTypes: string[];
  experienceMin: number;
  experienceMax: number;
  keywords?: string;
  excludeKeywords?: string;
  page?: number;
}

export interface FetchedJob {
  externalId: string;
  title: string;
  company: string;
  location: string;
  workType: string;
  description: string;
  url: string;
  salary: string;
  experienceLevel: string;
  postedAt: string;
  platform: string;
}

export const jobSearchService = {
  /**
   * Save search preferences
   */
  async savePreferences(prefs: {
    jobTitles: string[];
    locations: string[];
    workTypes: string[];
    experienceMin: number;
    experienceMax: number;
    keywords?: string;
    excludeKeywords?: string;
    salaryMin?: number;
    platforms: string[];
  }) {
    const existing = await prisma.searchPreference.findUnique({
      where: { userId: DEFAULT_USER_ID },
    });

    const data = {
      userId: DEFAULT_USER_ID,
      jobTitles: JSON.stringify(prefs.jobTitles),
      locations: JSON.stringify(prefs.locations),
      workTypes: JSON.stringify(prefs.workTypes),
      experienceMin: prefs.experienceMin,
      experienceMax: prefs.experienceMax,
      keywords: prefs.keywords || null,
      excludeKeywords: prefs.excludeKeywords || null,
      salaryMin: prefs.salaryMin || null,
      platforms: JSON.stringify(prefs.platforms),
    };

    if (existing) {
      return prisma.searchPreference.update({ where: { userId: DEFAULT_USER_ID }, data });
    }
    return prisma.searchPreference.create({ data });
  },

  /**
   * Get saved search preferences
   */
  async getPreferences() {
    const pref = await prisma.searchPreference.findUnique({
      where: { userId: DEFAULT_USER_ID },
    });

    if (!pref) return null;

    return {
      ...pref,
      jobTitles: JSON.parse(pref.jobTitles) as string[],
      locations: JSON.parse(pref.locations) as string[],
      workTypes: JSON.parse(pref.workTypes) as string[],
      platforms: JSON.parse(pref.platforms) as string[],
    };
  },

  /**
   * Fetch jobs from multiple sources based on search params
   */
  async fetchJobs(params: SearchParams): Promise<{ jobs: FetchedJob[]; sources: string[] }> {
    const allJobs: FetchedJob[] = [];
    const sources: string[] = [];

    // Build queries from params
    const queries = params.jobTitles.flatMap((title) =>
      params.locations.length > 0
        ? params.locations.map((loc) => ({ title, location: loc }))
        : [{ title, location: "India" }]
    );

    // Fetch from JSearch (RapidAPI) - primary source
    const jsearchKey = process.env.RAPIDAPI_KEY;
    if (jsearchKey) {
      for (const q of queries.slice(0, 15)) {
        try {
          const jobs = await this.fetchFromJSearch(
            q.title,
            q.location,
            jsearchKey,
            params.workTypes,
            params.page || 1
          );
          allJobs.push(...jobs);
          if (jobs.length > 0 && !sources.includes("JSearch")) sources.push("JSearch");
        } catch (e: any) {
          console.error("JSearch error:", e.message);
        }
      }
    }

    // Fetch from Remotive (free, no key) - remote jobs
    if (params.workTypes.includes("remote") || params.workTypes.length === 0) {
      for (const title of params.jobTitles.slice(0, 3)) {
        try {
          const jobs = await this.fetchFromRemotive(title);
          allJobs.push(...jobs);
          if (jobs.length > 0 && !sources.includes("Remotive")) sources.push("Remotive");
        } catch (e: any) {
          console.error("Remotive error:", e.message);
        }
      }
    }

    // Fetch from Adzuna (if API key available)
    const adzunaAppId = process.env.ADZUNA_APP_ID;
    const adzunaKey = process.env.ADZUNA_API_KEY;
    if (adzunaAppId && adzunaKey) {
      for (const q of queries.slice(0, 3)) {
        try {
          const jobs = await this.fetchFromAdzuna(q.title, q.location, adzunaAppId, adzunaKey, params.page || 1);
          allJobs.push(...jobs);
          if (jobs.length > 0 && !sources.includes("Adzuna")) sources.push("Adzuna");
        } catch (e: any) {
          console.error("Adzuna error:", e.message);
        }
      }
    }

    // Fetch from Jobicy (free, no key)
    try {
      const jobs = await this.fetchFromJobicy(params.jobTitles);
      allJobs.push(...jobs);
      if (jobs.length > 0 && !sources.includes("Jobicy")) sources.push("Jobicy");
    } catch (e: any) {
      console.error("Jobicy error:", e.message);
    }

    // Deduplicate by external ID and URL
    const seen = new Set<string>();
    const deduped = allJobs.filter((job) => {
      const key = job.externalId || job.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Filter by exclude keywords
    let filtered = deduped;
    if (params.excludeKeywords) {
      const excludes = params.excludeKeywords.toLowerCase().split(",").map((k) => k.trim());
      filtered = deduped.filter((job) => {
        const text = `${job.title} ${job.description} ${job.company}`.toLowerCase();
        return !excludes.some((ex) => text.includes(ex));
      });
    }

    // Filter by experience level - use TITLE primarily for strict filtering
    filtered = filtered.filter((job) => {
      // Normalize unicode (some job titles use fancy unicode chars)
      const title = job.title.normalize("NFKD").toLowerCase();
      const text = `${job.title} ${job.description}`.toLowerCase();

      if (params.experienceMax <= 2) {
        // Strict title-based filtering for senior roles
        const seniorTitlePatterns = [
          "senior", "sr.", "sr ", "lead", "principal", "staff", "architect",
          "manager", "director", "head of", "vp ", "chief", "sde ii", "sde iii",
          "sde 2", "sde 3", "level 3", "level 4", "l3", "l4", "l5",
          "tech lead", "team lead",
        ];
        const hasSeniorTitle = seniorTitlePatterns.some((p) => title.includes(p));

        // Allow if title also has junior indicators
        const juniorIndicators = ["junior", "jr.", "jr ", "entry", "associate", "intern", "trainee", "fresher", "graduate", "new grad"];
        const hasJuniorTitle = juniorIndicators.some((p) => title.includes(p));

        if (hasSeniorTitle && !hasJuniorTitle) return false;

        // Exclude roles requiring too many years - multiple patterns
        const yearsPatterns = [
          /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/gi,
          /(\d+)\+?\s*(?:years?|yrs?)\)?/gi,
          /minimum\s+(\d+)\s*(?:years?|yrs?)/gi,
          /at\s+least\s+(\d+)\s*(?:years?|yrs?)/gi,
          /(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years?|yrs?)/g,
        ];
        for (const pattern of yearsPatterns) {
          const matches = [...text.matchAll(pattern)];
          for (const m of matches) {
            const years = parseInt(m[1]);
            if (years > params.experienceMax + 1) return false;
          }
        }
      }
      return true;
    });

    // Filter by must-have keywords
    if (params.keywords) {
      const mustHave = params.keywords.toLowerCase().split(",").map((k) => k.trim());
      filtered = filtered.filter((job) => {
        const text = `${job.title} ${job.description}`.toLowerCase();
        return mustHave.some((kw) => text.includes(kw));
      });
    }

    return { jobs: filtered, sources };
  },

  /**
   * JSearch API (RapidAPI) - aggregates LinkedIn, Indeed, Glassdoor, ZipRecruiter
   */
  async fetchFromJSearch(
    query: string,
    location: string,
    apiKey: string,
    workTypes: string[],
    page: number
  ): Promise<FetchedJob[]> {
    const remoteOnly = workTypes.length === 1 && workTypes[0] === "remote";
    const searchQuery = `${query} in ${location}`;

    const url = new URL("https://jsearch.p.rapidapi.com/search");
    url.searchParams.set("query", searchQuery);
    url.searchParams.set("page", String(page));
    url.searchParams.set("num_pages", "1");
    url.searchParams.set("date_posted", "3days");
    if (remoteOnly) url.searchParams.set("remote_jobs_only", "true");

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    if (!res.ok) throw new Error(`JSearch: ${res.status}`);
    const data = await res.json();

    return (data.data || []).map((job: any) => {
      // Detect actual platform from URL and publisher
      const applyLink = job.job_apply_link || "";
      const publisher = (job.job_publisher || "").toLowerCase();
      let platform = "Other";

      if (applyLink.includes("linkedin.com") || publisher.includes("linkedin")) {
        platform = "LinkedIn";
      } else if (applyLink.includes("indeed.com") || publisher.includes("indeed")) {
        platform = "Indeed";
      } else if (applyLink.includes("glassdoor.com") || publisher.includes("glassdoor")) {
        platform = "Glassdoor";
      } else if (applyLink.includes("ziprecruiter.com") || publisher.includes("ziprecruiter")) {
        platform = "ZipRecruiter";
      } else if (applyLink.includes("naukri.com") || publisher.includes("naukri")) {
        platform = "Naukri";
      } else if (applyLink.includes("shine.com") || publisher.includes("shine")) {
        platform = "Shine";
      } else if (applyLink.includes("monster.com") || publisher.includes("monster")) {
        platform = "Monster";
      } else if (applyLink.includes("lever.co") || publisher.includes("lever")) {
        platform = "Lever";
      } else if (applyLink.includes("greenhouse.io") || publisher.includes("greenhouse")) {
        platform = "Greenhouse";
      } else if (applyLink.includes("workday.com") || publisher.includes("workday")) {
        platform = "Workday";
      } else if (publisher) {
        // Use publisher name as platform (e.g. "Boeing Careers" -> "Boeing")
        platform = job.job_publisher.replace(/\s*(careers?|jobs?)\s*/gi, "").trim() || "Company Site";
      }

      return {
        externalId: `jsearch-${job.job_id}`,
        title: job.job_title || "",
        company: job.employer_name || "",
        location: job.job_city ? `${job.job_city}, ${job.job_state || ""} ${job.job_country || ""}`.trim() : job.job_country || "",
        workType: job.job_is_remote ? "remote" : "onsite",
        description: this.stripHtml(job.job_description || ""),
        url: job.job_apply_link || job.job_google_link || "",
        salary: job.job_min_salary && job.job_max_salary
          ? `${job.job_salary_currency || "USD"} ${job.job_min_salary}-${job.job_max_salary}/${job.job_salary_period || "year"}`
          : "",
        experienceLevel: job.job_required_experience?.experience || "",
        postedAt: job.job_posted_at_datetime_utc || "",
        platform,
      };
    });
  },

  /**
   * Remotive API - free, no key needed, remote jobs only
   */
  async fetchFromRemotive(query: string): Promise<FetchedJob[]> {
    const category = this.mapToRemotiveCategory(query);
    const url = `https://remotive.com/api/remote-jobs${category ? `?category=${category}` : ""}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Remotive: ${res.status}`);
    const data = await res.json();

    const queryLower = query.toLowerCase();
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const jobs = (data.jobs || [])
      .filter((job: any) => {
        // Filter to last 3 days only
        if (job.publication_date) {
          const posted = new Date(job.publication_date).getTime();
          if (posted < threeDaysAgo) return false;
        }
        const text = `${job.title} ${job.description || ""}`.toLowerCase();
        const terms = queryLower.split(/\s+/);
        return terms.some((t) => text.includes(t));
      })
      .slice(0, 25);

    return jobs.map((job: any) => ({
      externalId: `remotive-${job.id}`,
      title: job.title || "",
      company: job.company_name || "",
      location: job.candidate_required_location || "Remote",
      workType: "remote",
      description: this.stripHtml(job.description || ""),
      url: job.url || "",
      salary: job.salary || "",
      experienceLevel: "",
      postedAt: job.publication_date || "",
      platform: "Remotive",
    }));
  },

  /**
   * Arbeitnow API - free, no key needed
   */
  async fetchFromArbeitnow(query: string, page: number): Promise<FetchedJob[]> {
    const url = `https://www.arbeitnow.com/api/job-board-api?page=${page}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Arbeitnow: ${res.status}`);
    const data = await res.json();

    const queryLower = query.toLowerCase();
    const jobs = (data.data || [])
      .filter((job: any) => {
        const text = `${job.title} ${job.description || ""} ${job.tags?.join(" ") || ""}`.toLowerCase();
        const terms = queryLower.split(/\s+/);
        return terms.some((t) => text.includes(t));
      })
      .slice(0, 20);

    return jobs.map((job: any) => ({
      externalId: `arbeitnow-${job.slug}`,
      title: job.title || "",
      company: job.company_name || "",
      location: job.location || "",
      workType: job.remote ? "remote" : "onsite",
      description: this.stripHtml(job.description || ""),
      url: job.url || "",
      salary: "",
      experienceLevel: "",
      postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : "",
      platform: "Arbeitnow",
    }));
  },

  /**
   * Adzuna API - free tier with API key
   */
  async fetchFromAdzuna(
    query: string,
    location: string,
    appId: string,
    apiKey: string,
    page: number
  ): Promise<FetchedJob[]> {
    // Adzuna uses country codes: in = India
    const country = location.toLowerCase().includes("india") ? "in" : "gb";
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${appId}&app_key=${apiKey}&results_per_page=20&what=${encodeURIComponent(query)}&content-type=application/json`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Adzuna: ${res.status}`);
    const data = await res.json();

    return (data.results || []).map((job: any) => ({
      externalId: `adzuna-${job.id}`,
      title: job.title || "",
      company: job.company?.display_name || "",
      location: job.location?.display_name || "",
      workType: job.title?.toLowerCase().includes("remote") ? "remote" : "onsite",
      description: job.description || "",
      url: job.redirect_url || "",
      salary: job.salary_min && job.salary_max ? `INR ${job.salary_min}-${job.salary_max}` : "",
      experienceLevel: "",
      postedAt: job.created || "",
      platform: "Adzuna",
    }));
  },

  // RemoteOK removed - blocks server-side requests

  /**
   * Himalayas.app API - free, no key needed, remote jobs
   */
  async fetchFromHimalayas(query: string): Promise<FetchedJob[]> {
    const url = `https://himalayas.app/jobs/api?limit=50&q=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Himalayas: ${res.status}`);
    const data = await res.json();

    const queryTerms = query.toLowerCase().split(/\s+/);
    const devTerms = ["software", "developer", "engineer", "frontend", "backend", "fullstack", "full-stack", "web", "programmer"];

    return (data.jobs || [])
      .filter((job: any) => {
        // Filter to only dev/software jobs by title and categories
        const title = (job.title || "").toLowerCase();
        const cats = (job.categories || []).join(" ").toLowerCase();
        const isDevJob = devTerms.some((t) => title.includes(t)) || queryTerms.some((t) => title.includes(t))
          || cats.includes("software") || cats.includes("engineering") || cats.includes("developer");
        if (!isDevJob) return false;

        // Filter out senior if seniority data available
        const seniority = (job.seniority || []).map((s: string) => s.toLowerCase());
        if (seniority.includes("senior") || seniority.includes("lead") || seniority.includes("principal")) return false;

        return true;
      })
      .slice(0, 20)
      .map((job: any) => ({
        externalId: `himalayas-${job.companySlug}-${job.title}`.replace(/\s+/g, "-").toLowerCase().slice(0, 100),
        title: job.title || "",
        company: job.companyName || "",
        location: job.locationRestrictions?.join(", ") || "Remote",
        workType: "remote",
        description: this.stripHtml(job.description || job.excerpt || ""),
        url: `https://himalayas.app/companies/${job.companySlug}/jobs/${encodeURIComponent(job.title.toLowerCase().replace(/\s+/g, "-"))}`,
        salary: job.minSalary && job.maxSalary
          ? `${job.currency || "USD"} ${job.minSalary}-${job.maxSalary}`
          : "",
        experienceLevel: (job.seniority || []).join(", "),
        postedAt: "",
        platform: "Himalayas",
      }));
  },

  /**
   * FindWork.dev API - free, no key needed, developer jobs
   */
  async fetchFromFindWork(jobTitles: string[]): Promise<FetchedJob[]> {
    const allJobs: FetchedJob[] = [];

    for (const title of jobTitles.slice(0, 2)) {
      try {
        const url = `https://findwork.dev/api/jobs/?search=${encodeURIComponent(title)}&order_by=-date_posted`;

        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();

        const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;

        const jobs = (data.results || [])
          .filter((job: any) => {
            if (job.date_posted) {
              const posted = new Date(job.date_posted).getTime();
              if (posted < threeDaysAgo) return false;
            }
            return true;
          })
          .slice(0, 15)
          .map((job: any) => ({
            externalId: `findwork-${job.id}`,
            title: job.role || "",
            company: job.company_name || "",
            location: job.location || (job.remote ? "Remote" : ""),
            workType: job.remote ? "remote" : "onsite",
            description: this.stripHtml(job.text || ""),
            url: job.url || "",
            salary: "",
            experienceLevel: "",
            postedAt: job.date_posted || "",
            platform: "FindWork",
          }));

        allJobs.push(...jobs);
      } catch {
        // continue to next title
      }
    }

    return allJobs;
  },

  /**
   * Jobicy API - free, no key needed, remote tech jobs
   */
  async fetchFromJobicy(jobTitles: string[]): Promise<FetchedJob[]> {
    const url = "https://jobicy.com/api/v2/remote-jobs?count=50";

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Jobicy: ${res.status}`);
    const data = await res.json();

    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const titleTerms = jobTitles.flatMap((t) => t.toLowerCase().split(/\s+/));
    const devTerms = ["software", "developer", "engineer", "frontend", "backend", "fullstack", "full-stack", "web dev", "programmer", "coding"];

    return (data.jobs || [])
      .filter((job: any) => {
        if (job.pubDate) {
          const posted = new Date(job.pubDate).getTime();
          if (posted < threeDaysAgo) return false;
        }
        // Only software/dev jobs
        const text = `${job.jobTitle || ""} ${job.jobIndustry || ""}`.toLowerCase();
        return devTerms.some((t) => text.includes(t)) || titleTerms.some((t) => text.includes(t));
      })
      .map((job: any) => ({
        externalId: `jobicy-${job.id}`,
        title: job.jobTitle || "",
        company: job.companyName || "",
        location: job.jobGeo || "Remote",
        workType: "remote",
        description: this.stripHtml(job.jobDescription || job.jobExcerpt || ""),
        url: job.url || "",
        salary: job.annualSalaryMin && job.annualSalaryMax
          ? `$${job.annualSalaryMin}-$${job.annualSalaryMax}`
          : "",
        experienceLevel: job.jobLevel || "",
        postedAt: job.pubDate || "",
        platform: "Jobicy",
      }));
  },

  /**
   * Score and store fetched jobs in the database
   */
  async storeAndScoreJobs(fetchedJobs: FetchedJob[]) {
    // Get user skills for match scoring
    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
      include: { skills: true },
    });
    const userSkills = user?.skills.map((s) => ({ name: s.name, category: s.category })) || [];

    const stored = [];

    for (const job of fetchedJobs) {
      try {
        // Check if already exists
        if (job.externalId) {
          const existing = await prisma.jobListing.findUnique({
            where: { externalId: job.externalId },
          });
          if (existing) {
            stored.push(existing);
            continue;
          }
        }

        // Calculate match score if description available
        let matchScore: number | null = null;
        let detectedSkills: string | null = null;

        if (job.description && job.description.length >= 30) {
          // Use user skills if available, otherwise use default junior dev skills
          const skillsForScoring = userSkills.length > 0
            ? userSkills
            : [
                { name: "JavaScript", category: "technical" },
                { name: "TypeScript", category: "technical" },
                { name: "React", category: "technical" },
                { name: "Node.js", category: "technical" },
                { name: "Python", category: "technical" },
                { name: "HTML", category: "technical" },
                { name: "CSS", category: "technical" },
                { name: "Git", category: "tool" },
                { name: "SQL", category: "technical" },
                { name: "REST API", category: "technical" },
                { name: "Next.js", category: "technical" },
                { name: "MongoDB", category: "technical" },
                { name: "PostgreSQL", category: "technical" },
                { name: "Docker", category: "tool" },
                { name: "AWS", category: "tool" },
              ];
          const analysis = jdAnalyzerService.analyze(job.description, skillsForScoring);
          matchScore = analysis.matchScore;
          detectedSkills = JSON.stringify(analysis.extractedSkills);
        }

        const listing = await prisma.jobListing.create({
          data: {
            externalId: job.externalId || null,
            title: job.title,
            company: job.company,
            location: job.location || null,
            workType: job.workType || null,
            description: job.description || null,
            url: job.url,
            salary: job.salary || null,
            experienceLevel: job.experienceLevel || null,
            postedAt: job.postedAt || null,
            platform: job.platform,
            skills: detectedSkills,
            matchScore,
          },
        });

        stored.push(listing);
      } catch (e: any) {
        // Skip duplicates or errors
        console.error("Store job error:", e.message);
      }
    }

    return stored;
  },

  /**
   * Get stored job listings with filters
   */
  async getListings(filters?: {
    minScore?: number;
    platform?: string;
    workType?: string;
    imported?: boolean;
    hidden?: boolean;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (filters?.minScore) where.matchScore = { gte: filters.minScore };
    if (filters?.platform) where.platform = filters.platform;
    if (filters?.workType) where.workType = filters.workType;
    if (filters?.imported !== undefined) where.imported = filters.imported;
    where.hidden = filters?.hidden ?? false;

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;

    const [listings, total] = await Promise.all([
      prisma.jobListing.findMany({
        where,
        orderBy: [{ matchScore: "desc" }, { fetchedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.jobListing.count({ where }),
    ]);

    return { listings, total, page, totalPages: Math.ceil(total / limit) };
  },

  /**
   * Mark listings as imported (when user sends them to batch apply)
   */
  async markImported(ids: string[]) {
    await prisma.jobListing.updateMany({
      where: { id: { in: ids } },
      data: { imported: true },
    });
  },

  /**
   * Hide irrelevant listings
   */
  async hideListings(ids: string[]) {
    await prisma.jobListing.updateMany({
      where: { id: { in: ids } },
      data: { hidden: true },
    });
  },

  /**
   * Clear old listings (older than 7 days)
   */
  async clearOldListings() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    await prisma.jobListing.deleteMany({
      where: { fetchedAt: { lt: cutoff }, imported: false },
    });
  },

  // --- Helpers ---

  mapToRemotiveCategory(query: string): string {
    const q = query.toLowerCase();
    if (q.includes("software") || q.includes("developer") || q.includes("engineer")) return "software-dev";
    if (q.includes("frontend") || q.includes("front-end") || q.includes("react")) return "software-dev";
    if (q.includes("backend") || q.includes("back-end") || q.includes("node")) return "software-dev";
    if (q.includes("fullstack") || q.includes("full-stack") || q.includes("full stack")) return "software-dev";
    if (q.includes("devops") || q.includes("sre") || q.includes("cloud")) return "devops";
    if (q.includes("data") || q.includes("machine learning") || q.includes("ai")) return "data";
    if (q.includes("qa") || q.includes("test") || q.includes("quality")) return "qa";
    if (q.includes("design") || q.includes("ui") || q.includes("ux")) return "design";
    return "software-dev";
  },

  stripHtml(html: string): string {
    return html
      // Convert custom XML section tags (gh-intro, gh-role-detail, etc.) to section headers
      .replace(/<(gh-[^>]*)>/gi, "\n")
      .replace(/<\/(gh-[^>]*)>/gi, "\n")
      // Convert headings to uppercase section headers
      .replace(/<title>\s*(.*?)\s*<\/title>/gi, "\n\n### $1\n")
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "\n\n### $1\n")
      // Convert bullet points to bullet list
      .replace(/<point>(.*?)<\/point>/gi, "\n• $1")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "\n• $1")
      // Convert <br>, <p>, <div> to newlines
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/text>/gi, "\n")
      .replace(/<text>/gi, "")
      .replace(/<bulletpoints>/gi, "")
      .replace(/<\/bulletpoints>/gi, "\n")
      // Strip remaining HTML tags
      .replace(/<[^>]*>/g, "")
      // Decode HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, "\u201D")
      .replace(/&ldquo;/g, "\u201C")
      .replace(/&mdash;/g, "\u2014")
      .replace(/&ndash;/g, "\u2013")
      // Clean up excessive whitespace but preserve structure
      .replace(/[ \t]+/g, " ")
      .replace(/\n /g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  },
};
