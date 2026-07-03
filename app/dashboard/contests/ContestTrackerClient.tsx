"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Trophy,
} from "lucide-react";
import {
  PLATFORM_STYLES,
  type ContestEvent,
} from "./contestData";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const SHORT_MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
});
const START_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export default function ContestTrackerClient({
  contests,
  fetchError,
}: {
  contests: ContestEvent[];
  fetchError?: string;
}) {
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(contests[0]?.startsAt ? new Date(contests[0].startsAt) : new Date())
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth]
  );
  const contestsByDate = useMemo(() => groupContestsByDate(contests), [contests]);
  const now = useMemo(() => new Date(), []);
  const upcomingContests = useMemo(
    () =>
      contests
        .filter((contest) => new Date(contest.endsAt).getTime() >= now.getTime())
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        ),
    [contests, now]
  );

  function shiftMonth(direction: -1 | 1) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + direction, 1)
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
            <Trophy className="h-3.5 w-3.5" />
            Competitive Programming
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-display md:text-4xl">
            Contest Tracker
          </h1>
          <p className="mt-1.5 max-w-2xl text-base text-body">
            Track upcoming Codeforces, CodeChef, and LeetCode contests in a
            calendar-first view.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SummaryStat label="Total" value={contests.length} />
          <SummaryStat label="This Month" value={countInMonth(contests, visibleMonth)} />
          <SummaryStat label="Upcoming" value={upcomingContests.length} />
        </div>
      </motion.div>

      {fetchError ? <ContestFetchAlert message={fetchError} /> : null}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.08,
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]"
      >
        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-[#141414] shadow-[0_0_24px_rgba(253,157,39,0.04)]">
          <div className="flex items-center justify-between border-b border-outline-variant/70 bg-[#0a0a0a] px-4 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-display md:text-xl">
                {MONTH_FORMATTER.format(visibleMonth)}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface text-body transition-colors hover:border-primary/40 hover:text-primary"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface text-body transition-colors hover:border-primary/40 hover:text-primary"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <CalendarGrid
            days={calendarDays}
            visibleMonth={visibleMonth}
            contestsByDate={contestsByDate}
          />
        </section>

        <UpcomingContestsSidebar contests={upcomingContests} />
      </motion.div>
    </div>
  );
}

function CalendarGrid({
  days,
  visibleMonth,
  contestsByDate,
}: {
  days: Date[];
  visibleMonth: Date;
  contestsByDate: Map<string, ContestEvent[]>;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-b border-outline-variant/70 bg-[#0a0a0a]">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-semibold text-body md:text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateKey = toDateKey(day);
            const dayContests = contestsByDate.get(dateKey) ?? [];
            const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
            const isToday = dateKey === toDateKey(new Date());

            return (
              <div
                key={dateKey}
                className={`min-h-[8.5rem] border-b border-r border-outline-variant/70 p-2 last:border-r-0 md:min-h-[9.25rem] ${
                  isToday ? "bg-info/20" : "bg-[#141414]"
                }`}
              >
                <div
                  className={`mb-2 text-center text-sm font-medium ${
                    isCurrentMonth ? "text-body" : "text-body/35"
                  }`}
                >
                  {day.getDate()}
                </div>

                <div className="space-y-1.5">
                  {dayContests.map((contest) => (
                    <ContestPill key={contest.id} contest={contest} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ContestPill({ contest }: { contest: ContestEvent }) {
  const style = PLATFORM_STYLES[contest.platform];

  return (
    <a
      href={contest.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold leading-tight transition-transform hover:-translate-y-0.5 hover:brightness-110 ${style.pill}`}
      title={`${contest.name} on ${contest.platform}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
      {contest.platform === "Codeforces" ? (
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#ef4444]" />
      ) : null}
      <span className="min-w-0 truncate">{contest.name}</span>
    </a>
  );
}

function UpcomingContestsSidebar({ contests }: { contests: ContestEvent[] }) {
  return (
    <aside className="rounded-2xl border border-outline-variant bg-[#141414] p-4 lg:sticky lg:top-28 lg:self-start">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight text-display">
          Upcoming Contests
        </h2>
      </div>

      <div className="space-y-3">
        {contests.length > 0 ? (
          contests
            .slice(0, 8)
            .map((contest) => (
              <UpcomingContestCard key={contest.id} contest={contest} />
            ))
        ) : (
          <div className="rounded-xl border border-outline-variant/70 bg-[#0a0a0a] px-4 py-6 text-sm font-medium text-body">
            No upcoming Codeforces, CodeChef, or LeetCode contests are available
            right now.
          </div>
        )}
      </div>
    </aside>
  );
}

function UpcomingContestCard({ contest }: { contest: ContestEvent }) {
  const startDate = new Date(contest.startsAt);
  const style = PLATFORM_STYLES[contest.platform];

  return (
    <a
      href={contest.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 border-b border-outline-variant/70 pb-3 transition-colors hover:border-primary/50 last:border-b-0 last:pb-0"
      title={`Open ${contest.name} on ${contest.platform}`}
    >
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-outline-variant bg-[#0a0a0a] text-display">
        <span className="text-[10px] font-bold uppercase leading-none text-body">
          {SHORT_MONTH_FORMATTER.format(startDate)}
        </span>
        <span className="mt-1 text-lg font-black leading-none">
          {startDate.getDate()}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-display">
          {contest.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-body">
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
            {contest.platform}
          </span>
          <span className="inline-flex items-center gap-1 text-body/90">
            <Clock3 className="h-3.5 w-3.5" />
            {formatCountdown(contest.startsAt, contest.endsAt)}
          </span>
        </div>
        <p className="mt-1 text-xs text-body/75">
          Starts at {START_TIME_FORMATTER.format(startDate)}
        </p>
      </div>
    </a>
  );
}

function ContestFetchAlert({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-[#fcd34d]">
      {message}
    </div>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container px-4 py-3">
      <p className="text-2xl font-bold leading-none text-display">{value}</p>
      <p className="mt-1 text-xs font-medium text-body">{label}</p>
    </div>
  );
}

function buildCalendarDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  ).getDate();
  const gridLength = Math.ceil((firstDay.getDay() + daysInMonth) / 7) * 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: gridLength }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function groupContestsByDate(contests: ContestEvent[]) {
  return contests.reduce((map, contest) => {
    const dateKey = toDateKey(new Date(contest.startsAt));
    const entries = map.get(dateKey) ?? [];
    entries.push(contest);
    map.set(
      dateKey,
      entries.sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      )
    );
    return map;
  }, new Map<string, ContestEvent[]>());
}

function countInMonth(contests: ContestEvent[], monthDate: Date) {
  return contests.filter((contest) => {
    const contestDate = new Date(contest.startsAt);
    return (
      contestDate.getFullYear() === monthDate.getFullYear() &&
      contestDate.getMonth() === monthDate.getMonth()
    );
  }).length;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatCountdown(startsAt: string, endsAt: string) {
  const now = new Date();
  const startTime = new Date(startsAt).getTime();
  const endTime = new Date(endsAt).getTime();

  if (startTime <= now.getTime() && endTime >= now.getTime()) {
    return "Running now";
  }

  const diffMs = startTime - now.getTime();

  if (diffMs <= 0) {
    return "Ended";
  }

  const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days <= 0) {
    return `Starts in ${hours}h`;
  }

  return `Starts in ${days}d ${hours}h`;
}
