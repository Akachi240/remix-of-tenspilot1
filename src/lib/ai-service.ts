import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from './ai-prompt';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface AIAgentResponse {
  response: string;
  riskLevel: 'low' | 'medium' | 'high';
  escalateToDoctor: boolean;
  actions: string[];
  confidence: number;
}

export async function getAIResponse(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<AIAgentResponse> {
  if (!API_KEY) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Build the conversation contents for the Gemini API
  const contents = [
    { role: 'user' as const, parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model' as const, parts: [{ text: 'Understood. I will act as the TensPilot+ AI Clinical Agent and output only structured JSON.' }] },
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: msg.parts,
    })),
    { role: 'user' as const, parts: [{ text: message }] },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
  });

  const text = response.text ?? '';

  try {
    const cleanedText = text.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(cleanedText);
  } catch {
    console.error('Failed to parse AI JSON response. Raw text:', text);
    // Return a safe fallback
    return {
      response: text || "I'm having trouble processing that. Could you try rephrasing?",
      riskLevel: 'low',
      escalateToDoctor: false,
      actions: [],
      confidence: 0.3,
    };
  }
}
