import { useProfiles } from '../context/ProfileContext';

export function useSessionSync() {
  const { activeProfile } = useProfiles();
  
  const sessions = activeProfile?.sessionHistory || [];
  const pendingCount = sessions.filter(s => !s.id || s.id.startsWith('local_')).length;

  return {
    syncStatus: pendingCount > 0 ? 'pending' : 'synced',
    hasPendingSessions: pendingCount > 0,
    sessionsCount: sessions.length,
    pendingCount
  };
}
