/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { generateUUID, syncSessionsWithGlobal, backfillSessionsToGlobal, GlobalSession, buildGlobalSessionDoc } from '@/lib/session-sync';

export interface SessionRecord {
  id?: string;
  date: string;
  modeId?: string;
  modeName?: string;
  painType: 'Acute' | 'Chronic';
  placement: string;
  parameters: { frequency: string; pulseDuration: string; intensity: number; duration: number };
  painBefore: number;
  painAfter: number;
  reductionPct: number;
  notes: string;
  updatedAt?: string;
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
  supervisingPhysicianId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const syncPatientRootDoc = async (userId: string, email: string, profile: Profile) => {
  await setDoc(doc(db, 'users', userId), {
    name: profile.name,
    condition: profile.primaryCondition,
    medications: profile.medications || [],
    age: profile.age || null,
    dateOfBirth: profile.dateOfBirth || null,
    supervisingPhysician: profile.supervisingPhysician || null,
    email: email,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

interface ProfileContextType {
  profiles: Profile[];
  activeProfileId: string | null;
  activeProfile: Profile | null;
  addProfile: (_name: string, _condition: string, _age?: number, _dob?: string, _physician?: string) => Promise<void>;
  deleteProfile: (_id: string) => Promise<void>;
  setActiveProfileId: (_id: string) => void;
  addMedication: (_med: string) => Promise<void>;
  removeMedication: (_med: string) => Promise<void>;
  addSession: (_session: SessionRecord) => Promise<void>;
  updateProfile: (_id: string, _updates: Partial<Profile>) => Promise<void>;
  syncToFirebase: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfiles = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfiles must be used within ProfileProvider');
  return ctx;
};

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);

  // Load active profile ID from local storage on mount
  useEffect(() => {
    const storedActiveId = localStorage.getItem('tens-active-profile-id');
    if (storedActiveId) {
      setActiveProfileIdState(storedActiveId);
    }
  }, []);

  // Sync active profile ID selection to localStorage
  useEffect(() => {
    if (activeProfileId) {
      localStorage.setItem('tens-active-profile-id', activeProfileId);
    } else {
      localStorage.removeItem('tens-active-profile-id');
    }
  }, [activeProfileId]);

  // Firebase Real-time listeners & Auto-migration
  useEffect(() => {
    if (!user) {
      // If not logged in, fallback to local storage (guest mode)
      const stored = localStorage.getItem('tens-companion-profiles');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setProfiles(parsed);
            if (parsed.length > 0) {
              setActiveProfileIdState(prev => prev || parsed[0].id);
            }
          }
        } catch (e) {
          console.error('Failed to parse offline profiles:', e);
        }
      }
      return;
    }

    const userId = user.uid;
    const migrationFlag = `tens-migrated-to-firebase-${userId}`;

    // Auto-migration logic
    const runMigration = async () => {
      if (localStorage.getItem(migrationFlag) === 'true') return;

      try {
        const localStored = localStorage.getItem('tens-companion-profiles');
        if (localStored) {
          const localProfiles: Profile[] = JSON.parse(localStored);
          if (Array.isArray(localProfiles) && localProfiles.length > 0) {
            // eslint-disable-next-line no-console
            console.log(`Auto-migrating ${localProfiles.length} profiles to Firestore for user: ${userId}`);

            for (const profile of localProfiles) {
              const updatedSessions = profile.sessionHistory.map(s => ({
                id: s.id || generateUUID(),
                updatedAt: s.updatedAt || s.date,
                ...s
              }));

              const profileDataToSave = Object.fromEntries(
                Object.entries({
                  ...profile,
                  sessionHistory: updatedSessions,
                  createdAt: profile.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }).filter(([_, v]) => v !== undefined)
              );

              const profileDocRef = doc(db, 'users', userId, 'profiles', profile.id);
              await setDoc(profileDocRef, profileDataToSave, { merge: true });

              await backfillSessionsToGlobal(userId, updatedSessions);
            }
          }
        }
        localStorage.setItem(migrationFlag, 'true');
        // eslint-disable-next-line no-console
        console.log('Auto-migration completed successfully!');
      } catch (err) {
        console.error('Auto-migration failed:', err);
      }
    };

    runMigration();

    // Setup active listeners
    let currentGlobalSessions: GlobalSession[] = [];
    let currentRawProfiles: Profile[] = [];

    const handleSync = async (rawProfiles: Profile[], globalSessions: GlobalSession[]) => {
      const updatedProfiles: Profile[] = [];

      for (const profile of rawProfiles) {
        const nestedSessions = profile.sessionHistory || [];
        const { mergedSessions, toUpload } = await syncSessionsWithGlobal(userId, nestedSessions, globalSessions);

        updatedProfiles.push({
          ...profile,
          sessionHistory: mergedSessions,
          updatedAt: new Date().toISOString()
        });

        if (toUpload.length > 0) {
          backfillSessionsToGlobal(userId, toUpload).catch(err =>
            console.error('Failed to auto-upload sessions in background:', err)
          );
        }
      }

      setProfiles(updatedProfiles);
      localStorage.setItem('tens-companion-profiles', JSON.stringify(updatedProfiles));
    };

    const unsubProfiles = onSnapshot(collection(db, 'users', userId, 'profiles'), (snapshot) => {
      const rawProfiles: Profile[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        rawProfiles.push({
          id: doc.id,
          name: data.name || 'Unnamed Profile',
          primaryCondition: data.primaryCondition || '',
          medications: data.medications || [],
          sessionHistory: data.sessionHistory || [],
          age: data.age,
          dateOfBirth: data.dateOfBirth,
          supervisingPhysician: data.supervisingPhysician,
          supervisingPhysicianId: data.supervisingPhysicianId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      currentRawProfiles = rawProfiles;
      handleSync(currentRawProfiles, currentGlobalSessions);
    }, (error) => {
      console.error('Profiles listener error:', error);
    });

    const qSessions = query(collection(db, 'sessions'), where('patientId', '==', userId));
    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      const globalSessions: GlobalSession[] = [];
      snapshot.forEach((doc) => {
        globalSessions.push({ id: doc.id, ...doc.data() } as GlobalSession);
      });
      currentGlobalSessions = globalSessions;
      handleSync(currentRawProfiles, currentGlobalSessions);
    }, (error) => {
      console.error('Sessions listener error:', error);
    });

    return () => {
      unsubProfiles();
      unsubSessions();
    };
  }, [user]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  // Set default active profile if list is not empty and selection is invalid
  useEffect(() => {
    if (profiles.length > 0 && !activeProfile) {
      setActiveProfileIdState(profiles[0].id);
    }
  }, [profiles, activeProfile]);

  const persistLocally = useCallback((p: Profile[]) => {
    localStorage.setItem('tens-companion-profiles', JSON.stringify(p));
  }, []);

  const addProfile = async (name: string, condition: string, age?: number, dob?: string, physician?: string) => {
    const id = generateUUID();
    const newProfile: Profile = {
      id,
      name,
      primaryCondition: condition,
      medications: [],
      sessionHistory: [],
      age,
      dateOfBirth: dob,
      supervisingPhysician: physician,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProfiles(prev => {
      const next = [...prev, newProfile];
      persistLocally(next);
      return next;
    });
    setActiveProfileIdState(id);

    if (user?.uid) {
      const profileDataToSave = Object.fromEntries(
        Object.entries(newProfile).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'users', user.uid, 'profiles', id), profileDataToSave);
      
      // Sync full patient info to root user document for Doctor Dashboard
      await syncPatientRootDoc(user.uid, user.email || '', newProfile as Profile);
    }
  };

  const deleteProfile = async (id: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      persistLocally(next);
      return next;
    });

    if (activeProfileId === id) {
      const remaining = profiles.filter(p => p.id !== id);
      setActiveProfileIdState(remaining[0]?.id || null);
    }

    if (user?.uid) {
      await deleteDoc(doc(db, 'users', user.uid, 'profiles', id));
    }
  };

  const setActiveProfileId = (id: string) => setActiveProfileIdState(id);

  const updateActive = async (fn: (_p: Profile) => Profile) => {
    if (!activeProfileId) return;

    let updatedProfile: Profile | null = null;

    setProfiles(prev => {
      const next = prev.map(p => {
        if (p.id === activeProfileId) {
          updatedProfile = fn(p);
          return updatedProfile;
        }
        return p;
      });
      persistLocally(next);
      return next;
    });

    if (user?.uid && updatedProfile) {
      const profileDataToSave = Object.fromEntries(
        Object.entries({
          ...(updatedProfile as Profile),
          updatedAt: new Date().toISOString()
        }).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'users', user.uid, 'profiles', activeProfileId), profileDataToSave);
      
      // Sync full patient info to root user document for Doctor Dashboard
      await syncPatientRootDoc(user.uid, user.email || '', updatedProfile);
    }
  };

  const addMedication = async (med: string) => {
    await updateActive(p => ({ ...p, medications: [...p.medications, med] }));
  };

  const removeMedication = async (med: string) => {
    await updateActive(p => ({ ...p, medications: p.medications.filter(m => m !== med) }));
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    const updatedProfiles = profiles.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setProfiles(updatedProfiles);
    localStorage.setItem('tens-companion-profiles', JSON.stringify(updatedProfiles));
    if (user) {
      const profileRef = doc(db, 'users', user.uid, 'profiles', id);
      await setDoc(profileRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
      const updated = updatedProfiles.find(p => p.id === id);
      if (updated) {
        await setDoc(doc(db, 'users', user.uid), {
          name: updated.name,
          age: updated.age ?? null,
          condition: updated.primaryCondition ?? null,
          dob: updated.dateOfBirth ?? null,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    }
  };

  const addSession = async (session: SessionRecord) => {
    const sessionWithId = {
      id: session.id || generateUUID(),
      updatedAt: session.updatedAt || new Date().toISOString(),
      ...session
    };

    await updateActive(p => ({
      ...p,
      sessionHistory: [...p.sessionHistory, sessionWithId]
    }));

    if (user?.uid) {
      await setDoc(doc(db, 'sessions', sessionWithId.id), buildGlobalSessionDoc(user.uid, sessionWithId), { merge: true });
    }
  };

  const syncToFirebase = async () => {
    if (!user) return;
    const userId = user.uid;

    try {
      // Force rewrite profiles to Firestore
      for (const profile of profiles) {
        const profileDataToSave = Object.fromEntries(
          Object.entries({
            ...profile,
            updatedAt: new Date().toISOString()
          }).filter(([_, v]) => v !== undefined)
        );

        const profileDocRef = doc(db, 'users', userId, 'profiles', profile.id);
        await setDoc(profileDocRef, profileDataToSave, { merge: true });

        if (profile.id === activeProfileId) {
          await syncPatientRootDoc(userId, user.email || '', profile);
        }

        if (profile.sessionHistory.length > 0) {
          await backfillSessionsToGlobal(userId, profile.sessionHistory);
        }
      }
      // eslint-disable-next-line no-console
      console.log('Manual sync completed successfully.');
    } catch (err) {
      console.error('Manual sync failed:', err);
      throw err;
    }
  };

  return (
    <ProfileContext.Provider value={{
      profiles,
      activeProfileId,
      activeProfile,
      addProfile,
      deleteProfile,
      setActiveProfileId,
      addMedication,
      removeMedication,
      addSession,
      syncToFirebase,
      updateProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};
