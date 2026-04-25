import React, { createContext, useContext, useEffect, useState } from 'react';

interface Profile {
    id: string;
    name: string;
    medications: string[];
}

interface ProfileContextType {
    profiles: Profile[];
    activeProfileId: string | null;
    activeProfile: Profile | undefined;
    addProfile: (profile: Profile) => void;
    deleteProfile: (id: string) => void;
    setActiveProfileId: (id: string) => void;
    addMedication: (medication: string) => void;
    removeMedication: (medication: string) => void;
    addSession: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC = ({ children }) => {
    const [profiles, setProfiles] = useState<Profile[]>(() => {
        const storedProfiles = localStorage.getItem('profiles');
        return storedProfiles ? JSON.parse(storedProfiles) : [];
    });

    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('profiles', JSON.stringify(profiles));
    }, [profiles]);

    const activeProfile = profiles.find(profile => profile.id === activeProfileId);

    const addProfile = (profile: Profile) => {
        setProfiles([...profiles, profile]);
    };

    const deleteProfile = (id: string) => {
        setProfiles(profiles.filter(profile => profile.id !== id));
    };

    const addMedication = (medication: string) => {
        if (activeProfile) {
            const updatedProfile = { ...activeProfile, medications: [...activeProfile.medications, medication] };
            deleteProfile(activeProfile.id);
            addProfile(updatedProfile);
        }
    };

    const removeMedication = (medication: string) => {
        if (activeProfile) {
            const updatedProfile = { ...activeProfile, medications: activeProfile.medications.filter(m => m !== medication) };
            deleteProfile(activeProfile.id);
            addProfile(updatedProfile);
        }
    };

    const addSession = () => {
        // Logic for adding a session (implementation not shown)
    };

    return (
        <ProfileContext.Provider value={{ profiles, activeProfileId, activeProfile, addProfile, deleteProfile, setActiveProfileId, addMedication, removeMedication, addSession }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};