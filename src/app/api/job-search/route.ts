import { NextRequest, NextResponse } from "next/server";
import { jobSearchService } from "@/lib/services/job-search.service";

// POST: Fetch jobs from external APIs based on search params
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobTitles, locations, workTypes, experienceMin, experienceMax, keywords, excludeKeywords, page } = body;

    if (!jobTitles || !Array.isArray(jobTitles) || jobTitles.length === 0) {
      return NextResponse.json({ error: "At least one job title required" }, { status: 400 });
    }

    // Fetch from external APIs
    const { jobs: fetchedJobs, sources } = await jobSearchService.fetchJobs({
      jobTitles,
      locations: locations || [],
      workTypes: workTypes || [],
      experienceMin: experienceMin ?? 0,
      experienceMax: experienceMax ?? 2,
      keywords,
      excludeKeywords,
      page: page || 1,
    });

    // Store and score them
    const stored = await jobSearchService.storeAndScoreJobs(fetchedJobs);

    return NextResponse.json({
      fetched: fetchedJobs.length,
      stored: stored.length,
      sources,
      listings: stored.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Get stored listings with filters
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const minScore = url.searchParams.get("minScore");
    const platform = url.searchParams.get("platform");
    const workType = url.searchParams.get("workType");
    const imported = url.searchParams.get("imported");
    const page = url.searchParams.get("page");

    const result = await jobSearchService.getListings({
      minScore: minScore ? parseInt(minScore) : undefined,
      platform: platform || undefined,
      workType: workType || undefined,
      imported: imported !== null ? imported === "true" : undefined,
      page: page ? parseInt(page) : 1,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
