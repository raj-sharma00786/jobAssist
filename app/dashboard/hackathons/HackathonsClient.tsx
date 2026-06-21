"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  BellRing,
  Building2,
  CalendarDays,
  Clock3,
  Code2,
  Filter,
  Flame,
  GraduationCap,
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

type OpportunityStatus = "Live" | "Upcoming";
type FilterKey = "All" | OpportunityStatus;
type AccentKey = "primary" | "secondary" | "accent" | "info";

export interface HackathonOpportunityView {
  id: string;
  title: string;
  organizer: string;
  type: string;
  status: OpportunityStatus;
  mode: string;
  starts: string;
  deadline: string;
  prize: string;
  teamSize: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  skills: string[];
  accent: AccentKey;
  applicants: string;
  sourceUrl: string | null;
  description: string;
}

const FILTERS: FilterKey[] = ["All", "Live", "Upcoming"];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const accentClasses = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "hover:border-primary/35",
  },
  secondary: {
    bg: "bg-secondary/10",
    text: "text-secondary",
    border: "hover:border-secondary/35",
  },
  accent: {
    bg: "bg-accent/10",
    text: "text-accent",
    border: "hover:border-accent/35",
  },
  info: {
    bg: "bg-info/10",
    text: "text-info",
    border: "hover:border-info/35",
  },
};

export default function HackathonsClient({
  opportunities,
}: {
  opportunities: HackathonOpportunityView[];
}) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [reminders, setReminders] = useState<Set<string>>(new Set());

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return opportunities.filter((opportunity) => {
      const matchesStatus =
        activeFilter === "All" || opportunity.status === activeFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        opportunity.title,
        opportunity.organizer,
        opportunity.type,
        opportunity.status,
        opportunity.mode,
        opportunity.difficulty,
        opportunity.description,
        ...opportunity.skills,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [activeFilter, opportunities, searchQuery]);

  const liveCount = opportunities.filter(
    (opportunity) => opportunity.status === "Live"
  ).length;
  const upcomingCount = opportunities.length - liveCount;

  function toggleReminder(id: string) {
    setReminders((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
            <Flame className="h-3.5 w-3.5" />
            Opportunity Radar
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-display md:text-4xl">
            Hackathons & Coding Challenges
          </h1>
          <p className="mt-1.5 max-w-2xl text-base text-body">
            Track live hiring hackathons, college contests, and upcoming coding
            challenges before registration closes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          <MetricCard label="Tracked" value={opportunities.length} />
          <MetricCard label="Live Now" value={liveCount} valueClass="text-success" />
          <MetricCard
            label="Upcoming"
            value={upcomingCount}
            valueClass="text-accent"
            className="col-span-2 sm:col-span-1"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.12,
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface/60 p-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by company, college, skill, or difficulty..."
            className="w-full rounded-xl border border-outline-variant bg-background py-2.5 pl-10 pr-4 text-sm text-display placeholder-body transition-colors focus:border-primary/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container">
            <Filter className="h-4 w-4 text-body" />
          </div>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-on-primary"
                    : "border border-outline-variant bg-surface text-body hover:text-display"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity, index) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                index={index}
                hasReminder={reminders.has(opportunity.id)}
                onToggleReminder={toggleReminder}
              />
            ))
          ) : (
            <div className="rounded-xl border border-outline-variant bg-surface/60 p-8 text-center">
              <p className="text-lg font-bold text-display">
                No matching hackathons
              </p>
              <p className="mt-2 text-sm text-body">
                Try a different search term or filter.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-4">
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.18,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="rounded-xl border border-outline-variant bg-surface/60 p-6"
          >
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent">
                Matching Insight
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-display">
              Prioritize hiring hackathons first
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-body">
              Start with live hiring events, then add upcoming contests to your
              reminder list so deadlines do not slip.
            </p>
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4">
              <p className="text-sm font-bold text-display">This week&apos;s focus</p>
              <p className="mt-1 text-sm text-body">
                Register, form a team, solve one mock round, and track the
                deadline.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function OpportunityCard({
  opportunity,
  index,
  hasReminder,
  onToggleReminder,
}: {
  opportunity: HackathonOpportunityView;
  index: number;
  hasReminder: boolean;
  onToggleReminder: (id: string) => void;
}) {
  const accent = accentClasses[opportunity.accent];
  const Icon =
    opportunity.type === "Campus Contest"
      ? GraduationCap
      : opportunity.type === "Coding Challenge"
        ? Code2
        : Building2;

  return (
    <motion.article
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className={`group rounded-xl border border-outline-variant bg-surface/60 p-5 transition-all duration-300 ${accent.border}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.bg}`}
          >
            <Icon className={`h-5 w-5 ${accent.text}`} />
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${accent.bg} ${accent.text}`}
              >
                {opportunity.type}
              </span>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  opportunity.status === "Live"
                    ? "bg-success/10 text-success"
                    : "bg-accent/10 text-accent"
                }`}
              >
                {opportunity.status}
              </span>
              <span className="rounded-lg bg-surface-container px-2.5 py-1 text-xs font-medium text-body">
                {opportunity.mode}
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-display">
              {opportunity.title}
            </h2>
            <p className="mt-1 text-sm font-medium text-body">
              Hosted by {opportunity.organizer}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">
              {opportunity.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleReminder(opportunity.id)}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
            hasReminder
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-outline-variant bg-surface text-display hover:bg-surface-container-highest"
          }`}
        >
          {hasReminder ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4 text-primary" />
          )}
          {hasReminder ? "Reminder On" : "Remind"}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <InfoTile icon={CalendarDays} label="Starts" value={opportunity.starts} />
        <InfoTile icon={Clock3} label="Deadline" value={opportunity.deadline} />
        <InfoTile icon={Trophy} label="Reward" value={opportunity.prize} />
        <InfoTile icon={Users} label="Team" value={opportunity.teamSize} />
      </div>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {opportunity.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-outline-variant bg-background px-3 py-1.5 text-xs font-medium text-body"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-body">
            {opportunity.applicants} students watching
          </span>
          {opportunity.sourceUrl ? (
            <Link
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:opacity-80"
            >
              View Details
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span className="text-sm font-semibold text-body">
              Details coming soon
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function MetricCard({
  label,
  value,
  className = "",
  valueClass = "text-display",
}: {
  label: string;
  value: number;
  className?: string;
  valueClass?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-outline-variant bg-surface-container px-4 py-3 ${className}`}
    >
      <p className={`text-2xl font-bold leading-none ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs font-medium text-body">{label}</p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-background p-3">
      <div className="mb-2 flex items-center gap-1.5 text-body">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug text-display">{value}</p>
    </div>
  );
}
