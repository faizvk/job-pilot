import { NextRequest, NextResponse } from "next/server";
import { jobSearchService } from "@/lib/services/job-search.service";

// PATCH: Mark listings as imported or hidden
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || !action) {
      return NextResponse.json({ error: "ids and action required" }, { status: 400 });
    }

    if (action === "import") {
      await jobSearchService.markImported(ids);
    } else if (action === "hide") {
      await jobSearchService.hideListings(ids);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Clear old listings
export async function DELETE() {
  try {
    await jobSearchService.clearOldListings();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
