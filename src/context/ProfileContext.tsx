import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface SessionRecord {
  date: string;
  painType: 'Acute' | 'Chronic';
  placement: string;
  parameters: { frequency: string; pulseDuration: string; intensity: number; duration: number };
  painBefore: number;
  painAfter: number;
  reductionPct: number;
  notes: string;
}

export interface Profile {
  id: string;
  name: string;
  primaryCondition: string;
  medications: string[];
  sessionHistory: SessionRecord[];
  age?: number;
  dateOfBirth?: string;
  supervisingPhysician?: string;
}

interface ProfileContextType {
  profiles: Profile[];
  activeProfileId: string | null;
  activeProfile: Profile | null;
  addProfile: (name: string, condition: string, age?: number, dob?: string, physician?: string) => void;
  deleteProfile: (id: string) => void;
  setActiveProfileId: (id: string) => void;
  addMedication: (med: string) => void;
  removeMedication: (med: string) => void;
  addSession: (session: SessionRecord) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfiles = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfiles must be used within ProfileProvider');
  return ctx;
};

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try { return JSON.parse(localStorage.getItem('tens-companion-profiles') || '[]'); } catch { return []; }
  });
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() =>
    localStorage.getItem('tens-active-profile-id')
  );

  const persist = useCallback((p: Profile[]) => {
    localStorage.setItem('tens-companion-profiles', JSON.stringify(p));
  }, []);

  useEffect(() => { persist(profiles); }, [profiles, persist]);
  useEffect(() => {
    if (activeProfileId) localStorage.setItem('tens-active-profile-id', activeProfileId);
    else localStorage.removeItem('tens-active-profile-id');
  }, [activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const addProfile = (name: string, condition: string, age?: number, dob?: string, physician?: string) => {
    const id = crypto.randomUUID();
    const newProfile: Profile = { 
      id, 
      name, 
      primaryCondition: condition, 
      medications: [], 
      sessionHistory: [],
      age,
      dateOfBirth: dob,
      supervisingPhysician: physician
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileIdState(id);
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) {
      const remaining = profiles.filter(p => p.id !== id);
      setActiveProfileIdState(remaining[0]?.id || null);
    }
  };

  const setActiveProfileId = (id: string) => setActiveProfileIdState(id);

  const updateActive = (fn: (p: Profile) => Profile) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? fn(p) : p));
  };

  const addMedication = (med: string) => updateActive(p => ({ ...p, medications: [...p.medications, med] }));
  const removeMedication = (med: string) => updateActive(p => ({ ...p, medications: p.medications.filter(m => m !== med) }));
  const addSession = (session: SessionRecord) => updateActive(p => ({ ...p, sessionHistory: [...p.sessionHistory, session] }));

  return (
    <ProfileContext.Provider value={{ profiles, activeProfileId, activeProfile, addProfile, deleteProfile, setActiveProfileId, addMedication, removeMedication, addSession }}>
      {children}
    </ProfileContext.Provider>
  );
};