"use client";

import { useRef, MouseEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignupPage() {
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (glowRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      glowRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      glowRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden transition-colors duration-300"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      {/* Dynamic mouse glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--color-primary), transparent 70%)",
          opacity: 0.04
        }}
      />

      {/* Ambient blobs */}
      <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-secondary/3 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-[1100px] min-h-[600px] bg-surface-container-low rounded-[2rem] overflow-hidden relative z-10 border border-outline-variant shadow-xl"
      >

        {/* ══════════ LEFT: Editorial Panel ══════════ */}
        <div className="hidden md:flex flex-col justify-between w-[440px] bg-surface p-12 relative overflow-hidden border-r border-outline-variant">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-primary/8 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative z-20">
            <div className="flex items-center gap-2.5 mb-16">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <span className="text-base font-semibold text-display tracking-tight">JobAssist</span>
            </div>
            <h1 className="text-5xl font-bold text-display leading-[1.1] tracking-tight mb-6">
              Start Your<br />
              <span className="text-primary italic">Journey.</span>
            </h1>
            <p className="text-lg text-body leading-relaxed max-w-[320px]">
              Join thousands of developers leveling up their DSA skills for top-tier company interviews.
            </p>
          </div>

          <div className="relative z-20 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🎯", label: "2000+ Problems", sub: "DSA Library" },
                { icon: "🏢", label: "500+ Companies", sub: "Interview Data" },
                { icon: "🤖", label: "AI Mock", sub: "STAR Method" },
                { icon: "📊", label: "ATS Scanner", sub: "Resume Check" },
              ].map((b, i) => (
                <div key={i} className="bg-surface-container/80 backdrop-blur-xl rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">{b.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-display leading-tight">{b.label}</p>
                    <p className="text-[10px] text-body">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT: Google Sign Up ══════════ */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-14 py-10 bg-surface-container-low">
          <div className="flex md:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <span className="text-base font-semibold text-display tracking-tight">JobAssist</span>
          </div>

          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-display mb-2 tracking-tight">Create Your Account</h2>
            <p className="text-sm text-body">Sign up instantly with your Google account.</p>
          </div>

          {/* Google Sign Up Button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 bg-surface-container border border-outline-variant hover:bg-surface-container-highest hover:shadow-[0_0_40px_var(--color-primary)] text-display px-4 py-4 rounded-xl text-sm font-bold transition-all active:scale-[0.98] group"
          >
            <svg className="w-5 h-5 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Continue with Google
          </button>

          <p className="text-xs text-body opacity-80 text-center mt-4 leading-relaxed max-w-sm mx-auto">
            By signing up, you agree to our Terms of Service and Privacy Policy. We&apos;ll never post anything without your permission.
          </p>

          <p className="text-sm text-body text-center mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:opacity-80 transition-opacity ml-1">Sign In</Link>
          </p>

          <div className="mt-8 pt-5 border-t border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary shadow-[0_0_6px_var(--color-secondary)]" />
              </span>
              <span className="text-[10px] font-bold text-body uppercase tracking-widest">Systems Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-body" />
              <span className="text-[10px] font-bold text-body uppercase tracking-widest">Encrypted</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
