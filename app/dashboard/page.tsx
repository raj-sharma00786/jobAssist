"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Code2,
  Building2,
  BarChart3,
  TrendingUp,
  FileSearch,
  ArrowRight,
  Flame,
  Trophy,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function DashboardOverview() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "User";

  return (
    <div className="space-y-8">
      {/* ═══════════ HEADER ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-display">
          Welcome back, {firstName}!
        </h1>
        <p className="text-body text-base mt-1.5">
          Tech Placement &amp; Interview Command Center.
        </p>
      </motion.div>

      {/* ═══════════ TOP ROW: 3 CARDS ═══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Daily Challenge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="group relative bg-surface-container border border-outline-variant rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Code2 className="w-4.5 h-4.5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-body uppercase tracking-[0.15em]">
                  Daily Challenge
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-display mb-1">LRU Cache</h3>
            <p className="text-sm text-body opacity-80">
              LeetCode 146 •{" "}
              <span className="text-primary font-semibold">Medium</span>
            </p>
            <Link
              href="/dashboard/problems"
              className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:opacity-80 transition-colors group/link"
            >
              Solve Now
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Card 2: Next Drive */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="group relative bg-surface-container border border-outline-variant rounded-2xl p-6 hover:border-[#3b82f6]/30 transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#3b82f6]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-4.5 h-4.5 text-blue-500" />
                </div>
                <span className="text-[10px] font-bold text-body uppercase tracking-[0.15em]">
                  Next Drive
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#ef4444] uppercase tracking-wider bg-[#ef4444]/10 px-2.5 py-1 rounded-lg">
                Urgent
              </span>
            </div>
            <h3 className="text-xl font-bold text-display mb-1">
              Goldman Sachs
            </h3>
            <p className="text-sm text-body opacity-80">Closes in 3 Days</p>
            <Link
              href="/dashboard/archives"
              className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-[#3b82f6] hover:opacity-80 transition-colors group/link"
            >
              View Details
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Card 3: Prep Stats */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="group relative bg-surface-container border border-outline-variant rounded-2xl p-6 hover:border-secondary/30 transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5 text-secondary" />
              </div>
              <span className="text-[10px] font-bold text-body uppercase tracking-[0.15em]">
                Prep Stats
              </span>
            </div>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-3xl font-bold text-display leading-none">
                  124
                </p>
                <p className="text-xs text-body opacity-80 mt-1">Problems Solved</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#ef4444]" />
                <div>
                  <p className="text-3xl font-bold text-display leading-none">
                    12
                  </p>
                  <p className="text-xs text-body opacity-80 mt-1">Day Streak</p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary leading-none flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Top 15%
                </p>
                <p className="text-xs text-body opacity-80 mt-1">Campus Rank</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════ BOTTOM ROW: 2 CARDS ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Card 4: Trending Interview Experience (Wider) */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3 group relative bg-surface-container border border-outline-variant rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 overflow-hidden"
        >
          {/* Decorative accent */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-secondary/[0.04] rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-display mb-3">
              Trending Interview Experience
            </h3>
            <p className="text-sm text-body leading-relaxed max-w-[550px]">
              Read how a student cleared the Arcesium technical round focusing
              heavily on Graph Data Structures and Low-Level Design. Includes 3
              exact questions asked.
            </p>
            <Link
              href="/dashboard/archives"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-bold hover:shadow-[0_0_25px_-5px_var(--color-primary)] active:scale-[0.97] transition-all"
            >
              Read Full Experience
            </Link>
          </div>
        </motion.div>

        {/* Card 5: Resume ATS */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 group relative bg-surface-container border border-outline-variant rounded-2xl p-6 hover:border-secondary/30 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-highest border border-outline-variant flex items-center justify-center mb-5">
              <FileSearch className="w-6 h-6 text-body" />
            </div>
            <h3 className="text-xl font-bold text-display mb-2">Resume ATS</h3>
            <p className="text-sm text-body mb-6">
              Last scan scored 78%. Missing keywords detected.
            </p>
            <Link
              href="/dashboard/resume-ats"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-outline-variant text-sm font-semibold text-display hover:bg-surface-container-highest transition-all"
            >
              Run AI Scanner
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
