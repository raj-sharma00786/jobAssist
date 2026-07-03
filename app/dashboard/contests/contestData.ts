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
    dot: "bg-[#facc15]",
    pill:
      "border-[#facc15]/80 bg-[#facc15]/15 text-[#fde68a] shadow-[0_0_14px_rgba(250,204,21,0.08)]",
  },
  Codeforces: {
    dot: "bg-[#60a5fa]",
    pill:
      "border-[#60a5fa]/80 bg-[#1d4ed8]/20 text-[#bfdbfe] shadow-[0_0_14px_rgba(96,165,250,0.08)]",
  },
  CodeChef: {
    dot: "bg-[#b45309]",
    pill:
      "border-[#c2410c]/80 bg-[#7c2d12]/35 text-[#fed7aa] shadow-[0_0_14px_rgba(194,65,12,0.08)]",
  },
};
