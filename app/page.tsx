"use client";

import { useState, useEffect, useRef, MouseEvent } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence, useSpring } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

/* ── Custom smooth scroll — quintic easeInOut, 1000ms ── */
function smoothScrollTo(targetId: string) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const start = window.scrollY;
  const headerOffset = 80; // account for sticky nav
  const end = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  const distance = end - start;
  const duration = 1000;
  let startTime: number | null = null;

  // quintic easeInOut
  function ease(t: number) {
    if (t < 0.5) return 16 * t * t * t * t * t;
    return 1 + 16 * (--t) * t * t * t * t;
  }

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start + distance * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ── Animated nav link with expanding underline ── */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        smoothScrollTo(href.replace("#", ""));
      }}
      className="relative px-3 py-2 text-sm font-medium text-foreground hover:text-display transition-all duration-300 ease-in-out group"
    >
      {children}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-primary rounded-full transition-all duration-300 ease-in-out group-hover:w-full" />
    </a>
  );
}

/* ── Reusable scroll-triggered section wrapper ── */
function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay }}
      className={className}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

function StaggerChild({ children, index = 0, className = "" }: { children: React.ReactNode; index?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: index * 0.1 }}
      className={className}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

function FaqAccordion() {
  const faqs = [
    { q: "What kind of problems are in the Problem Bank?", a: "Our Problem Bank covers the full DSA spectrum — Arrays, Trees, Graphs, Dynamic Programming, Strings, Linked Lists, and more. Each problem is tagged with the companies that frequently ask it and categorized by difficulty." },
    { q: "How does the STAR Mock Interviewer work?", a: "Select a target company, and our AI-powered interviewer asks behavioral questions modeled after that company's leadership principles. Your response is analyzed against the STAR framework (Situation, Task, Action, Result) with instant scoring and feedback." },
    { q: "Can I track upcoming campus and off-campus drives?", a: "Yes. Track campus drives, off-campus hiring updates, hackathons, eligible branches, expected CTC ranges, and direct application links in one dashboard." },
    { q: "How does the Resume ATS Scanner evaluate my resume?", a: "Upload your resume and get an instant ATS compatibility score. The scanner checks keywords, formatting, section structure, and how well your profile matches common fresher and internship job descriptions." },
  ];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-surface-container rounded-2xl overflow-hidden relative group transition-all hover:shadow-[0_0_40px_color-mix(in_srgb,var(--color-primary)_8%,transparent)]">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left cursor-pointer outline-none">
            <span className="text-display font-bold text-lg group-hover:text-primary transition-colors">{faq.q}</span>
            <motion.div animate={{ rotate: open === i ? 180 : 0 }} className="text-outline-variant group-hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </motion.div>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} style={{ willChange: "height" }}>
                <div className="px-6 pb-6 text-body leading-relaxed text-sm">
                  {faq.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If a user bails out of onboarding and comes back to the landing page, log them out
    if (status === "authenticated" && session?.user && !session.user.onboardingCompleted) {
      signOut();
    }
  }, [status, session]);

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const parallaxY1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -250]), springConfig);
  const parallaxY2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -80]), springConfig);
  const parallaxY3 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -350]), springConfig);
  const heroBlob1Y = useSpring(useTransform(scrollYProgress, [0, 1], [0, -150]), springConfig);
  const heroBlob2Y = useSpring(useTransform(scrollYProgress, [0, 1], [0, 80]), springConfig);
  const headlineY = useSpring(useTransform(scrollYProgress, [0, 0.4], [0, 80]), springConfig);
  const subtextY = useSpring(useTransform(scrollYProgress, [0, 0.4], [0, 30]), springConfig);

  // Mouse move listener for dotted background effect
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      heroRef.current.style.setProperty("--mouse-x", `${x}px`);
      heroRef.current.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  // Feature cards data for the continuous marquee
  const features = [
    {
      id: "problembank",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
      color: "text-primary",
      bg: "bg-primary/10",
      title: "Problem Bank",
      desc: "A Kanban-style board to track your DSA progress — from Unsolved to Mastered, tagged by company."
    },
    {
      id: "interviews",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />,
      color: "text-[#16a34a]",
      bg: "bg-[#16a34a]/10",
      title: "Interview Archives",
      desc: "Real interview experiences from Indian campus and off-campus hiring rounds. Know what to revise before you walk in."
    },
    {
      id: "mockinterviews",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
      color: "text-[#0ea5e9]",
      bg: "bg-[#0ea5e9]/10",
      title: "Mock Interviews",
      desc: "AI-powered HR and behavioral interview practice using the STAR method, with instant feedback and scoring."
    },
    {
      id: "ats",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      color: "text-primary",
      bg: "bg-primary/10",
      title: "ATS Scanner",
      desc: "Upload your resume and get an instant ATS compatibility score with actionable improvements."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20 selection:text-primary">



      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <header className="sticky top-0 z-50 w-full bg-background border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight text-display">
              JobAssist
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Plans</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {status === "authenticated" && session?.user?.onboardingCompleted ? (
              <Link href="/dashboard" className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_20px_var(--color-primary)] active:scale-95">
                Dashboard
              </Link>
            ) : (
              <Link href="/signup" className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_20px_var(--color-primary)] active:scale-95">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ═══════════════════ HERO ═══════════════════ */}
        <section
          ref={heroRef}
          onMouseMove={handleMouseMove}
          className="relative overflow-hidden pt-16 pb-20 md:pt-32 md:pb-36 border-b border-outline-variant"
        >
          {/* Interactive Dotted Background */}
          {/* Base dim dots */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(var(--color-outline-variant)_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          {/* Highlighted primary dots reacting to mouse */}
          <div
            className="absolute inset-0 z-0 bg-[radial-gradient(var(--color-primary)_2px,transparent_2px)] [background-size:24px_24px] opacity-80 transition-opacity duration-300"
            style={{
              WebkitMaskImage: `radial-gradient(circle 250px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black, transparent)`
            }}
          />

          {/* Ambient Glows with Parallax */}
          <motion.div
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10"
            style={{ willChange: "transform", y: heroBlob1Y }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#c0fe71]/5 rounded-full blur-[100px] -z-10"
            style={{ willChange: "transform", y: heroBlob2Y }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-8">
            {/* Left: Text */}
            <div className="flex-1 text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{ y: headlineY, willChange: "transform" }}
                className="text-6xl sm:text-7xl lg:text-[5rem] font-semibold tracking-tighter leading-[1.1] mb-6 text-display"
              >
                Crack Your Campus<br />
                Placement, <span className="text-primary ">One</span><br />
                Problem at a Time.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.1 }}
                style={{ y: subtextY, willChange: "transform" }}
                className="text-lg text-body max-w-lg mx-auto md:mx-0 mb-8 leading-relaxed"
              >
                Built for Indian students preparing for campus placements,
                off-campus drives, hackathons, resumes, and interview rounds -
                all in one place.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              >
                {status === "authenticated" && session?.user?.onboardingCompleted ? (
                  <Link href="/dashboard" className="bg-primary hover:shadow-[0_0_40px_var(--color-primary)] text-on-primary px-8 py-4 rounded-full text-sm font-bold transition-all active:scale-95 text-center">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/signup" className="bg-primary hover:shadow-[0_0_40px_var(--color-primary)] text-on-primary px-8 py-4 rounded-full text-sm font-bold transition-all active:scale-95 text-center">
                      Start Your Journey
                    </Link>
                    <Link href="/login" className="bg-surface-container border border-outline-variant hover:border-primary hover:text-display text-body px-8 py-4 rounded-full text-sm font-bold transition-all active:scale-95 text-center">
                      Sign In →
                    </Link>
                  </>
                )}
              </motion.div>
            </div>

            {/* Right: Floating Cards with Parallax */}
            <div className="flex-1 relative h-[380px] md:h-[450px] w-full max-w-lg pointer-events-none">

              {/* Card 1 - Problems Solved */}
              <motion.div
                className="absolute top-2 left-4 md:left-8 w-48 h-56 rounded-2xl bg-surface-container border border-outline-variant p-5 text-display shadow-lg"
                style={{ y: parallaxY1, willChange: "transform" }}
              >
                <div className="text-[10px] font-bold opacity-60 mb-2 tracking-widest uppercase">PROBLEMS SOLVED</div>
                <div className="text-3xl font-black text-primary mb-1">247</div>
                <div className="text-xs opacity-50">This month</div>
                <div className="mt-5 flex gap-1.5 items-end h-20">
                  {[85, 60, 90, 45, 75, 95, 70].map((h, i) => (
                    <div key={i} className="w-full bg-surface-container-highest rounded-t-sm" style={{ height: '100%' }}>
                      <div className="w-full bg-primary rounded-t-sm transition-all" style={{ height: `${h}%`, marginTop: `${100 - h}%` }} />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Card 2 - Solve Streak */}
              <motion.div
                className="absolute top-10 right-2 md:right-4 w-52 h-48 rounded-2xl bg-surface-container-highest border border-outline-variant p-5 text-display shadow-lg"
                style={{ y: parallaxY2, willChange: "transform" }}
              >
                <div className="text-[10px] font-bold opacity-60 mb-2 tracking-widest uppercase">SOLVE STREAK</div>
                <div className="text-4xl font-black text-secondary mb-1">18</div>
                <div className="text-xs opacity-50 mb-4">Days in a row!</div>
                <div className="flex justify-between">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${i < 5 ? "bg-secondary text-on-secondary" : "bg-surface-container text-body"}`}>
                        {i < 5 ? "✓" : ""}
                      </div>
                      <span className="text-[8px] opacity-40">{d}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Card 3 - Next Drive */}
              <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-56 h-44 rounded-2xl bg-surface-container border border-outline-variant p-5 text-display shadow-lg"
                style={{ x: "-50%", y: parallaxY3, willChange: "transform" }}
              >
                <div className="text-[10px] font-bold opacity-60 mb-2 tracking-widest uppercase">NEXT DRIVE</div>
                <div className="text-3xl font-black text-[#0ea5e9] mb-1">3 days</div>
                <div className="text-xs opacity-50 mb-4">Goldman Sachs</div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0ea5e9] rounded-full shadow-[0_0_8px_rgba(14,165,233,0.6)]" style={{ width: "85%" }} />
                </div>
                <div className="text-[10px] opacity-40 mt-2 font-bold">85% prep complete</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════ SOCIAL PROOF ═══════════════════ */}
        <section className="w-full py-10 bg-surface-container-low border-b border-outline-variant">
          <AnimatedSection className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-xs md:text-sm tracking-widest text-body uppercase font-bold mb-6">
              Trusted by students preparing for India&apos;s top tech roles
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 grayscale">
              {["TCS", "INFOSYS", "WIPRO", "AMAZON", "MICROSOFT"].map((u, i) => (
                <motion.span key={u} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-lg md:text-xl font-black tracking-widest text-display">{u}</motion.span>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* ═══════════════════ GET STARTED CTA ═══════════════════ */}
        <section className="w-full py-24 px-6 bg-background border-b border-outline-variant">
          <AnimatedSection className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-tight mb-4 text-display">
              Start Cracking<br />Placements in <span className="text-primary ">Seconds.</span>
            </h2>
            <p className="text-lg text-body max-w-xl mx-auto mb-10 leading-relaxed">
              No complicated setup. No learning curve. Sign up, pick your target companies, and start solving problems that actually get asked.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-3 bg-surface-container border border-outline-variant hover:bg-surface-container-highest hover:shadow-lg text-display px-8 py-4 rounded-xl text-sm font-bold transition-all active:scale-95 group">
                <svg className="w-5 h-5 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Continue with Google
              </Link>
            </div>
          </AnimatedSection>
        </section>

        {/* ═══════════════════ FEATURES MARQUEE ═══════════════════ */}
        <section id="features" className="w-full py-24 bg-surface-container-low border-b border-outline-variant overflow-hidden">
          <AnimatedSection className="max-w-6xl mx-auto px-6 text-center mb-14">
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-tight mb-4 text-display">
              Built for Placement Warriors
            </h2>
            <p className="text-lg text-body max-w-lg mx-auto leading-relaxed">
              Every feature is designed around how Indian students actually
              prepare for placements, coding rounds, and HR interviews.
            </p>
          </AnimatedSection>

          {/* Marquee Container */}
          <div className="relative w-full flex overflow-hidden py-4">
            <div className="flex animate-marquee min-w-max">
              {/* First Track */}
              <div className="flex gap-6 pr-6">
                {features.map((feature, i) => (
                  <div key={`first-${i}`} className="w-[300px] shrink-0 bg-surface-container rounded-2xl p-6 hover:bg-surface-container-highest hover:shadow-lg transition-all cursor-pointer group border border-outline-variant">
                    <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-5 border border-transparent group-hover:border-current/20 transition-all`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {feature.icon}
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-display">{feature.title}</h3>
                    <p className="text-sm text-body leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
              {/* Second Track (Duplicate for seamless loop) */}
              <div className="flex gap-6 pr-6">
                {features.map((feature, i) => (
                  <div key={`second-${i}`} className="w-[300px] shrink-0 bg-surface-container rounded-2xl p-6 hover:bg-surface-container-highest hover:shadow-lg transition-all cursor-pointer group border border-outline-variant">
                    <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-5 border border-transparent group-hover:border-current/20 transition-all`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {feature.icon}
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-display">{feature.title}</h3>
                    <p className="text-sm text-body leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════ DASHBOARD PREVIEW ═══════════════════ */}
        <section className="w-full py-24 px-6 bg-background border-b border-outline-variant">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
            {/* Left Text */}
            <AnimatedSection className="flex-1 text-center md:text-left">
              <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-tight mb-6 text-display">
                A Dashboard that<br /><span className="text-primary ">Tracks Everything.</span>
              </h2>
              <p className="text-lg text-body max-w-md mb-10 leading-relaxed mx-auto md:mx-0">
                One glance at your dashboard, and you know exactly where you stand. See problems solved, active streaks, upcoming drives, and company-specific prep progress.
              </p>
              <div className="flex flex-col gap-4 max-w-sm mx-auto md:mx-0">
                {[
                  { label: "DSA Problem Tracker", color: "var(--primary)" },
                  { label: "Company-wise Prep Score", color: "var(--secondary)" },
                  { label: "STAR Interview Coach", color: "var(--accent)" },
                ].map((item, i) => (
                  <StaggerChild key={i} index={i} className="flex items-center gap-4 bg-surface-container p-3 rounded-xl border border-outline-variant">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${item.color} 15%, transparent)`, color: item.color }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm text-display font-bold">{item.label}</span>
                  </StaggerChild>
                ))}
              </div>
            </AnimatedSection>

            {/* Right: Dashboard Mockup */}
            <div className="flex-1 w-full max-w-lg relative">
              <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full" />
              <div className="relative rounded-2xl bg-surface-container border border-outline-variant p-6 space-y-4 shadow-lg">
                {/* Top Stats Row */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                    <div className="text-xs text-body mb-1 font-bold tracking-widest uppercase">Solved</div>
                    <div className="text-2xl font-black text-display">247</div>
                    <div className="text-[10px] text-secondary mt-1 font-bold">▲ 12 this week</div>
                  </div>
                  <div className="flex-1 bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                    <div className="text-xs text-body mb-1 font-bold tracking-widest uppercase">Streak</div>
                    <div className="text-2xl font-black text-display">18d</div>
                    <div className="text-[10px] text-secondary mt-1 font-bold">🔥 Personal best</div>
                  </div>
                </div>
                {/* Topic Progress */}
                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <div className="text-xs text-body mb-4 font-bold tracking-widest uppercase">Topic Coverage</div>
                  <div className="flex items-end gap-2 h-24">
                    {[55, 80, 45, 90, 65, 70, 85].map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-sm transition-all"
                          style={{
                            height: `${v}%`,
                            background: i === 3 ? "var(--primary)" : "var(--surface-container-highest)",
                          }}
                        />
                        <span className="text-[9px] font-bold text-body">{["Arr", "LL", "Tree", "DP", "Grph", "Str", "Stk"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Recent Problems */}
                <div className="space-y-2">
                  {[
                    { name: "Two Sum", tag: "Easy", tagColor: "bg-[#16a34a]/10 text-[#16a34a]" },
                    { name: "LRU Cache", tag: "Hard", tagColor: "bg-[#ef4444]/10 text-[#ef4444]" },
                    { name: "Merge Intervals", tag: "Medium", tagColor: "bg-primary/10 text-primary" },
                  ].map((task, i) => (
                    <div key={i} className="flex items-center gap-3 bg-surface-container-low rounded-xl p-3 border border-outline-variant">
                      <div className="w-4 h-4 rounded border-2 border-secondary bg-secondary flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-on-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-sm text-display font-bold flex-1">{task.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${task.tagColor}`}>
                        {task.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════ MASTER YOUR PREP ═══════════════════ */}
        <section className="w-full py-24 px-6 bg-surface-container-low border-b border-outline-variant">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-tight mb-4 text-display">
                Master Your Prep
              </h2>
              <p className="text-lg text-body max-w-lg mx-auto leading-relaxed">
                From smart problem tracking to AI-driven interview coaching, we help you stay on top of every aspect of placement prep.
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* DSA Tracker */}
              <StaggerChild index={0} className="bg-surface-container rounded-2xl p-8 hover:shadow-lg transition-all group border border-outline-variant">
                <h3 className="text-xl font-bold mb-2 text-display">DSA Problem Tracker</h3>
                <p className="text-sm text-body mb-8">
                  Organize problems by topic and difficulty. Track which company asks what — never miss a pattern.
                </p>
                <div className="space-y-3">
                  {[
                    { done: true, text: "Reverse a Linked List", course: "Amazon" },
                    { done: true, text: "Validate BST", course: "Google" },
                    { done: false, text: "LRU Cache Implementation", course: "Microsoft" },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 bg-surface-container-highest rounded-xl p-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${t.done ? "bg-secondary border-secondary" : "border-outline-variant"}`}>
                        {t.done && <svg className="w-3 h-3 text-on-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm flex-1 font-bold ${t.done ? "text-body line-through" : "text-display"}`}>{t.text}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-surface text-body font-bold">{t.course}</span>
                    </div>
                  ))}
                </div>
              </StaggerChild>

              {/* Interview Insights */}
              <StaggerChild index={1} className="bg-surface-container rounded-2xl p-8 hover:shadow-lg transition-all group border border-outline-variant">
                <h3 className="text-xl font-bold mb-2 text-display">Interview Insights</h3>
                <p className="text-sm text-body mb-8">
                  Surface patterns across companies. Know which topics are trending and where your gaps are.
                </p>
                <div className="space-y-4">
                  <div className="bg-surface-container-highest rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-[#16a34a]/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <span className="text-xs font-bold text-[#16a34a]">Hot Topic: Dynamic Programming</span>
                    </div>
                    <p className="text-xs text-body">Asked in 68% of Amazon SDE-1 interviews this quarter.</p>
                  </div>
                  <div className="bg-surface-container-highest rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-[#ef4444]/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                      </div>
                      <span className="text-xs font-bold text-[#ef4444]">Weak Area: Graph Algorithms</span>
                    </div>
                    <p className="text-xs text-body">Only 3 of 15 graph problems mastered. Focus here next.</p>
                  </div>
                </div>
              </StaggerChild>

              {/* Study Groups - Full width */}
              <StaggerChild index={2} className="md:col-span-2 bg-surface-container rounded-2xl p-8 hover:shadow-lg transition-all border border-outline-variant">
                <h3 className="text-xl font-bold mb-2 text-display">Study Groups</h3>
                <p className="text-sm text-body mb-6">
                  Prep together. Shared problem boards, mock interview scheduling, and transparent progress tracking across your study circle.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Problem Board", "Mock Scheduling", "Group Chat", "Shared Notes", "Leaderboard"].map((item, i) => (
                    <div key={i} className="inline-flex items-center gap-2 bg-surface-container-highest px-4 py-2.5 rounded-xl text-sm text-display font-bold">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ["var(--primary)", "var(--secondary)", "#0ea5e9", "#ef4444", "var(--accent)"][i] }} />
                      {item}
                    </div>
                  ))}
                </div>
              </StaggerChild>
            </div>
          </div>
        </section>

        {/* ═══════════════════ PRICING ═══════════════════ */}
        <section id="pricing" className="w-full py-24 px-6 bg-background border-b border-outline-variant relative overflow-hidden">
          {/* Subtle bg glow for pricing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-tight mb-4 text-display">
                Simple Plans for Students
              </h2>
              <p className="text-lg text-body max-w-lg mx-auto leading-relaxed">
                Start free, upgrade only when you need more serious placement
                prep.
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Starter */}
              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3, ease: "easeOut" }} className="bg-surface-container rounded-2xl p-8 border border-outline-variant">
                <div className="text-xs font-bold text-body mb-1 tracking-widest uppercase">Starter</div>
                <div className="text-4xl font-black text-display mb-1">Rs. 0</div>
                <div className="text-xs text-body opacity-60 mb-8 font-bold uppercase tracking-widest">Always free</div>
                <ul className="space-y-4 mb-8">
                  {["50 tracked problems", "Basic problem bank", "7-day streak tracking", "Campus prep essentials"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-body font-medium">
                      <svg className="w-4 h-4 text-outline-variant flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block w-full py-3 rounded-full border border-outline-variant text-display font-bold text-sm hover:bg-surface-container-highest hover:shadow-lg transition-all text-center">
                  Get Started
                </Link>
              </motion.div>

              {/* Pro - Highlighted */}
              <motion.div whileHover={{ scale: 1.06 }} transition={{ duration: 0.3, ease: "easeOut" }} className="bg-surface-container rounded-2xl p-8 shadow-lg border-2 border-primary relative overflow-hidden transform md:scale-105 z-10">
                <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded">POPULAR</div>
                <div className="text-xs font-bold text-primary mb-1 tracking-widest uppercase">Student Pro</div>
                <div className="text-4xl font-black text-display mb-1">Rs. 149</div>
                <div className="text-xs text-body mb-8 font-bold uppercase tracking-widest">per month</div>
                <ul className="space-y-4 mb-8">
                  {["Unlimited problems", "AI Mock Interviews", "STAR method coaching", "Resume ATS Scanner", "Company-wise prep"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-display font-bold">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all text-center active:scale-95">
                  Start Student Pro
                </Link>
              </motion.div>

              {/* College Plan */}
              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3, ease: "easeOut" }} className="bg-surface-container rounded-2xl p-8 border border-outline-variant">
                <div className="text-xs font-bold text-body mb-1 tracking-widest uppercase">College Plan</div>
                <div className="text-4xl font-black text-display mb-1">Custom</div>
                <div className="text-xs text-body opacity-60 mb-8 font-bold uppercase tracking-widest">for batches and placement cells</div>
                <ul className="space-y-4 mb-8">
                  {["Everything in Student Pro", "Batch dashboards", "Placement-cell question banks", "Study groups", "Priority support"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-body font-medium">
                      <svg className="w-4 h-4 text-outline-variant flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 rounded-full border border-outline-variant text-display font-bold text-sm hover:bg-surface-container-highest hover:shadow-lg transition-all text-center">
                  Talk to Us
                </button>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
        <section className="w-full py-24 px-6 bg-surface-container-low border-b border-outline-variant">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-tight mb-4 text-display">
                What Our Users Say
              </h2>
              <div className="flex items-center justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-sm font-bold text-body">4.9/5 rating &bull; 1,800+ reviews</p>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "JobAssist made my placement prep feel organized. The company-wise problem bank saved me weeks before campus season.",
                  name: "Rahul S.",
                  school: "Placed at Amazon, SDE-1",
                },
                {
                  quote: "The STAR mock interviewer helped me stop giving random HR answers. I went into interviews with proper examples ready.",
                  name: "Ananya K.",
                  school: "Placed at Microsoft, SDE Intern",
                },
                {
                  quote: "Our study group used JobAssist to split DSA topics, track streaks, and revise interview experiences before drives.",
                  name: "Vikram M.",
                  school: "Placed through campus drive",
                },
              ].map((t, i) => (
                <StaggerChild key={i} index={i} className="bg-surface-container rounded-2xl p-8 hover:shadow-lg transition-all border border-outline-variant">
                  <p className="text-sm text-body leading-relaxed mb-6 ">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-display font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-display">{t.name}</div>
                      <div className="text-[10px] font-bold tracking-widest uppercase text-primary mt-1">{t.school}</div>
                    </div>
                  </div>
                </StaggerChild>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ FREQUENTLY ASKED QUESTIONS ═══════════════════ */}
        <section id="faq" className="w-full py-24 px-6 bg-background border-b border-outline-variant relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-tight mb-4 text-display">
                Frequently Asked <span className="text-primary ">Questions</span>
              </h2>
              <p className="text-lg text-body max-w-lg mx-auto leading-relaxed">
                Everything you need to know about JobAssist.
              </p>
            </AnimatedSection>

            <FaqAccordion />

            <AnimatedSection className="mt-16 text-center" delay={0.2}>
              <p className="text-body mb-6">Still have questions?</p>
              <a href="mailto:support@jobassist.dev" className="inline-flex items-center gap-2 bg-surface-container border border-outline-variant hover:bg-surface-container-highest hover:shadow-lg text-display px-6 py-3 rounded-xl text-sm font-bold transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Contact Support
              </a>
            </AnimatedSection>
          </div>
        </section>

        {/* ═══════════════════ FINAL CTA ═══════════════════ */}
        <section className="w-full py-24 px-6 bg-surface-container-low relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/8 blur-[100px] rounded-full pointer-events-none" />
          <AnimatedSection className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-tight mb-6 text-display">
              Your Dream <span className="text-primary ">Offer</span> Starts Here.
            </h2>
            <p className="text-lg text-body max-w-md mx-auto mb-10 leading-relaxed">
              Join students across India preparing for campus and off-campus
              placements with JobAssist. Start free today.
            </p>
            <Link href="/signup" className="inline-block bg-primary text-on-primary px-10 py-4 rounded-full text-sm font-bold transition-all hover:scale-105 hover:opacity-90 active:scale-95">
              Get Started for Free →
            </Link>
          </AnimatedSection>
        </section>
      </main>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="w-full py-10 bg-background border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="font-bold text-sm text-display">JobAssist</span>
          </div>
          <p className="text-xs text-body font-bold">
            &copy; {new Date().getFullYear()} JobAssist. Built for Indian placement prep.
          </p>
        </div>
      </footer>
    </div>
  );
}
