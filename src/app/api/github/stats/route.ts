import { NextRequest, NextResponse } from "next/server";
import { fetchFullGitHubStats } from "@/lib/services/github.service";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  try {
    const stats = await fetchFullGitHubStats(username);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
