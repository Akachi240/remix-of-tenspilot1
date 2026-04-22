import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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
  syncToSupabase: () => Promise<void>;
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
  const [user, setUser] = useState<any>(null);

  // Get authenticated user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

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

  // Sync to Supabase
  const syncToSupabase = async () => {
    if (!user || !activeProfile) return;
    
    try {
      // Insert/Update patient
      const { error: patientError } = await supabase
        .from('patients')
        .upsert({
          id: activeProfile.id,
          user_id: user.id,
          name: activeProfile.name,
          age: activeProfile.age || null,
          date_of_birth: activeProfile.dateOfBirth || null,
          supervising_physician: activeProfile.supervisingPhysician || null,
        });

      if (patientError) console.error('Patient sync error:', patientError);

      // Insert medications
      for (const med of activeProfile.medications) {
        await supabase
          .from('medications')
          .insert({
            patient_id: activeProfile.id,
            name: med,
          });
      }

      // Insert session logs
      for (const session of activeProfile.sessionHistory) {
        await supabase
          .from('therapy_sessions')
          .insert({
            patient_id: activeProfile.id,
            date: session.date,
            time: new Date().toLocaleTimeString(),
            body_area: session.placement,
            duration: session.parameters.duration,
            intensity: session.parameters.intensity,
            pain_before: session.painBefore,
            pain_after: session.painAfter,
            mode: session.painType,
            notes: session.notes,
          });
      }

      console.log('Data synced to Supabase successfully');
    } catch (error) {
      console.error('Sync to Supabase error:', error);
    }
  };

  return (
    <ProfileContext.Provider value={{ profiles, activeProfileId, activeProfile, addProfile, deleteProfile, setActiveProfileId, addMedication, removeMedication, addSession, syncToSupabase }}>
      {children}
    </ProfileContext.Provider>
  );
};