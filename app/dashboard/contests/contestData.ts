export type ContestPlatform = "LeetCode" | "Codeforces" | "CodeChef";

export interface ContestEvent {
  id: string;
  name: string;
  platform: ContestPlatform;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  url: string;
}

export const PLATFORM_STYLES: Record<
  ContestPlatform,
  {
    dot: string;
    pill: string;
  }
> = {
  LeetCode: {
    dot: "bg-[#eab308]",
    pill:
      "border-[#eab308]/40 bg-[#eab308]/10 text-yellow-900 dark:text-yellow-100 shadow-[0_0_14px_rgba(234,179,8,0.06)]",
  },
  Codeforces: {
    dot: "bg-[#3b82f6]",
    pill:
      "border-[#3b82f6]/40 bg-[#3b82f6]/10 text-blue-900 dark:text-blue-100 shadow-[0_0_14px_rgba(59,130,246,0.06)]",
  },
  CodeChef: {
    dot: "bg-[#ea580c]",
    pill:
      "border-[#ea580c]/40 bg-[#ea580c]/10 text-orange-900 dark:text-orange-100 shadow-[0_0_14px_rgba(234,88,12,0.06)]",
  },
};
