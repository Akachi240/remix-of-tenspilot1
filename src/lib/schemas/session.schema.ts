import { Timestamp } from 'firebase/firestore';

/**
 * Firestore Session Document Schema
 * This is the SOURCE OF TRUTH for all session data
 * Both patient app and doctor dashboard MUST use this schema
 */
export interface FirebaseSession {
  // Primary identifiers
  id?: string; // Firestore document ID
  patientId: string; // Patient UID from Firebase Auth
  
  // Timing (CRITICAL: Use Firestore Timestamp)
  timestamp: Timestamp | Date; // Session date/time
  createdAt: Timestamp | Date; // Record creation time
  updatedAt?: Timestamp | Date; // When doctor added notes
  
  // Session identification
  modeId: string; // 'general' | 'neuropathy' | 'musculoskeletal' | 'period'
  modeName: string; // e.g., "General TENS"
  
  // Pain measurements (0-10 scale)
  painBefore: number;
  painAfter: number;
  reductionPct: number; // Calculated percentage
  
  // Session details (TOP-LEVEL, not nested)
  location: string; // NOT "placement" - e.g., "Lower back"
  duration: number; // NOT nested - minutes
  intensity: number; // NOT nested - 0-10 scale
  
  // Parameters (for reference, can be nested)
  parameters: {
    frequency: string; // e.g., "50 Hz"
    pulseDuration: string; // e.g., "100 µs"
  };
  
  // Metadata
  painType?: 'Acute' | 'Chronic';
  notes?: string;
  completed: boolean;
  
  // Doctor feedback
  doctorNotes?: string;
  doctorReviewedAt?: Timestamp | Date;
}

/**
 * Factory function to create a new session document
 */
export function createSessionDocument(
  data: Partial<FirebaseSession>
): FirebaseSession {
  return {
    patientId: data.patientId || '',
    timestamp: data.timestamp || new Date(),
    createdAt: data.createdAt || new Date(),
    modeId: data.modeId || 'general',
    modeName: data.modeName || 'General TENS',
    painBefore: data.painBefore ?? 0,
    painAfter: data.painAfter ?? 0,
    reductionPct: data.reductionPct ?? 0,
    location: data.location || '',
    duration: data.duration ?? 0,
    intensity: data.intensity ?? 0,
    parameters: data.parameters || {
      frequency: '50 Hz',
      pulseDuration: '100 µs',
    },
    painType: data.painType,
    notes: data.notes || '',
    completed: data.completed ?? false,
  };
}

/**
 * Validation helper - ensure session data is valid before saving
 */
export function validateSession(session: Partial<FirebaseSession>): string[] {
  const errors: string[] = [];

  if (!session.patientId) errors.push('patientId is required');
  if (!session.timestamp) errors.push('timestamp is required');
  if (session.painBefore === undefined) errors.push('painBefore is required');
  if (session.painAfter === undefined) errors.push('painAfter is required');
  if (session.painBefore !== undefined && (session.painBefore < 0 || session.painBefore > 10)) {
    errors.push('painBefore must be 0-10');
  }
  if (session.painAfter !== undefined && (session.painAfter < 0 || session.painAfter > 10)) {
    errors.push('painAfter must be 0-10');
  }
  if (!session.location) errors.push('location is required');
  if (!session.duration || session.duration <= 0) {
    errors.push('duration must be > 0');
  }

  return errors;
}
