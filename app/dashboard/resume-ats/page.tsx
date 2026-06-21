"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";

interface SectionScore {
  label: string;
  score: number;
  max: number;
  status: "good" | "warning" | "error";
}

interface ResumeSuggestion {
  title: string;
  body: string;
  severity: "good" | "warning" | "error";
}

interface ResumeScan {
  id: string;
  fileName: string;
  fileMimeType: string;
  fileSize: number;
  targetRole: string;
  score: number;
  verdict: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionScores: SectionScore[];
  suggestions: ResumeSuggestion[];
  extractedTextPreview: string;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
}

const statusStyles = {
  good: {
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    icon: CheckCircle2,
  },
  warning: {
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    icon: AlertCircle,
  },
  error: {
    text: "text-error",
    bg: "bg-error/10",
    border: "border-error/20",
    icon: XCircle,
  },
};

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getVerdictTone(score: number): "good" | "warning" | "error" {
  if (score >= 82) {
    return "good";
  }

  if (score >= 65) {
    return "warning";
  }

  return "error";
}

export default function ResumeATSPage() {
  const [scan, setScan] = useState<ResumeScan | null>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer Intern");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadLatestScan() {
      try {
        const response = await fetch("/api/resume-ats");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Could not load resume scan.");
        }

        if (isMounted) {
          setScan(payload.scan);

          if (payload.scan?.targetRole) {
            setTargetRole(payload.scan.targetRole);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Could not load resume scan.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLatestScan();

    return () => {
      isMounted = false;
    };
  }, []);

  const scoreMeta = useMemo(() => {
    const score = scan?.score ?? 0;
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return {
      score,
      circumference,
      strokeDashoffset,
      tone: getVerdictTone(score),
    };
  }, [scan?.score]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Choose a PDF resume before scanning.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole);
    formData.append("jobDescription", jobDescription);

    setIsUploading(true);

    try {
      const response = await fetch("/api/resume-ats", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to scan resume.");
      }

      setScan(payload.scan);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan resume.");
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header targetRole={targetRole} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="h-[620px] animate-pulse rounded-2xl border border-outline-variant bg-surface/60 lg:col-span-5" />
          <div className="h-[620px] animate-pulse rounded-2xl border border-outline-variant bg-surface/60 lg:col-span-7" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header targetRole={targetRole} />

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          className="rounded-2xl border border-outline-variant bg-surface/60 p-5 lg:col-span-5"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-display">
                {scan?.fileName || "Upload resume"}
              </p>
              <p className="mt-1 text-xs text-body">
                {scan
                  ? `${formatFileSize(scan.fileSize)} • Last scanned ${new Date(
                      scan.updatedAt
                    ).toLocaleDateString()}`
                  : "PDF only, up to 5MB"}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest">
              <FileText className="h-5 w-5 text-body" />
            </div>
          </div>

          <div className="h-[520px] overflow-hidden rounded-xl border border-outline-variant bg-background">
            {scan ? (
              <iframe
                key={scan.updatedAt}
                title="Resume preview"
                src={`${scan.fileUrl}?v=${encodeURIComponent(scan.updatedAt)}`}
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-display">
                  Start with your resume
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-body">
                  Upload a text-based PDF and JobAssist will save this as your
                  latest scan, extract the content, and generate an ATS review.
                </p>
              </div>
            )}
          </div>

          <UploadForm
            file={file}
            targetRole={targetRole}
            jobDescription={jobDescription}
            isUploading={isUploading}
            hasScan={Boolean(scan)}
            onFileChange={setFile}
            onTargetRoleChange={setTargetRole}
            onJobDescriptionChange={setJobDescription}
            onSubmit={handleUpload}
          />
        </motion.div>

        <div className="space-y-5 lg:col-span-7">
          {scan ? (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <ScoreCard scan={scan} scoreMeta={scoreMeta} />
                <KeywordsCard scan={scan} />
              </div>

              <SectionBreakdown sections={scan.sectionScores} />
              <Suggestions suggestions={scan.suggestions} />
            </>
          ) : (
            <EmptyReviewPanel />
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ targetRole }: { targetRole: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-display md:text-4xl">
          Resume ATS Scanner
        </h1>
        <p className="mt-1 text-base text-body">
          Upload a PDF resume and get a saved ATS review with resume preview.
        </p>
      </motion.div>

    </div>
  );
}

function UploadForm({
  file,
  targetRole,
  jobDescription,
  isUploading,
  hasScan,
  onFileChange,
  onTargetRoleChange,
  onJobDescriptionChange,
  onSubmit,
}: {
  file: File | null;
  targetRole: string;
  jobDescription: string;
  isUploading: boolean;
  hasScan: boolean;
  onFileChange: (file: File | null) => void;
  onTargetRoleChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-body">
          Target Role
        </label>
        <input
          value={targetRole}
          onChange={(event) => onTargetRoleChange(event.target.value)}
          className="w-full rounded-xl border border-outline-variant bg-background px-4 py-2.5 text-sm text-display outline-none transition-colors focus:border-primary/50"
          placeholder="Software Engineer Intern"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-body">
          Job Description Keywords
        </label>
        <textarea
          value={jobDescription}
          onChange={(event) => onJobDescriptionChange(event.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-outline-variant bg-background px-4 py-2.5 text-sm text-display outline-none transition-colors placeholder:text-body focus:border-primary/50"
          placeholder="Optional: paste key skills from the job description..."
        />
      </div>

      <label className="block cursor-pointer rounded-xl border border-dashed border-outline-variant bg-background p-4 transition-colors hover:border-primary/50">
        <input
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Upload className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-display">
              {file ? file.name : hasScan ? "Upload a new PDF version" : "Choose PDF resume"}
            </p>
            <p className="mt-0.5 text-xs text-body">
              {file ? formatFileSize(file.size) : "Stored privately as your latest scan"}
            </p>
          </div>
        </div>
      </label>

      <button
        type="submit"
        disabled={isUploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary transition-all hover:shadow-[0_0_25px_-5px_var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Scanning Resume
          </>
        ) : (
          <>
            {hasScan ? <RefreshCw className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
            {hasScan ? "Replace Latest Scan" : "Scan Resume"}
          </>
        )}
      </button>
    </form>
  );
}

function ScoreCard({
  scan,
  scoreMeta,
}: {
  scan: ResumeScan;
  scoreMeta: {
    score: number;
    circumference: number;
    strokeDashoffset: number;
    tone: "good" | "warning" | "error";
  };
}) {
  const tone = statusStyles[scoreMeta.tone];
  const Icon = tone.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="rounded-2xl border border-outline-variant bg-surface/60 p-6"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-body">
        Overall Match
      </span>

      <div className="mt-4 flex items-center gap-6">
        <div>
          <span className="text-5xl font-bold text-display">{scan.score}</span>
          <span className="text-lg font-semibold text-body opacity-60">/100</span>
        </div>

        <div className="relative h-24 w-24">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--color-surface-container-highest)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={scoreMeta.circumference}
              strokeDashoffset={scoreMeta.strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{scan.score}%</span>
          </div>
        </div>
      </div>

      <div className={`mt-5 flex items-start gap-2 ${tone.text}`}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{scan.verdict}</p>
          <p className="mt-0.5 text-xs text-body">
            Latest scan for {scan.targetRole}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function KeywordsCard({ scan }: { scan: ResumeScan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="rounded-2xl border border-outline-variant bg-surface/60 p-6"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-body">
        Missing Target Keywords
      </span>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {scan.missingKeywords.length > 0 ? (
          scan.missingKeywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-lg border border-error/20 bg-error/10 px-3.5 py-1.5 text-sm font-medium text-error"
            >
              + {keyword}
            </span>
          ))
        ) : (
          <span className="rounded-lg border border-success/20 bg-success/10 px-3.5 py-1.5 text-sm font-medium text-success">
            No critical missing keywords
          </span>
        )}
      </div>

      {scan.matchedKeywords.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-body">
            Matched
          </p>
          <div className="flex flex-wrap gap-2">
            {scan.matchedKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-md border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SectionBreakdown({ sections }: { sections: SectionScore[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="rounded-2xl border border-outline-variant bg-surface/60 p-6"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-body">
        ATS Breakdown
      </span>

      <div className="mt-5 space-y-4">
        {sections.map((section) => {
          const percent = Math.round((section.score / section.max) * 100);
          const tone = statusStyles[section.status];

          return (
            <div key={section.label}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-display">{section.label}</p>
                <p className={`text-sm font-bold ${tone.text}`}>
                  {section.score}/{section.max}
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className={`h-full rounded-full ${tone.bg}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function Suggestions({ suggestions }: { suggestions: ResumeSuggestion[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="rounded-2xl border border-outline-variant bg-surface/60 p-6"
    >
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent">
          Improvement Suggestions
        </span>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const tone = statusStyles[suggestion.severity];
          const Icon = tone.icon;

          return (
            <div
              key={suggestion.title}
              className="rounded-xl border border-outline-variant bg-surface p-5"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tone.bg}`}
                >
                  <Icon className={`h-4 w-4 ${tone.text}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-display">
                    {suggestion.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-body">
                    {suggestion.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function EmptyReviewPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="flex min-h-[620px] flex-col items-center justify-center rounded-2xl border border-outline-variant bg-surface/60 p-8 text-center"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
        <Sparkles className="h-7 w-7 text-accent" />
      </div>
      <h2 className="text-2xl font-bold text-display">No scan yet</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-body">
        Upload your resume from the left panel. Once scanned, this area will show
        the score, missing keywords, section breakdown, and improvement actions.
      </p>
    </motion.div>
  );
}
