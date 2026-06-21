import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KanbanBoard, { type ProblemWithStatus } from "@/components/KanbanBoard";

export default async function ProblemBankPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Fetch all problems with the current user's submission status
  const problems = await prisma.problem.findMany({
    include: {
      submissions: userId
        ? { where: { userId }, select: { status: true } }
        : false,
    },
    orderBy: { title: "asc" },
  });

  // Map to the shape our Kanban component expects
  const problemsWithStatus: ProblemWithStatus[] = problems.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    category: p.category,
    company: p.company,
    url: p.url,
    status:
      p.submissions && Array.isArray(p.submissions) && p.submissions.length > 0
        ? p.submissions[0].status
        : "UNSEEN",
  }));

  return <KanbanBoard initialProblems={problemsWithStatus} />;
}
