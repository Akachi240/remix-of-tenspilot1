import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FirebaseSession,
  createSessionDocument,
  validateSession,
} from '@/lib/schemas/session.schema';

/**
 * Save a completed TENS session to Firestore
 * This is the SINGLE SOURCE OF TRUTH for session saves
 */
export async function saveSessionToFirestore(
  patientId: string,
  sessionData: {
    modeId: string;
    modeName: string;
    painBefore: number;
    painAfter: number;
    location: string;
    duration: number;
    intensity: number;
    frequency: string;
    pulseDuration: string;
    painType?: 'Acute' | 'Chronic';
    notes?: string;
  }
): Promise<string> {
  try {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    // Calculate pain reduction percentage
    const reductionPct = sessionData.painBefore > 0
      ? Math.round(
          ((sessionData.painBefore - sessionData.painAfter) /
            sessionData.painBefore) *
            100
        )
      : 0;

    // Create session document with validated data
    const session: FirebaseSession = createSessionDocument({
      patientId,
      timestamp: serverTimestamp() as unknown as Timestamp,
      createdAt: serverTimestamp() as unknown as Timestamp,
      modeId: sessionData.modeId,
      modeName: sessionData.modeName,
      painBefore: sessionData.painBefore,
      painAfter: sessionData.painAfter,
      location: sessionData.location,
      duration: sessionData.duration,
      intensity: sessionData.intensity,
      parameters: {
        frequency: sessionData.frequency,
        pulseDuration: sessionData.pulseDuration,
      },
      painType: sessionData.painType,
      notes: sessionData.notes,
      completed: true,
      reductionPct,
    });

    // Validate before saving
    const validationErrors = validateSession(session);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'sessions'), session);

    console.log(
      `✅ Session saved to Firestore (ID: ${docRef.id})`,
      {
        patient: patientId,
        mode: sessionData.modeName,
        relief: `${sessionData.painBefore} → ${sessionData.painAfter} (-${reductionPct}%)`,
      }
    );

    return docRef.id;
  } catch (error) {
    console.error('❌ Failed to save session to Firestore:', error);
    throw error;
  }
}
