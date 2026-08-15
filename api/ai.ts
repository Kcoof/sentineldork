/**
 * Serverless AI proxy (Vercel function) — used by SentinelDork for dork
 * risk analysis.
 *
 * Providers (first match wins):
 *   1. GLM_API_KEY   set                    -> Z.ai GLM (default, recommended)
 *   2. GEMINI_API_KEY starts with "AIza"    -> Google Gemini
 *   3. GEMINI_API_KEY set (any other shape) -> treated as a GLM key, so keys
 *      pasted into the old GEMINI_API_KEY variable keep working.
 *
 * SECURITY: keys live only in server environment variables. The browser talks
 * to /api/ai and never receives or sends any key.
 *
 * Env:
 *   GLM_API_KEY    Z.ai API key (id.secret format)
 *   GLM_MODEL      optional, default glm-4.5-flash
 *   GLM_BASE_URL   optional, default https://api.z.ai/api/paas/v4
 *   GEMINI_API_KEY optional Google AI Studio key (AIza...)
 *   GEMINI_MODEL   optional, default gemini-2.0-flash
 */

interface AnalysisResult {
  explanation: string;
  remediation: string;
  riskLevel: string;
}

const PROMPT_SUFFIX =
  "\n\nRespond with ONLY a JSON object with exactly these keys: " +
  '"explanation" (string, why this query is dangerous), ' +
  '"remediation" (string, how a web administrator fixes it), ' +
  '"riskLevel" (one of Critical, High, Medium, Low). No markdown, no extra text.';

function buildPrompt(title: string, query: string): string {
  return (
    "Analyze the following Google Dork (advanced search query) used in bug bounty hunting:\n" +
    `Title: ${title}\n` +
    `Query: ${query}\n` +
    "Provide:\n" +
    "1. A detailed explanation of why this query is dangerous.\n" +
    "2. Specific remediation steps for a web administrator.\n" +
    "3. An overall risk level (Critical, High, Medium, Low)." +
    PROMPT_SUFFIX
  );
}

/** Pull the first JSON object out of a model reply that may be wrapped in
 *  markdown fences or prose. */
function parseAnalysis(text: string): AnalysisResult | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (typeof parsed.explanation === "string" && typeof parsed.remediation === "string") {
      return {
        explanation: parsed.explanation,
        remediation: parsed.remediation,
        riskLevel: typeof parsed.riskLevel === "string" ? parsed.riskLevel : "Unknown",
      };
    }
  } catch {
    /* fall through */
  }
  return null;
}

async function callGLM(prompt: string, apiKey: string, res: any): Promise<void> {
  const base = process.env.GLM_BASE_URL || "https://api.z.ai/api/paas/v4";
  const model = process.env.GLM_MODEL || "glm-4.5-flash";

  const upstream = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    res.status(502).json({ error: `GLM API error (HTTP ${upstream.status}): ${detail.slice(0, 200)}` });
    return;
  }

  const data = await upstream.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  const analysis = content ? parseAnalysis(content) : null;
  if (!analysis) {
    res.status(502).json({ error: "GLM returned an unparseable response" });
    return;
  }
  res.status(200).json(analysis);
}

async function callGemini(prompt: string, apiKey: string, res: any): Promise<void> {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
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

  const data = await upstream.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const analysis = text ? parseAnalysis(text) : null;
  if (!analysis) {
    res.status(502).json({ error: "Gemini returned an unparseable response" });
    return;
  }
  res.status(200).json(analysis);
}

export default async function handler(req: any, res: any): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const { title, query } = req.body || {};
  if (typeof title !== "string" || typeof query !== "string" || !title || !query) {
    res.status(400).json({ error: "Body must be JSON: { title, query }" });
    return;
  }

  const prompt = buildPrompt(title, query);
  const glmKey = process.env.GLM_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  try {
    if (glmKey) {
      await callGLM(prompt, glmKey, res);
    } else if (geminiKey && geminiKey.startsWith("AIza")) {
      await callGemini(prompt, geminiKey, res);
    } else if (geminiKey) {
      // A non-Google-shaped key in the old variable: almost certainly a GLM key
      // pasted before this proxy supported GLM. Route it to GLM.
      await callGLM(prompt, geminiKey, res);
    } else {
      res.status(503).json({
        error: "AI analysis not configured: set GLM_API_KEY (Z.ai) in your deployment environment",
      });
    }
  } catch (error) {
    res.status(502).json({ error: `AI request failed: ${(error as Error).message}` });
  }
}
