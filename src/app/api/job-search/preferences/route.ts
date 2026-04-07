import { NextRequest, NextResponse } from "next/server";
import { jobSearchService } from "@/lib/services/job-search.service";

export async function GET() {
  try {
    const prefs = await jobSearchService.getPreferences();
    return NextResponse.json(prefs || { empty: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await jobSearchService.savePreferences(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
