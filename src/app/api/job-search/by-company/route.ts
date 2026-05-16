import { NextRequest, NextResponse } from "next/server";
import { jobSearchService } from "@/lib/services/job-search.service";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const company = url.searchParams.get("company")?.trim();
    const state = url.searchParams.get("state")?.trim() || "";

    if (!company) {
      return NextResponse.json({ error: "company is required" }, { status: 400 });
    }

    const { jobs, sources } = await jobSearchService.searchByCompany(company, state, {
      userId: await getCurrentUserId(),
    });

    return NextResponse.json({
      company,
      state,
      total: jobs.length,
      sources,
      jobs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
