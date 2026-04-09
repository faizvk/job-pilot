import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resume = await prisma.resume.findUnique({
      where: { id },
      select: { latexContent: true },
    });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ latexContent: resume.latexContent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { latexContent } = await req.json();
    const resume = await prisma.resume.update({
      where: { id },
      data: { latexContent },
    });
    return NextResponse.json({ latexContent: resume.latexContent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
