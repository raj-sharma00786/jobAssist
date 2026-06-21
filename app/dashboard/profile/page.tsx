"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const POSITIONS = [
  "College Student",
  "Final Year Student",
  "Recent Graduate",
  "Working Professional",
  "Freelancer",
  "Career Switcher",
];

export default function ProfilePage() {
  const { update } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [position, setPosition] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Fetch current profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
          setUniversity(data.university || "");
          setPosition(data.position || "");
          setAge(data.age ? String(data.age) : "");
        }
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, university, position, age }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save.");
        return;
      }

      // Refresh the NextAuth session so the navbar updates the name/initials
      await update();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#fd9d27] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-body hover:text-display transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-display">
          Edit Profile
        </h1>
        <p className="text-body text-base mt-1">
          Update your personal information.
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="bg-surface/60 border border-outline-variant rounded-2xl p-6 md:p-8"
      >
        {/* Avatar + Name header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-outline-variant">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-xl font-bold text-on-primary shadow-[0_0_25px_var(--color-primary)]">
            {name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-lg font-semibold text-display">
              {name || "Your Name"}
            </p>
            <p className="text-sm text-body opacity-80">{email}</p>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-[#ef4444]/10 text-[#ef4444] text-sm font-medium">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-5 p-4 rounded-xl bg-[#22c55e]/10 text-[#22c55e] text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-body uppercase tracking-widest ml-1">
              Full Name <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl bg-surface border border-outline-variant text-display placeholder-body/60 focus:outline-none focus:border-primary transition-all duration-300 text-sm"
            />
          </div>

          {/* Email (read-only for OAuth users) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-body uppercase tracking-widest ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3.5 rounded-xl bg-surface border border-outline-variant text-body opacity-60 cursor-not-allowed text-sm"
            />
            <p className="text-[10px] text-body opacity-60 ml-1">
              Email is managed by your Google account and cannot be changed.
            </p>
          </div>

          {/* University */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-body uppercase tracking-widest ml-1">
              University / Organization
            </label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="IIT Delhi, NIT Trichy, etc."
              className="w-full px-4 py-3.5 rounded-xl bg-surface border border-outline-variant text-display placeholder-body/60 focus:outline-none focus:border-primary transition-all duration-300 text-sm"
            />
          </div>

          {/* Position + Age */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-body uppercase tracking-widest ml-1">
                Current Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-surface border border-outline-variant text-display focus:outline-none focus:border-primary transition-all duration-300 text-sm appearance-none cursor-pointer"
                style={!position ? { color: "var(--color-body)" } : {}}
              >
                <option value="" disabled>
                  Select position
                </option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-body uppercase tracking-widest ml-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="22"
                min={13}
                max={99}
                className="w-full px-4 py-3.5 rounded-xl bg-surface border border-outline-variant text-display placeholder-body/60 focus:outline-none focus:border-primary transition-all duration-300 text-sm"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-outline-variant">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm transition-all duration-300 hover:shadow-[0_0_25px_-5px_var(--color-primary)] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
