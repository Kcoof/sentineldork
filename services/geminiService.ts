
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

const apiKey = import.meta.env.VITE_API_KEY || '';
let genAI: GoogleGenAI | null = null;

if (apiKey) {
  genAI = new GoogleGenAI({ apiKey });
}

export const analyzeDork = async (title: string, query: string): Promise<AIAnalysis> => {
  if (!genAI) {
    return {
      explanation: "AI analysis is unavailable because no API key was provided.",
      remediation: "Please configure VITE_API_KEY in your environment.",
      riskLevel: "Unknown"
    };
  }

  const model = "gemini-2.0-flash";
  
  try {
    const response = await genAI.models.generateContent({
      model,
      contents: `Analyze the following Google Dork (advanced search query) used in bug bounty hunting:
      Title: ${title}
      Query: ${query}

      Provide:
      1. A detailed explanation of why this query is dangerous.
      2. Specific remediation steps for a web administrator.
      3. An overall risk level (Critical, High, Medium, Low).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            remediation: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
          },
          required: ["explanation", "remediation", "riskLevel"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as AIAnalysis;
  } catch (e) {
    console.error("AI Analysis failed:", e);
    return {
      explanation: "Failed to get or parse AI response.",
      remediation: "Check server logs and configurations manually.",
      riskLevel: "Unknown"
    };
  }
};
