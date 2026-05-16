import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/services/application.service";
import { createApplicationSchema } from "@/lib/validators";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const apps = await applicationService.list(await getCurrentUserId(), { status, search });
    return NextResponse.json(apps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createApplicationSchema.parse(body);
    const app = await applicationService.create(await getCurrentUserId(), data);
    return NextResponse.json(app, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
