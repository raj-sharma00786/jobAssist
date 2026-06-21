import { prisma } from "@/lib/prisma";
import ArchivesClient, {
  type ArchiveEntryView,
  type ArchiveRoundView,
} from "./ArchivesClient";

function splitTopics(topics: string): string[] {
  return topics
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean);
}

async function getArchives(): Promise<ArchiveEntryView[]> {
  try {
    const archives = await prisma.interviewExperience.findMany({
      orderBy: { createdAt: "desc" },
    });

    return archives.map((entry) => ({
      id: entry.id,
      company: entry.company,
      role: entry.role,
      type: "Off-Campus",
      dateLabel: entry.date,
      title: `${entry.company} ${entry.role} Experience`,
      author: null,
      postedAgo: null,
      summary: entry.summary,
      aiTopics: splitTopics(entry.topics),
      rounds: [
        {
          heading: "Experience Summary",
          body: entry.summary,
        },
      ] satisfies ArchiveRoundView[],
      articleUrl: entry.fullUrl,
      sourceName: "GeeksforGeeks",
    }));
  } catch {
    return [];
  }
}

export default async function ArchivesPage() {
  const archives = await getArchives();

  return <ArchivesClient archives={archives} />;
}
