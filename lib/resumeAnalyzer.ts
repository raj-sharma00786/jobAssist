export interface SectionScore {
  label: string;
  score: number;
  max: number;
  status: "good" | "warning" | "error";
}

export interface ResumeSuggestion {
  title: string;
  body: string;
  severity: "good" | "warning" | "error";
}

export interface ResumeAnalysis {
  score: number;
  verdict: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionScores: SectionScore[];
  suggestions: ResumeSuggestion[];
}

const ROLE_KEYWORDS = [
  "java",
  "javascript",
  "typescript",
  "python",
  "react",
  "node",
  "sql",
  "mongodb",
  "postgresql",
  "git",
  "rest api",
  "data structures",
  "algorithms",
  "object oriented",
  "operating systems",
  "database",
  "computer networks",
  "system design",
  "testing",
  "ci/cd",
  "docker",
  "kubernetes",
  "aws",
  "microservices",
];

const ACTION_VERBS = [
  "built",
  "developed",
  "designed",
  "implemented",
  "optimized",
  "improved",
  "deployed",
  "automated",
  "integrated",
  "architected",
  "led",
  "created",
];

const SECTION_PATTERNS = [
  { label: "Contact", pattern: /(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)|(\+?\d[\d\s-]{8,})/i },
  { label: "Education", pattern: /\b(education|university|college|b\.?tech|bachelor|degree|cgpa|gpa)\b/i },
  { label: "Skills", pattern: /\b(skills|technologies|technical skills|programming languages)\b/i },
  { label: "Projects", pattern: /\b(projects|experience|internship|work experience)\b/i },
  { label: "Links", pattern: /\b(github|linkedin|portfolio|leetcode|codeforces)\b/i },
];

function normalizeText(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function keywordPattern(keyword: string) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped.replace(/\s+/g, "\\s+")}\\b`, "i");
}

function getKeywordSet(targetRole: string, jobDescription?: string) {
  const roleWords = targetRole
    .split(/[^a-zA-Z+#.]+/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 2);

  const jdWords =
    jobDescription
      ?.split(/[^a-zA-Z+#.]+/)
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length > 3) ?? [];

  return Array.from(new Set([...ROLE_KEYWORDS, ...roleWords, ...jdWords])).slice(0, 36);
}

function getStatus(score: number, max: number): SectionScore["status"] {
  const ratio = score / max;

  if (ratio >= 0.75) {
    return "good";
  }

  if (ratio >= 0.45) {
    return "warning";
  }

  return "error";
}

export function analyzeResume(
  extractedText: string,
  targetRole = "Software Engineer Intern",
  jobDescription?: string
): ResumeAnalysis {
  const text = normalizeText(extractedText);
  const keywords = getKeywordSet(targetRole, jobDescription);
  const matchedKeywords = keywords.filter((keyword) => keywordPattern(keyword).test(text));
  const missingKeywords = keywords
    .filter((keyword) => !matchedKeywords.includes(keyword))
    .slice(0, 10);

  const sectionHits = SECTION_PATTERNS.filter((section) => section.pattern.test(extractedText));
  const actionHits = ACTION_VERBS.filter((verb) => keywordPattern(verb).test(text));
  const hasMetrics = /(\d+%|\b\d+x\b|\b\d+\+?\s*(users|requests|ms|seconds|hours|students|records|projects)\b)/i.test(
    extractedText
  );
  const wordCount = text ? text.split(" ").length : 0;
  const hasEnoughContent = wordCount >= 220 && wordCount <= 900;

  const keywordScore = Math.round((matchedKeywords.length / Math.max(keywords.length, 1)) * 35);
  const sectionScore = Math.round((sectionHits.length / SECTION_PATTERNS.length) * 25);
  const actionScore = Math.min(actionHits.length * 2, 10);
  const impactScore = hasMetrics ? 10 : 2;
  const lengthScore = hasEnoughContent ? 10 : wordCount > 120 ? 6 : 2;
  const score = Math.min(
    100,
    Math.max(0, keywordScore + sectionScore + actionScore + impactScore + lengthScore)
  );

  const sectionScores: SectionScore[] = [
    {
      label: "Keyword Match",
      score: keywordScore,
      max: 35,
      status: getStatus(keywordScore, 35),
    },
    {
      label: "Resume Sections",
      score: sectionScore,
      max: 25,
      status: getStatus(sectionScore, 25),
    },
    {
      label: "Action Verbs",
      score: actionScore,
      max: 10,
      status: getStatus(actionScore, 10),
    },
    {
      label: "Measurable Impact",
      score: impactScore,
      max: 10,
      status: getStatus(impactScore, 10),
    },
    {
      label: "Content Length",
      score: lengthScore,
      max: 10,
      status: getStatus(lengthScore, 10),
    },
  ];

  const suggestions: ResumeSuggestion[] = [];

  if (missingKeywords.length > 0) {
    suggestions.push({
      title: "Add missing target keywords",
      body: `Work these naturally into relevant bullets if they match your experience: ${missingKeywords
        .slice(0, 5)
        .join(", ")}.`,
      severity: "error",
    });
  }

  if (!hasMetrics) {
    suggestions.push({
      title: "Quantify project impact",
      body: "Add numbers such as latency reduced, users served, accuracy improved, or time saved to make bullets ATS and recruiter friendly.",
      severity: "warning",
    });
  }

  if (sectionHits.length < SECTION_PATTERNS.length) {
    const missingSections = SECTION_PATTERNS.filter(
      (section) => !section.pattern.test(extractedText)
    )
      .map((section) => section.label)
      .join(", ");

    suggestions.push({
      title: "Complete core resume sections",
      body: `The scan could not confidently detect: ${missingSections}. Add clear section headings for better parsing.`,
      severity: "warning",
    });
  }

  if (actionHits.length < 4) {
    suggestions.push({
      title: "Use stronger ownership verbs",
      body: "Start more bullets with verbs like built, optimized, deployed, automated, designed, and implemented.",
      severity: "warning",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      title: "Strong ATS foundation",
      body: "Your resume has a healthy keyword match, clear sections, and measurable impact. Keep tailoring it per role.",
      severity: "good",
    });
  }

  const verdict =
    score >= 82
      ? "Strong Match"
      : score >= 65
        ? "Moderate Match"
        : "Needs Optimization";

  return {
    score,
    verdict,
    matchedKeywords: matchedKeywords.slice(0, 14),
    missingKeywords,
    sectionScores,
    suggestions: suggestions.slice(0, 5),
  };
}
