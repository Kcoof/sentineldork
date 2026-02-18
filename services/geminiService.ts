
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeDork = async (title: string, query: string): Promise<AIAnalysis> => {
  const model = "gemini-3-flash-preview";
  
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

  try {
    return JSON.parse(response.text || '{}') as AIAnalysis;
  } catch (e) {
    return {
      explanation: "Failed to parse AI response.",
      remediation: "Check server logs and configurations manually.",
      riskLevel: "Unknown"
    };
  }
};
