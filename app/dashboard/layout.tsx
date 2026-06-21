import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Zap } from "lucide-react";
import NavLinks from "./components/NavLinks";
import NotificationMenu, {
  type DashboardNotification,
} from "./components/NotificationMenu";
import UserAvatar from "./components/UserAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";

async function getDashboardNotifications(): Promise<DashboardNotification[]> {
  try {
    const [hackathons, archives] = await Promise.all([
      prisma.hackathon.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          organizer: true,
          deadline: true,
        },
      }),
      prisma.interviewExperience.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          company: true,
          role: true,
          date: true,
        },
      }),
    ]);

    return [
      ...hackathons.map((item) => ({
        id: `hackathon-${item.id}`,
        kind: "Hackathon" as const,
        title: item.title,
        body: `${item.organizer} - ${item.deadline}`,
        href: "/dashboard/hackathons",
      })),
      ...archives.map((item) => ({
        id: `archive-${item.id}`,
        kind: "Interview" as const,
        title: `${item.company} ${item.role}`,
        body: item.date,
        href: "/dashboard/archives",
      })),
    ].slice(0, 5);
  } catch {
    return [];
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  if (session.user && !session.user.onboardingCompleted) {
    redirect('/onboarding');
  }

  const notifications = await getDashboardNotifications();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ═══════════ FLOATING NAV BAR ═══════════ */}
      <div className="sticky top-0 z-50 pt-5 px-4">
        <nav className="mx-auto max-w-7xl bg-surface border border-outline-variant rounded-2xl p-2 px-4 flex items-center gap-3 shadow-sm">
          <Link
            href="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-body transition-colors hover:bg-surface-container hover:text-display"
            aria-label="Back to landing page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* ── Group 1: Logo ── */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 pr-1">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-display">
              JobAssist
            </span>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-outline-variant/50 shrink-0" />

          {/* ── Group 2: Nav Links (Client Component) ── */}
          <NavLinks />

          {/* Divider */}
          <div className="w-px h-6 bg-outline-variant/50 shrink-0" />

          {/* ── Group 3: Actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <NotificationMenu notifications={notifications} />

            {/* Avatar + Dropdown (Client Component) */}
            <UserAvatar
              name={session?.user?.name}
              email={session?.user?.email}
              image={session?.user?.image}
            />
          </div>
        </nav>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
