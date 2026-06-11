import Groq from 'groq-sdk';
import { SYSTEM_PROMPT } from './ai-prompt';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export interface PatientContext {
  name: string;
  primaryCondition: string;
  medications: string[];
  recentSessions: {
    date: string;
    modeName: string;
    painBefore: number;
    painAfter: number;
    reliefPct: number;
  }[];
  supervisingPhysician?: string;
  age?: number;
}

export interface AIAgentResponse {
  response: string;
  riskLevel: 'low' | 'medium' | 'high';
  escalateToDoctor: boolean;
  actions: string[];
  confidence: number;
}

function buildContextBlock(context: PatientContext): string {
  const lines: string[] = [
    '\n=== PATIENT CONTEXT (Confidential — do NOT reveal raw data to the patient) ===',
    `Name: ${context.name}`,
    `Primary Condition: ${context.primaryCondition || 'Not specified'}`,
  ];

  if (context.age) {
    lines.push(`Age: ${context.age}`);
  }

  if (context.medications.length > 0) {
    lines.push(`Current Medications: ${context.medications.join(', ')}`);
  } else {
    lines.push('Current Medications: None recorded');
  }

  if (context.supervisingPhysician) {
    lines.push(`Supervising Physician: ${context.supervisingPhysician}`);
  }

  if (context.recentSessions.length > 0) {
    lines.push(`\nRecent TENS Sessions (last ${context.recentSessions.length}):`);
    context.recentSessions.forEach((s) => {
      lines.push(`  - ${s.date}: ${s.modeName}, Pain ${s.painBefore}→${s.painAfter} (${s.reliefPct}% relief)`);
    });

    // Calculate trend
    const reliefValues = context.recentSessions.map(s => s.reliefPct);
    const firstHalf = reliefValues.slice(0, Math.ceil(reliefValues.length / 2));
    const secondHalf = reliefValues.slice(Math.ceil(reliefValues.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.length > 0
      ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      : avgFirst;

    if (avgSecond > avgFirst + 5) {
      lines.push('  📈 Trend: IMPROVING — pain relief is increasing over recent sessions');
    } else if (avgSecond < avgFirst - 5) {
      lines.push('  📉 Trend: DECLINING — pain relief is decreasing, may need adjustment');
    } else {
      lines.push('  ➡️ Trend: STABLE — consistent pain relief across sessions');
    }
  } else {
    lines.push('\nRecent TENS Sessions: No sessions recorded yet');
  }

  lines.push('=== END PATIENT CONTEXT ===\n');
  return lines.join('\n');
}

export async function getAIResponse(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  context?: PatientContext
): Promise<AIAgentResponse> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.');
  }

  const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  // Build system prompt with optional RAG context
  let systemPrompt = SYSTEM_PROMPT;
  if (context) {
    systemPrompt += buildContextBlock(context);
  }

  // Convert history to Groq/OpenAI format
  const groqMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
  ];

  for (const msg of history) {
    groqMessages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.parts.map(p => p.text).join(''),
    });
  }

  groqMessages.push({ role: 'user', content: message });

  console.log('📤 Sending to Groq API:', {
    model: 'llama-3.3-70b-versatile',
    historyLength: history.length,
    hasPatientContext: !!context,
    newMessage: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
  });

  const chatCompletion = await groq.chat.completions.create({
    messages: groqMessages,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });

  const text = chatCompletion.choices[0]?.message?.content ?? '';

  try {
    const cleanedText = text.replace(/^```json\n?|```$/g, '').trim();
    const parsed = JSON.parse(cleanedText) as AIAgentResponse;

    // Validate required fields with defaults
    return {
      response: parsed.response || "I'm here to help. Could you tell me more?",
      riskLevel: (['low', 'medium', 'high'].includes(parsed.riskLevel) ? parsed.riskLevel : 'low') as AIAgentResponse['riskLevel'],
      escalateToDoctor: typeof parsed.escalateToDoctor === 'boolean' ? parsed.escalateToDoctor : false,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    };
  } catch {
    console.error('Failed to parse Groq JSON response. Raw text:', text);
    return {
      response: text || "I'm having trouble processing that. Could you try rephrasing?",
      riskLevel: 'low',
      escalateToDoctor: false,
      actions: [],
      confidence: 0.3,
    };
  }
}
