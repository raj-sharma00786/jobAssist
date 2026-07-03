import "server-only";

import type { ContestEvent, ContestPlatform } from "./contestData";

export interface ContestFetchResult {
  contests: ContestEvent[];
  error?: string;
}

type ClistResource = {
  id?: number;
  name?: string;
};

type ClistContest = {
  id: number | string;
  event: string;
  href?: string | null;
  start: string;
  end: string;
  duration?: number;
  resource?: ClistResource | string;
  resource_id?: number;
  host?: string;
};

type ClistContestResponse = {
  objects?: ClistContest[];
};

const CLIST_CONTEST_ENDPOINT = "https://clist.by/api/v4/contest/";
const TARGET_RESOURCE_NAMES = ["codeforces.com", "codechef.com", "leetcode.com"];
const RESOURCE_NAME_TO_PLATFORM: Record<string, ContestPlatform> = {
  "codeforces.com": "Codeforces",
  "codechef.com": "CodeChef",
  "leetcode.com": "LeetCode",
};

export async function getUpcomingContests(): Promise<ContestFetchResult> {
  const username = process.env.CLIST_USERNAME;
  const apiKey = process.env.CLIST_API_KEY;

  if (!username || !apiKey) {
    return {
      contests: [],
      error:
        "Clist credentials are missing. Add CLIST_USERNAME and CLIST_API_KEY to your environment.",
    };
  }

  const now = new Date();
  const clistFriendlyDate = now.toISOString().split(".")[0];

  // We removed the strict 'host__in' filter to prevent the 400 error.
  // We bumped the limit to 150 to ensure we catch our target platforms 
  // among the other random platforms Clist tracks.
  const params = new URLSearchParams({
    format: "json",
    limit: "150",
    order_by: "start",
    start__gt: clistFriendlyDate,
  });

  try {
    const response = await fetch(`${CLIST_CONTEST_ENDPOINT}?${params}`, {
      headers: {
        Accept: "application/json",
        Authorization: `ApiKey ${username}:${apiKey}`,
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Clist API Error:", response.status, errorText);
      return {
        contests: [],
        error: `Clist returned ${response.status}. Please try again shortly.`,
      };
    }

    const payload = (await response.json()) as ClistContestResponse;

    // The filtering happens safely right here! 
    // mapClistContest drops anything that isn't Codeforces, LeetCode, or CodeChef.
    const contests = (payload.objects ?? [])
      .map(mapClistContest)
      .filter((contest): contest is ContestEvent => contest !== null)
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      );

    return { contests };
  } catch (error) {
    console.error("Failed to parse or fetch contests:", error);
    return {
      contests: [],
      error: "Unable to load contests from Clist right now.",
    };
  }
}

function mapClistContest(contest: ClistContest): ContestEvent | null {
  // 4. Fix: Pass the whole contest object so we can check both host and resource properties
  const resourceName = getResourceName(contest);
  const platform = resourceName ? RESOURCE_NAME_TO_PLATFORM[resourceName] : null;

  if (!platform || !contest.start || !contest.end) {
    return null;
  }

  const startsAt = normalizeClistDate(contest.start);
  const endsAt = normalizeClistDate(contest.end);
  const durationMinutes =
    typeof contest.duration === "number"
      ? Math.round(contest.duration / 60)
      : Math.max(
        0,
        Math.round(
          (new Date(endsAt).getTime() - new Date(startsAt).getTime()) /
          (1000 * 60)
        )
      );

  return {
    id: String(contest.id),
    name: contest.event,
    platform,
    startsAt,
    endsAt,
    durationMinutes,
    url: contest.href || platformFallbackUrl(platform),
  };
}

function getResourceName(contest: ClistContest) {
  // Try host field first
  if (contest.host) {
    return contest.host;
  }

  const resource = contest.resource;
  if (!resource) {
    return null;
  }

  if (typeof resource === "string") {
    return resource;
  }

  return resource.name ?? null;
}

function normalizeClistDate(value: string) {
  if (value.endsWith("Z") || /[+-]\d\d:\d\d$/.test(value)) {
    return value;
  }

  return `${value}Z`;
}

function platformFallbackUrl(platform: ContestPlatform) {
  switch (platform) {
    case "Codeforces":
      return "https://codeforces.com/contests";
    case "CodeChef":
      return "https://www.codechef.com/contests";
    case "LeetCode":
      return "https://leetcode.com/contest/";
  }
}