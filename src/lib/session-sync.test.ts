import { describe, it, expect } from 'vitest';
import { generateUUID, buildGlobalSessionDoc, syncSessionsWithGlobal } from './session-sync';

describe('session-sync', () => {
  describe('generateUUID', () => {
    it('generates a valid UUID string', () => {
      const id = generateUUID();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(10);
    });
  });

  describe('buildGlobalSessionDoc', () => {
    it('formats a local session into global schema', () => {
      const localSession = {
        id: 'local-1',
        date: '2023-01-01',
        placement: 'Neck',
        painType: 'Acute' as 'Acute' | 'Chronic',
        painBefore: 8,
        painAfter: 2,
        reductionPct: 75,
        notes: '',
        parameters: { frequency: '100Hz', pulseDuration: '150us', intensity: 5, duration: 30 }
      };
      
      const doc = buildGlobalSessionDoc('user123', localSession);
      
      expect(doc.patientId).toBe('user123');
      expect(doc.date).toBe('2023-01-01');
      expect(doc.placement).toBe('Neck');
      expect(doc.painBefore).toBe(8);
      expect(doc.painAfter).toBe(2);
      expect(doc.parameters.duration).toBe(30);
      expect(doc.parameters?.intensity).toBe(5);
    });
  });

  describe('syncSessionsWithGlobal', () => {
    it('merges new local sessions that are not in global', async () => {
      const localSessions = [{ id: 's1', date: '2023-01-01' }];
      const globalSessions = [{ id: 's2', date: '2023-01-02' }];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { mergedSessions, toUpload } = await syncSessionsWithGlobal('user123', localSessions as any, globalSessions as any);
      
      expect(mergedSessions.length).toBe(2);
      expect(toUpload.length).toBe(1);
      expect(toUpload[0].id).toBe('s1');
    });

    it('does not duplicate existing sessions', async () => {
      const localSessions = [{ id: 's1', date: '2023-01-01' }];
      const globalSessions = [{ id: 's1', date: '2023-01-01' }];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { mergedSessions, toUpload } = await syncSessionsWithGlobal('user123', localSessions as any, globalSessions as any);
      
      expect(mergedSessions.length).toBe(1);
      expect(toUpload.length).toBe(0);
    });
  });
});
