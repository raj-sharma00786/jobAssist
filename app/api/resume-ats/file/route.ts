import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scan = await prisma.resumeScan.findUnique({
    where: { userId: session.user.id },
    select: {
      fileName: true,
      fileMimeType: true,
      fileData: true,
    },
  });

  if (!scan) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return new NextResponse(scan.fileData, {
    headers: {
      "Content-Type": scan.fileMimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(scan.fileName)}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
