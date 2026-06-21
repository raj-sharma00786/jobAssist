"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Search,
  Sparkles,
} from "lucide-react";

type ArchiveType = "On-Campus" | "Off-Campus";
type FilterKey = "All" | ArchiveType;

export interface ArchiveRoundView {
  heading: string;
  body: string;
}

export interface ArchiveEntryView {
  id: string;
  company: string;
  role: string;
  type: ArchiveType;
  dateLabel: string;
  title: string;
  author: string | null;
  postedAgo: string | null;
  summary: string;
  aiTopics: string[];
  rounds: ArchiveRoundView[];
  articleUrl: string;
  sourceName: string;
}

const FILTERS: FilterKey[] = ["All", "On-Campus", "Off-Campus"];

export default function ArchivesClient({
  archives,
}: {
  archives: ArchiveEntryView[];
}) {
  const [activeId, setActiveId] = useState(archives[0]?.id ?? "");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArchives = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return archives.filter((entry) => {
      const matchesType = activeFilter === "All" || entry.type === activeFilter;

      if (!matchesType) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        entry.company,
        entry.role,
        entry.type,
        entry.dateLabel,
        entry.title,
        entry.summary,
        ...entry.aiTopics,
        ...entry.rounds.flatMap((round) => [round.heading, round.body]),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [activeFilter, archives, searchQuery]);

  const active =
    filteredArchives.find((entry) => entry.id === activeId) ??
    filteredArchives[0] ??
    null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent">
            <BookOpen className="h-3.5 w-3.5" />
            Interview Library
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-display md:text-4xl">
            Interview Archives
          </h1>
          <p className="mt-1.5 max-w-2xl text-base text-body">
            Read short summaries, key topics, and round breakdowns before
            opening the full source article.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Total" value={archives.length} />
          <MetricCard
            label="On Campus"
            value={archives.filter((entry) => entry.type === "On-Campus").length}
            valueClass="text-success"
          />
          <MetricCard
            label="Off Campus"
            value={archives.filter((entry) => entry.type === "Off-Campus").length}
            valueClass="text-accent"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.08,
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface/60 p-4 md:flex-row md:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search company, role, topics, or rounds..."
            className="w-full rounded-xl border border-outline-variant bg-background py-2.5 pl-10 pr-4 text-sm text-display placeholder-body transition-colors focus:border-primary/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
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

      <div className="flex flex-col gap-5 md:flex-row">
        <div className="w-full shrink-0 space-y-3 md:w-80">
          {filteredArchives.length > 0 ? (
            filteredArchives.map((entry, index) => {
              const isActive = entry.id === active?.id;
              const TypeIcon =
                entry.type === "On-Campus" ? GraduationCap : BriefcaseBusiness;

              return (
                <motion.button
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                  type="button"
                  onClick={() => setActiveId(entry.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all duration-300 ${
                    isActive
                      ? "border-primary/60 bg-surface-container shadow-lg"
                      : "border-outline-variant bg-surface hover:border-primary/30 hover:bg-surface-container"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-container text-body"
                      }`}
                    >
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          isActive ? "text-display" : "text-body"
                        }`}
                      >
                        {entry.company} - {entry.role}
                      </p>
                      <p className="mt-1 text-xs text-body">
                        {entry.type} - {entry.dateLabel}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="rounded-xl border border-outline-variant bg-surface/60 p-5 text-center">
              <p className="text-sm font-bold text-display">No archives found</p>
              <p className="mt-1 text-xs leading-relaxed text-body">
                Try a different search term or filter.
              </p>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                className="rounded-xl border border-outline-variant bg-surface/60 p-6 md:p-8"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-display">
                      {active.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-body">
                      {active.author ? `Posted by ${active.author}` : active.sourceName}
                      {active.postedAgo ? ` - ${active.postedAgo}` : ""}
                    </p>
                  </div>

                  <Link
                    href={active.articleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
                  >
                    Full Interview Experience
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 rounded-xl border border-outline-variant bg-background p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-body">
                    Summary
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-body">
                    {active.summary}
                  </p>
                </div>

                <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent">
                      AI Extracted Topics
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.aiTopics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-md border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  {active.rounds.map((round) => (
                    <div key={round.heading}>
                      <h3 className="mb-2 text-sm font-bold text-display">
                        {round.heading}
                      </h3>
                      <p className="text-sm leading-relaxed text-body">
                        {round.body}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-outline-variant bg-surface/60 p-8 text-center"
              >
                <p className="text-lg font-bold text-display">
                  No interview archives available yet
                </p>
                <p className="mt-2 text-sm text-body">
                  Check back soon for new interview experience summaries.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  valueClass = "text-display",
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container px-4 py-3">
      <p className={`text-2xl font-bold leading-none ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs font-medium text-body">{label}</p>
    </div>
  );
}
