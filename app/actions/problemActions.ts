"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProblemStatus(problemId: string, newStatus: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  await prisma.submission.upsert({
    where: {
      userId_problemId: { userId, problemId },
    },
    update: {
      status: newStatus,
    },
    create: {
      userId,
      problemId,
      status: newStatus,
    },
  });

  return { success: true };
}
