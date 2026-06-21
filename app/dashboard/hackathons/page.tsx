import { prisma } from "@/lib/prisma";
import HackathonsClient, {
  type HackathonOpportunityView,
} from "./HackathonsClient";

function splitTags(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function getHackathons(): Promise<HackathonOpportunityView[]> {
  try {
    const opportunities = await prisma.hackathon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return opportunities.map((opportunity) => ({
      id: opportunity.id,
      title: opportunity.title,
      organizer: opportunity.organizer,
      type: "Hackathon",
      status: "Upcoming",
      mode: "Online",
      starts: opportunity.date,
      deadline: opportunity.deadline,
      prize: "Registration open",
      teamSize: "Open",
      difficulty: "Intermediate",
      skills: splitTags(opportunity.tags),
      accent: "primary",
      applicants: "New",
      sourceUrl: opportunity.registrationUrl,
      description: `${opportunity.organizer} is hosting this ${opportunity.tags} opportunity. Register before the deadline to participate.`,
    }));
  } catch {
    return [];
  }
}

export default async function HackathonsPage() {
  const opportunities = await getHackathons();

  return <HackathonsClient opportunities={opportunities} />;
}
