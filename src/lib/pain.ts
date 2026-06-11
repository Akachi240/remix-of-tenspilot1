import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, serverTimestamp } from 'firebase/firestore';
import { FirebasePainLog, createPainLogDocument } from './schemas/painlog.schema';

export interface PainLog {
  id: string;
  userId: string; // Keep as userId for frontend compatibility, maps to patientId in Firestore
  painLevel: number;
  location: string;
  notes: string;
  timestamp: Date;
}

// Save a pain log to Firestore
export const savePainLog = async (
  userId: string,
  painLevel: number,
  location: string,
  notes: string
) => {
  try {
    const painLogData = createPainLogDocument({
      patientId: userId,
      painLevel,
      location,
      notes,
      source: 'manual',
      timestamp: serverTimestamp() as unknown as Timestamp,
      createdAt: serverTimestamp() as unknown as Timestamp,
    });

    const docRef = await addDoc(collection(db, 'pain_logs'), painLogData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving pain log:', error);
    throw error;
  }
};

// Get all pain logs for a user
export const getPainLogs = async (userId: string): Promise<PainLog[]> => {
  try {
    const q = query(
      collection(db, 'pain_logs'),
      where('patientId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const logs: PainLog[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebasePainLog;
      logs.push({
        id: doc.id,
        userId: data.patientId, // Map back to userId for frontend
        painLevel: data.painLevel,
        location: data.location,
        notes: data.notes || '',
        timestamp: (data.timestamp as Timestamp).toDate ? (data.timestamp as Timestamp).toDate() : new Date(),
      });
    });
    return logs;
  } catch (error) {
    console.error('Error getting pain logs:', error);
    return [];
  }
};

// Get average pain reduction
export const getAveragePain = async (userId: string): Promise<number> => {
  try {
    const logs = await getPainLogs(userId);
    if (logs.length === 0) return 0;
    const total = logs.reduce((sum, log) => sum + log.painLevel, 0);
    return Math.round(total / logs.length * 10) / 10;
  } catch (error) {
    console.error('Error calculating average pain:', error);
    return 0;
  }
};

// Get pain trend (last N days)
export const getPainTrend = async (userId: string, days: number = 7) => {
  try {
    const logs = await getPainLogs(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return logs.filter(log => log.timestamp > cutoffDate);
  } catch (error) {
    console.error('Error getting pain trend:', error);
    return [];
  }
};
