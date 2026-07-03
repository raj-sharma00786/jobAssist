import { NextRequest, NextResponse } from "next/server";
import type { ChatMessage, StarMockAPIRequest } from "@/types/starMock";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a friendly but professional campus recruiter conducting a behavioral mock interview with a college student. Follow these rules strictly:

CONVERSATION RULES:
1. Ask exactly 5 behavioral questions, one at a time.
2. Wait for the student's response before asking the next question.
3. Start by warmly greeting the student (use a casual, encouraging tone) and immediately ask Question 1.
4. After each answer (questions 1 through 4), give a brief 1-2 sentence acknowledgment, then ask the next question.
5. NEVER use markdown formatting (no #, ##, ###, **, *, -, or bullet symbols). Write in plain conversational text only.

QUESTION TOPICS (pick one from each, vary the phrasing):
- A challenging college project or assignment they worked on
- A time they worked in a team (group project, club, hackathon)
- A conflict or disagreement they handled (with teammates, peers, or during a project)
- A time they solved a difficult technical or non-technical problem
- A situation where they had to adapt or learn something new quickly

AFTER THE STUDENT ANSWERS QUESTION 5:
Do NOT ask another question. Instead, provide a complete STAR method analysis of all 5 answers in this exact plain-text format:

📊 STAR Method Analysis

Question 1: [repeat the question]
  Situation: [feedback on how well they set the scene]
  Task: [feedback on whether their responsibility was clear]
  Action: [feedback on the specific steps they described]
  Result: [feedback on whether they shared a measurable outcome]
  Score: [X out of 20]

Question 2: [repeat the question]
  Situation: [feedback]
  Task: [feedback]
  Action: [feedback]
  Result: [feedback]
  Score: [X out of 20]

Question 3: [repeat the question]
  Situation: [feedback]
  Task: [feedback]
  Action: [feedback]
  Result: [feedback]
  Score: [X out of 20]

Question 4: [repeat the question]
  Situation: [feedback]
  Task: [feedback]
  Action: [feedback]
  Result: [feedback]
  Score: [X out of 20]

Question 5: [repeat the question]
  Situation: [feedback]
  Task: [feedback]
  Action: [feedback]
  Result: [feedback]
  Score: [X out of 20]

🏆 Final Score: [Total] out of 100

💡 Overall Feedback
[2-3 sentences of constructive, actionable feedback written as a paragraph]

✅ Strengths
[List each strength on its own line, no bullet symbols]

🔧 Areas for Improvement
[List each improvement on its own line, no bullet symbols]

Remember: Keep the tone encouraging and supportive throughout. These are students, not senior professionals. Be warm but honest.`;

function buildGeminiContents(messages: ChatMessage[]) {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const body: StarMockAPIRequest = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: buildGeminiContents(messages),
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
      },
    };

    // Retry with exponential backoff on 429 (rate limit)
    const MAX_RETRIES = 3;
    let geminiRes: Response | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      if (geminiRes.status !== 429 || attempt === MAX_RETRIES) break;

      // Wait before retrying: 1s, 2s, 4s
      const delayMs = 1000 * Math.pow(2, attempt);
      console.warn(`Gemini 429 rate-limited, retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})…`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (!geminiRes || !geminiRes.ok) {
      const errData = await geminiRes?.json().catch(() => ({}));
      const status = geminiRes?.status ?? 500;
      console.error("Gemini API error:", status, errData);

      const userMessage =
        status === 429
          ? "The AI is receiving too many requests right now. Please wait a minute and try again."
          : `Gemini API returned ${status}. Please try again.`;

      return NextResponse.json({ error: userMessage }, { status: 502 });
    }

    const data = await geminiRes.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm sorry, I wasn't able to generate a response. Please try again.";

    return NextResponse.json({
      message: { role: "assistant" as const, content: text },
    });
  } catch (error) {
    console.error("STAR Mock API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
