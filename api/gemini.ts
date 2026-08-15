/**
 * Serverless proxy for Gemini AI analysis (Vercel function).
 *
 * SECURITY: the API key lives only in the server environment
 * (GEMINI_API_KEY). The browser talks to /api/gemini and never
 * receives or sends the key.
 *
 * Optional env:
 *   GEMINI_API_KEY  (required)  server-only Google AI Studio key
 *   GEMINI_MODEL    (optional)  defaults to gemini-2.0-flash
 */
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
}

export default async function handler(req: any, res: any): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI analysis not configured: set GEMINI_API_KEY in your deployment environment" });
    return;
  }

  const { title, query } = req.body || {};
  if (typeof title !== "string" || typeof query !== "string" || !title || !query) {
    res.status(400).json({ error: "Body must be JSON: { title, query }" });
    return;
  }

  const prompt =
    `Analyze the following Google Dork (advanced search query) used in bug bounty hunting:\n` +
    `Title: ${title}\n` +
    `Query: ${query}\n\n` +
    `Provide:\n` +
    `1. A detailed explanation of why this query is dangerous.\n` +
    `2. Specific remediation steps for a web administrator.\n` +
    `3. An overall risk level (Critical, High, Medium, Low).`;

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                explanation: { type: "STRING" },
                remediation: { type: "STRING" },
                riskLevel: { type: "STRING" },
              },
              required: ["explanation", "remediation", "riskLevel"],
            },
          },
        }),
      },
    );

    if (!upstream.ok) {
      res.status(502).json({ error: `Gemini API error (HTTP ${upstream.status})` });
      return;
    }

    const data = (await upstream.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.status(502).json({ error: "Gemini returned an empty response" });
      return;
    }
    res.status(200).json(JSON.parse(text));
  } catch (error) {
    res.status(502).json({ error: `Gemini request failed: ${(error as Error).message}` });
  }
}
