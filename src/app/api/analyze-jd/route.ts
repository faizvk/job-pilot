import { NextRequest, NextResponse } from "next/server";
import { jdAnalyzerService } from "@/lib/services/jd-analyzer.service";
import { profileService } from "@/lib/services/profile.service";
import { analyzeJdSchema } from "@/lib/validators";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobDescription } = analyzeJdSchema.parse(body);
    const profile = await profileService.getProfile(DEFAULT_USER_ID);
    const userSkills = profile.skills.map((s) => ({ name: s.name, category: s.category }));
    const analysis = jdAnalyzerService.analyze(jobDescription, userSkills);
    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
