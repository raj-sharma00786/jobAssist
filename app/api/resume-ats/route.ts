import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { analyzeResume } from "@/lib/resumeAnalyzer";
import { extractPdfText } from "@/lib/resumePdf";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PDF_MIME_TYPES = ["application/pdf", "application/x-pdf"];

function serializeScan(scan: Awaited<ReturnType<typeof getLatestScan>>) {
  if (!scan) {
    return null;
  }

  return {
    id: scan.id,
    fileName: scan.fileName,
    fileMimeType: scan.fileMimeType,
    fileSize: scan.fileSize,
    targetRole: scan.targetRole,
    score: scan.score,
    verdict: scan.verdict,
    matchedKeywords: scan.matchedKeywords,
    missingKeywords: scan.missingKeywords,
    sectionScores: scan.sectionScores,
    suggestions: scan.suggestions,
    extractedTextPreview: scan.extractedText.slice(0, 600),
    createdAt: scan.createdAt.toISOString(),
    updatedAt: scan.updatedAt.toISOString(),
    fileUrl: "/api/resume-ats/file",
  };
}

async function getCurrentUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return session.user.id;
}

function getLatestScan(userId: string) {
  return prisma.resumeScan.findUnique({
    where: { userId },
    select: {
      id: true,
      fileName: true,
      fileMimeType: true,
      fileSize: true,
      extractedText: true,
      targetRole: true,
      score: true,
      verdict: true,
      matchedKeywords: true,
      missingKeywords: true,
      sectionScores: true,
      suggestions: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scan = await getLatestScan(userId);
  return NextResponse.json({ scan: serializeScan(scan) });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    const targetRole =
      formData.get("targetRole")?.toString().trim() || "Software Engineer Intern";
    const jobDescription = formData.get("jobDescription")?.toString().trim() || "";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a PDF resume." },
        { status: 400 }
      );
    }

    if (!PDF_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF resumes are supported right now." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Resume must be 5MB or smaller." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const extractedText = await extractPdfText(fileBuffer);

    if (extractedText.length < 80) {
      return NextResponse.json(
        {
          error:
            "We could not read enough text from this PDF. Please upload a text-based resume PDF instead of a scanned image.",
        },
        { status: 422 }
      );
    }

    const analysis = analyzeResume(extractedText, targetRole, jobDescription);
    const matchedKeywords = analysis.matchedKeywords as Prisma.InputJsonValue;
    const missingKeywords = analysis.missingKeywords as Prisma.InputJsonValue;
    const sectionScores = analysis.sectionScores as unknown as Prisma.InputJsonValue;
    const suggestions = analysis.suggestions as unknown as Prisma.InputJsonValue;

    const scan = await prisma.resumeScan.upsert({
      where: { userId },
      create: {
        userId,
        fileName: file.name,
        fileMimeType: file.type,
        fileSize: file.size,
        fileData: fileBuffer,
        extractedText,
        targetRole,
        score: analysis.score,
        verdict: analysis.verdict,
        matchedKeywords,
        missingKeywords,
        sectionScores,
        suggestions,
      },
      update: {
        fileName: file.name,
        fileMimeType: file.type,
        fileSize: file.size,
        fileData: fileBuffer,
        extractedText,
        targetRole,
        score: analysis.score,
        verdict: analysis.verdict,
        matchedKeywords,
        missingKeywords,
        sectionScores,
        suggestions,
      },
      select: {
        id: true,
        fileName: true,
        fileMimeType: true,
        fileSize: true,
        extractedText: true,
        targetRole: true,
        score: true,
        verdict: true,
        matchedKeywords: true,
        missingKeywords: true,
        sectionScores: true,
        suggestions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ scan: serializeScan(scan) }, { status: 201 });
  } catch (error) {
    console.error("Resume ATS scan failed", error);

    return NextResponse.json(
      { error: "Failed to scan resume. Please try another PDF." },
      { status: 500 }
    );
  }
}
