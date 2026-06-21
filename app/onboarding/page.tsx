"use client";

import { useState, useRef, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const POSITIONS = [
  "College Student",
  "Final Year Student",
  "Recent Graduate",
  "Working Professional",
  "Freelancer",
  "Career Switcher",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [fullName, setFullName] = useState(session?.user?.name || "");
  const [university, setUniversity] = useState("");
  const [position, setPosition] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (glowRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      glowRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      glowRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!position) {
      setError("Please select your current position.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, university, position, age }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        return;
      }

      // Refresh the session so profileComplete is updated
      await update();
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic mouse glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(253,157,39,0.04), transparent 70%)",
        }}
      />

      {/* Ambient blobs */}
      <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-[#fd9d27]/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-[#c0fe71]/3 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[560px] bg-[#131313] rounded-[2rem] overflow-hidden relative z-10"
      >
        <div className="px-8 md:px-12 py-10 bg-[#0a0a0a]">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#fd9d27]/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#fd9d27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">CodePulse</span>
          </div>

          {/* Welcome banner */}
          <div className="bg-[#1a1919] rounded-2xl p-6 mb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-[#fd9d27]/8 blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#fd9d27]/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-[#fd9d27]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Almost There!
              </h2>
              <p className="text-sm text-[#adaaaa] max-w-sm mx-auto">
                Welcome{session?.user?.name ? `, ${session.user.name}` : ""}! Just a few more details to personalize your experience.
              </p>
              {session?.user?.email && (
                <div className="mt-3 inline-flex items-center gap-2 bg-[#262626] px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-[#c0fe71] shadow-[0_0_6px_rgba(192,254,113,0.6)]" />
                  <span className="text-xs text-[#adaaaa] font-medium">{session.user.email}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 rounded-xl bg-[#ff7351]/10 text-[#ff7351] text-sm font-medium flex items-center gap-3"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#494847] uppercase tracking-widest ml-1">
                Full Name <span className="text-[#ff7351]">*</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl bg-[#1a1919] border border-[rgba(73,72,71,0.15)] text-white placeholder-[#494847] focus:outline-none focus:border-[#fd9d27] transition-all duration-300 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#494847] uppercase tracking-widest ml-1">
                University / Organization
              </label>
              <input
                type="text"
                placeholder="IIT Delhi, NIT Trichy, etc."
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#1a1919] border border-[rgba(73,72,71,0.15)] text-white placeholder-[#494847] focus:outline-none focus:border-[#fd9d27] transition-all duration-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-[#494847] uppercase tracking-widest ml-1">
                  Current Position <span className="text-[#ff7351]">*</span>
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-[#1a1919] border border-[rgba(73,72,71,0.15)] text-white focus:outline-none focus:border-[#fd9d27] transition-all duration-300 text-sm appearance-none cursor-pointer"
                  style={!position ? { color: "#494847" } : {}}
                >
                  <option value="" disabled>Select position</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#494847] uppercase tracking-widest ml-1">Age</label>
                <input
                  type="number"
                  placeholder="22"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={13}
                  max={99}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#1a1919] border border-[rgba(73,72,71,0.15)] text-white placeholder-[#494847] focus:outline-none focus:border-[#fd9d27] transition-all duration-300 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 rounded-full bg-[#fd9d27] text-[#4a2c00] font-bold text-sm transition-all duration-300 hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.5)] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#4a2c00]/30 border-t-[#4a2c00] rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Complete Setup & Enter Dashboard →"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
