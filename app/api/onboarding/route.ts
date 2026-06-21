import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fullName, university, position, age } = body;

    if (!fullName?.trim() || !position) {
      return NextResponse.json(
        { error: "Full name and position are required." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: fullName.trim(),
        university: university?.trim() || null,
        organization: university?.trim() || null, // UI combines them
        position,
        age: age ? parseInt(age, 10) : null,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save profile." },
      { status: 500 }
    );
  }
}
