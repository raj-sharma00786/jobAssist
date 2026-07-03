import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "@/lib/resumePdf";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PDF_MIME_TYPES = ["application/pdf", "application/x-pdf"];

const ATS_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyzer used by top tech companies. Analyze the provided resume text for the given target role.

You MUST return your analysis as a strict JSON object matching this exact schema. Do not include any text outside the JSON object.

{
  "score": <number 0-100>,
  "verdict": "<string: 'Strong Match' if score >= 82, 'Moderate Match' if score >= 65, else 'Needs Optimization'>",
  "matchedKeywords": ["<string>", ...],
  "missingKeywords": ["<string>", ...],
  "sectionScores": [
    {
      "label": "<string: section name>",
      "score": <number>,
      "max": <number>,
      "status": "<'good' | 'warning' | 'error'>"
    }
  ],
  "suggestions": [
    {
      "title": "<string: short actionable title>",
      "body": "<string: detailed explanation>",
      "severity": "<'good' | 'warning' | 'error'>"
    }
  ]
}

ANALYSIS RULES:
1. Score from 0-100 based on how well the resume matches the target role.
2. matchedKeywords: technical skills, tools, and domain keywords found in the resume that are relevant to the target role (max 14).
3. missingKeywords: important keywords for the target role that are NOT in the resume (max 10).
4. sectionScores must include exactly these 5 sections:
   - "Keyword Match" (max 35): How well technical keywords match the target role
   - "Resume Sections" (max 25): Whether key sections exist (Contact, Education, Skills, Projects/Experience, Links)
   - "Action Verbs" (max 10): Use of strong ownership verbs (built, developed, deployed, etc.)
   - "Measurable Impact" (max 10): Quantified achievements (percentages, user counts, time saved)
   - "Content Length" (max 10): Whether content is appropriately detailed (not too short, not too long)
   Each section status: "good" if score/max >= 0.75, "warning" if >= 0.45, else "error"
5. suggestions: 3-5 actionable improvement tips. severity = "error" for critical issues, "warning" for improvements, "good" for things done well.
6. If the resume is strong with no major issues, include at least one suggestion with severity "good" praising what was done well.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    const targetRole =
      formData.get("targetRole")?.toString().trim() || "Software Engineer Intern";
    const jobDescription =
      formData.get("jobDescription")?.toString().trim() || "";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a PDF resume." },
        { status: 400 }
      );
    }

    if (!PDF_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF resumes are supported right now." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Resume must be 5 MB or smaller." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const extractedText = await extractPdfText(fileBuffer);

    if (extractedText.length < 80) {
      return NextResponse.json(
        {
          error:
            "We could not read enough text from this PDF. Please upload a text-based resume PDF instead of a scanned image.",
        },
        { status: 422 }
      );
    }

    // Build the user prompt with resume text + role context
    let userPrompt = `TARGET ROLE: ${targetRole}\n\n`;
    if (jobDescription) {
      userPrompt += `JOB DESCRIPTION KEYWORDS:\n${jobDescription}\n\n`;
    }
    userPrompt += `RESUME TEXT:\n${extractedText}`;

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiBody = {
      system_instruction: {
        parts: [{ text: ATS_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 4096,
        response_mime_type: "application/json",
      },
    };

    // Retry with backoff on 429
    const MAX_RETRIES = 3;
    let geminiRes: Response | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      if (geminiRes.status !== 429 || attempt === MAX_RETRIES) break;

      const delayMs = 1000 * Math.pow(2, attempt);
      console.warn(
        `Gemini 429 rate-limited, retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})…`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (!geminiRes || !geminiRes.ok) {
      const status = geminiRes?.status ?? 500;
      const errData = await geminiRes?.json().catch(() => ({}));
      console.error("Gemini API error:", status, errData);

      const userMessage =
        status === 429
          ? "The AI is receiving too many requests right now. Please wait a minute and try again."
          : `Resume analysis failed (${status}). Please try again.`;

      return NextResponse.json({ error: userMessage }, { status: 502 });
    }

    const data = await geminiRes.json();
    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!responseText) {
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    // Parse the JSON response from Gemini
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Gemini JSON response:", responseText);
      return NextResponse.json(
        { error: "The AI returned invalid data. Please try again." },
        { status: 502 }
      );
    }

    // Build the scan result (matches the existing frontend interface)
    const scan = {
      fileName: file.name,
      fileMimeType: file.type,
      fileSize: file.size,
      targetRole,
      score: Number(analysis.score) || 0,
      verdict: analysis.verdict || "Needs Optimization",
      matchedKeywords: Array.isArray(analysis.matchedKeywords)
        ? analysis.matchedKeywords
        : [],
      missingKeywords: Array.isArray(analysis.missingKeywords)
        ? analysis.missingKeywords
        : [],
      sectionScores: Array.isArray(analysis.sectionScores)
        ? analysis.sectionScores
        : [],
      suggestions: Array.isArray(analysis.suggestions)
        ? analysis.suggestions
        : [],
    };

    return NextResponse.json({ scan }, { status: 200 });
  } catch (error) {
    console.error("Resume ATS scan failed:", error);
    return NextResponse.json(
      { error: "Failed to scan resume. Please try another PDF." },
      { status: 500 }
    );
  }
}
