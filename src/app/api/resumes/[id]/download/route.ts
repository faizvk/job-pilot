import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { readFile } from "fs/promises";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resume = await prisma.resume.findUnique({ where: { id } });

    if (!resume || !resume.filePath) {
      return NextResponse.json(
        { error: "No stored file for this resume" },
        { status: 404 }
      );
    }

    let fileBuffer: Buffer;
    const isRemote = /^https?:\/\//i.test(resume.filePath);

    if (isRemote) {
      const res = await fetch(resume.filePath);
      if (!res.ok) {
        return NextResponse.json(
          { error: `Could not fetch stored file (${res.status})` },
          { status: 502 }
        );
      }
      const arrayBuf = await res.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    } else {
      fileBuffer = await readFile(resume.filePath);
    }

    const ext = resume.filePath.split(/[.?#]/).filter(Boolean).pop()?.toLowerCase() || "pdf";
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : ext === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/octet-stream";

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${resume.name}.${ext}"`,
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
