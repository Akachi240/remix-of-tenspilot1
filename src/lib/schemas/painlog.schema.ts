import { Timestamp } from 'firebase/firestore';

/**
 * Firestore Pain Log Document Schema
 * SOURCE OF TRUTH for the `pain_logs` collection
 */
export interface FirebasePainLog {
  id?: string;
  patientId: string;
  
  // Timing
  timestamp: Timestamp | Date; // When the pain was recorded
  createdAt: Timestamp | Date; // Record creation time
  
  // Measurements
  painLevel: number; // 0-10 scale
  
  // Location
  location: string; // e.g., "Lower back", "Left knee"
  
  // Context
  triggers?: string[]; // e.g., ["walking", "sitting"]
  symptoms?: string[]; // e.g., ["sharp", "aching"]
  notes?: string;
  
  // Source
  source: 'manual' | 'pre-session' | 'post-session';
  sessionId?: string; // If linked to a session
}

export function createPainLogDocument(
  data: Partial<FirebasePainLog>
): FirebasePainLog {
  return {
    patientId: data.patientId || '',
    timestamp: data.timestamp || new Date(),
    createdAt: data.createdAt || new Date(),
    painLevel: data.painLevel ?? 0,
    location: data.location || 'Unknown',
    triggers: data.triggers || [],
    symptoms: data.symptoms || [],
    notes: data.notes || '',
    source: data.source || 'manual',
    sessionId: data.sessionId,
  };
}
