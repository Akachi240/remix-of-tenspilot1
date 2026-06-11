import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { SessionRecord } from '../context/ProfileContext';

/** Shape of a session document from the global `sessions` Firestore collection. */
export interface GlobalSession {
  id?: string;
  date: string;
  modeId?: string;
  modeName?: string;
  painType?: string;
  placement?: string;
  parameters?: { frequency: string; pulseDuration: string; intensity: number; duration: number };
  painBefore?: number;
  painAfter?: number;
  reductionPct?: number;
  notes?: string;
  updatedAt?: { toDate?: () => Date } | string | Date;
  [key: string]: unknown;
}

export interface SyncResult {
  mergedSessions: SessionRecord[];
  toUpload: SessionRecord[];
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'local_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
}

export function hasSessionSyncConflict(
  nested: SessionRecord[],
  global: GlobalSession[]
): boolean {
  const globalById = new Map<string, GlobalSession>();
  const globalByDate = new Map<string, GlobalSession>();
  
  global.forEach(s => {
    if (s.id) globalById.set(s.id, s);
    if (s.date) globalByDate.set(s.date, s);
  });

  for (const n of nested) {
    const match = (n.id && globalById.get(n.id)) || globalByDate.get(n.date);
    if (match) {
      if (
        n.notes !== match.notes ||
        n.painAfter !== match.painAfter ||
        n.reductionPct !== match.reductionPct
      ) {
        return true;
      }
    }
  }
  return false;
}

export function resolveSessionConflict(
  nested: SessionRecord,
  global: GlobalSession
): SessionRecord {
  const nestedTime = nested.updatedAt ? new Date(nested.updatedAt).getTime() : 0;
  // Handle Firestore Timestamp or string date
  const globalTime = global.updatedAt 
    ? (typeof global.updatedAt.toDate === 'function' 
        ? global.updatedAt.toDate().getTime() 
        : new Date(global.updatedAt).getTime())
    : 0;

  if (globalTime > nestedTime) {
    // Global wins (modified by doctor)
    return {
      id: global.id || nested.id || generateUUID(),
      date: global.date || nested.date,
      modeId: global.modeId || nested.modeId,
      modeName: global.modeName || nested.modeName,
      painType: global.painType || nested.painType,
      placement: global.placement || nested.placement,
      parameters: global.parameters || nested.parameters,
      painBefore: global.painBefore !== undefined ? global.painBefore : nested.painBefore,
      painAfter: global.painAfter !== undefined ? global.painAfter : nested.painAfter,
      reductionPct: global.reductionPct !== undefined ? global.reductionPct : nested.reductionPct,
      notes: global.notes !== undefined ? global.notes : nested.notes,
      updatedAt: global.updatedAt 
        ? (typeof global.updatedAt.toDate === 'function' 
            ? global.updatedAt.toDate().toISOString() 
            : new Date(global.updatedAt).toISOString())
        : nested.updatedAt,
    };
  }

  // Nested wins (modified locally)
  return nested;
}

export async function syncSessionsWithGlobal(
  userId: string,
  nestedSessions: SessionRecord[],
  globalSessions: GlobalSession[]
): Promise<SyncResult> {
  const globalById = new Map<string, GlobalSession>();
  const globalByDate = new Map<string, GlobalSession>();
  
  globalSessions.forEach(s => {
    if (s.id) globalById.set(s.id, s);
    if (s.date) globalByDate.set(s.date, s);
  });

  const mergedSessions: SessionRecord[] = [];
  const toUpload: SessionRecord[] = [];
  const processedGlobalIds = new Set<string>();
  const processedGlobalDates = new Set<string>();

  // 1. Process nested sessions and resolve conflicts or match with global
  for (const nested of nestedSessions) {
    const globalMatch = (nested.id && globalById.get(nested.id)) || globalByDate.get(nested.date);
    
    if (globalMatch) {
      if (globalMatch.id) processedGlobalIds.add(globalMatch.id);
      if (globalMatch.date) processedGlobalDates.add(globalMatch.date);

      const resolved = resolveSessionConflict(nested, globalMatch);
      mergedSessions.push(resolved);

      // If local is newer, we need to upload the updated local version to global
      const nestedTime = nested.updatedAt ? new Date(nested.updatedAt).getTime() : 0;
      const globalTime = globalMatch.updatedAt 
        ? (typeof globalMatch.updatedAt.toDate === 'function' 
            ? globalMatch.updatedAt.toDate().getTime() 
            : new Date(globalMatch.updatedAt).getTime())
        : 0;
      if (nestedTime > globalTime) {
        toUpload.push(resolved);
      }
    } else {
      // Local session only exists locally. Needs to be uploaded to global.
      mergedSessions.push(nested);
      toUpload.push(nested);
    }
  }

  // 2. Add global sessions that do not exist in nested
  for (const global of globalSessions) {
    const isProcessed = (global.id && processedGlobalIds.has(global.id)) || processedGlobalDates.has(global.date);
    if (!isProcessed) {
      mergedSessions.push({
        id: global.id || generateUUID(),
        date: global.date,
        modeId: global.modeId,
        modeName: global.modeName,
        painType: global.painType || 'Acute',
        placement: global.placement || '',
        parameters: global.parameters || { frequency: '', pulseDuration: '', intensity: 0, duration: 0 },
        painBefore: global.painBefore || 0,
        painAfter: global.painAfter || 0,
        reductionPct: global.reductionPct || 0,
        notes: global.notes || '',
        updatedAt: global.updatedAt 
          ? (typeof global.updatedAt.toDate === 'function' 
              ? global.updatedAt.toDate().toISOString() 
              : new Date(global.updatedAt).toISOString())
          : global.date,
      });
    }
  }

  return { mergedSessions, toUpload };
}

export async function backfillSessionsToGlobal(
  userId: string,
  sessions: SessionRecord[]
): Promise<void> {
  const CHUNK_SIZE = 100;
  for (let i = 0; i < sessions.length; i += CHUNK_SIZE) {
    const chunk = sessions.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const session of chunk) {
      const sessionId = session.id || generateUUID();
      const docRef = doc(db, 'sessions', sessionId);
      batch.set(docRef, {
        patientId: userId,
        date: session.date,
        modeId: session.modeId || 'general',
        modeName: session.modeName || 'TENS Therapy',
        painType: session.painType || 'Acute',
        placement: session.placement || '',
        parameters: session.parameters || { frequency: '', pulseDuration: '', intensity: 0, duration: 0 },
        painBefore: session.painBefore || 0,
        painAfter: session.painAfter || 0,
        reductionPct: session.reductionPct || 0,
        notes: session.notes || '',
        updatedAt: session.updatedAt ? new Date(session.updatedAt) : new Date(session.date),
        timestamp: session.updatedAt ? new Date(session.updatedAt) : new Date(session.date),
        duration: session.parameters?.duration || 0,
        intensity: session.parameters?.intensity || 0,
        location: session.placement || '',
      }, { merge: true });
    }
    await batch.commit();
  }
}
