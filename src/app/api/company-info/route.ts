import { NextRequest, NextResponse } from "next/server";
import { getCompanyInfo } from "@/lib/services/company-info.service";

export async function GET(req: NextRequest) {
  try {
    const company = req.nextUrl.searchParams.get("company");
    if (!company) {
      return NextResponse.json({ error: "company param required" }, { status: 400 });
    }

    const info = await getCompanyInfo(company);
    if (!info) {
      return NextResponse.json({ error: "No information found" }, { status: 404 });
    }

    return NextResponse.json(info);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
