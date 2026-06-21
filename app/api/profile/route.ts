import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET — fetch current user profile
export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      university: true,
      position: true,
      age: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PUT — update user profile
export async function PUT(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, university, position, age } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
        university: university?.trim() || null,
        position: position || null,
        age: age ? parseInt(age, 10) : null,
      },
      select: {
        name: true,
        email: true,
        university: true,
        position: true,
        age: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
