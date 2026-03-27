import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DAILY_LIMIT = 3;

async function getDb() {
  const client = await clientPromise;
  return client.db("unwall");
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0]; // "2026-03-24"
}

async function checkAndIncrementUsage(db, fingerprint) {
  const today = getTodayKey();

  const usage = await db.collection("usage").findOne({
    userFingerprint: fingerprint,
    date: today,
  });

  if (usage) {
    if (!usage.isPro && usage.summaryCount >= DAILY_LIMIT) {
      return { allowed: false, remaining: 0 };
    }

    await db
      .collection("usage")
      .updateOne({ _id: usage._id }, { $inc: { summaryCount: 1 } });

    const newCount = usage.summaryCount + 1;
    return {
      allowed: true,
      remaining: usage.isPro ? Infinity : Math.max(0, DAILY_LIMIT - newCount),
    };
  } else {
    await db.collection("usage").insertOne({
      userFingerprint: fingerprint,
      date: today,
      summaryCount: 1,
      isPro: false,
    });

    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }
}

async function callGroq(text) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      bullets: [
        "This is a placeholder summary. Add your GROQ_API_KEY in .env.local to get real summaries.",
        "The article discusses important topics that would be summarized here.",
        "Key insights and main arguments would be extracted and presented.",
      ],
      keyTakeaways: [
        "Configure your GROQ_API_KEY in .env.local for production use.",
        "Each user gets 3 free summaries per day.",
      ],
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: controller.signal,
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional article summarizer. Respond ONLY in valid JSON, no markdown fences.",
        },
        {
          role: "user",
          content: `Given the following article text, provide:
1. Exactly 3 concise bullet points summarizing the main ideas (each under 30 words)
2. 2-3 Key Takeaways (actionable insights the reader should remember, each under 25 words)

Respond ONLY in valid JSON with this structure:
{
  "bullets": ["bullet 1", "bullet 2", "bullet 3"],
  "keyTakeaways": ["takeaway 1", "takeaway 2"]
}

Article text:
${text.slice(0, 8000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || "";

  // Extract JSON from the response (may be wrapped in markdown code block)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse Groq response");
  }

  return JSON.parse(jsonMatch[0]);
}

// POST /api/summarize
export async function POST(request) {
  try {
    const body = await request.json();
    const { text, userFingerprint } = body;

    if (!text || !userFingerprint) {
      return NextResponse.json(
        { error: "text and userFingerprint required" },
        { status: 400 },
      );
    }

    const db = await getDb();

    // Check daily limit
    const { allowed, remaining } = await checkAndIncrementUsage(
      db,
      userFingerprint,
    );

    if (!allowed) {
      return NextResponse.json({
        limited: true,
        message:
          "You've reached your free tier limit for today. Please try again tomorrow.",
      });
    }

    // Call Groq (with fallback on error)
    let summary;
    try {
      summary = await callGroq(text);
    } catch (groqError) {
      console.error("Groq API failed, using fallback:", groqError.message);
      const words = text
        .replace(/<[^>]+>/g, "")
        .trim()
        .split(/\s+/);
      const firstSentences = text
        .replace(/<[^>]+>/g, "")
        .split(/[.!?]+/)
        .filter(Boolean)
        .slice(0, 3);
      summary = {
        bullets:
          firstSentences.length >= 3
            ? firstSentences.map((s) => s.trim().slice(0, 120))
            : [
                "The article covers key topics and insights worth exploring in detail.",
                "Main arguments are presented with supporting evidence and examples.",
                "The author provides a comprehensive analysis of the subject matter.",
              ],
        keyTakeaways: [
          "AI summary was generated using a fallback — Groq API may be temporarily unavailable.",
          `The article contains approximately ${words.length} words.`,
        ],
      };
    }

    return NextResponse.json({
      limited: false,
      remaining,
      summary,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
