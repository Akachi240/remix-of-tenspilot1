import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from '../src/lib/ai-prompt';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// --- Firebase Admin SDK Initialization ---
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    console.error("FIREBASE_PRIVATE_KEY environment variable is not set.");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : undefined,
    }),
  });
}

const db = getFirestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface AgentResponse {
  response: string;
  riskLevel: "low" | "medium" | "high";
  escalateToDoctor: boolean;
  actions: string[];
  confidence: number;
}

async function getAIResponse(history: any[], message: string): Promise<AgentResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Format history for Gemini
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.parts[0].text }]
  }));

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Understood. I will act as the TensPilot+ AI Clinical Agent and output only structured JSON." }] },
      ...formattedHistory
    ]
  });

  const result = await chat.sendMessage(message);
  const text = result.response.text();

  try {
    const cleanedText = text.replace(/^```json\n?|```$/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error("Failed to parse AI JSON response:", err, "Raw text:", text);
    return {
      response: "Sorry, I'm having trouble processing that securely. Could you try rephrasing?",
      riskLevel: "medium",
      escalateToDoctor: false,
      actions: [],
      confidence: 0.3
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, userId, linkedDoctorId, history } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: 'Missing required fields: message and userId' });
  }

  try {
    const aiResult = await getAIResponse(history || [], message);

    // --- Backend Actions Execution ---
    // Extensible action handling engine
    
    // 1. Doctor Escalation Action
    if (aiResult.escalateToDoctor && linkedDoctorId) {
      await db.collection("alerts").add({
        patientId: userId,
        doctorId: linkedDoctorId,
        message: message,
        aiResponse: aiResult.response,
        riskLevel: aiResult.riskLevel,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "unread"
      });
    }

    // 2. Consultation Trigger Action
    if (aiResult.actions.includes("create_consultation") && linkedDoctorId) {
      const roomId = `TensPilot_Consult_${linkedDoctorId}_${userId}`;
      await db.collection("consultations").doc(roomId).set({
        id: roomId,
        roomId,
        patientId: userId,
        doctorId: linkedDoctorId,
        status: "ringing",
        initiatedBy: 'patient_ai_escalation',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        reason: message
      }, { merge: true });
    }

    // You can add more actions here in the future without modifying the frontend!
    // e.g., if (aiResult.actions.includes("log_pain_data")) { ... }

    res.status(200).json(aiResult);
  } catch (error) {
    console.error('Error in AI agent handler:', error);
    res.status(500).json({ 
      response: "I'm currently unavailable due to a technical issue.",
      riskLevel: "medium",
      escalateToDoctor: false,
      actions: [],
      confidence: 0
    });
  }
}
