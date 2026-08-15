
import { AIAnalysis } from "../types";

/**
 * AI analysis is served by the serverless proxy at /api/ai (see api/ai.ts),
 * which talks to GLM (Z.ai) or Gemini while keeping the API key server-side.
 *
 * SECURITY: the browser never sees any API key. The old behavior of embedding
 * VITE_API_KEY into the static build was removed because any key shipped to
 * the client is effectively public.
 *
 * Set VITE_AI_PROXY only if you host the proxy at a different origin.
 */
const PROXY_URL: string = import.meta.env.VITE_AI_PROXY || "/api/ai";

const unavailable = (message: string): AIAnalysis => ({
  explanation: message,
  remediation: "—",
  riskLevel: "Unknown",
});

export const analyzeDork = async (title: string, query: string): Promise<AIAnalysis> => {
  try {
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, query }),
    });

    if (response.status === 503) {
      return unavailable("AI analysis is not configured on this deployment (server-side GLM_API_KEY missing).");
    }
    if (!response.ok) {
      return unavailable(`AI proxy error (HTTP ${response.status}).`);
    }

    const data = await response.json();
    if (data && typeof data.explanation === "string" && typeof data.remediation === "string") {
      return data as AIAnalysis;
    }
    return unavailable("AI proxy returned an unexpected response.");
  } catch {
    return unavailable("AI analysis unavailable — this static deployment has no /api/ai proxy (see README).");
  }
};
