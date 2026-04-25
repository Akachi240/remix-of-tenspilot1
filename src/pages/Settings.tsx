import { useContext, useEffect, useState } from 'react';
import { ProfilesContext } from '../contexts/ProfilesContext';

const Settings = () => {
    const { profiles, error } = useContext(ProfilesContext);
    const [selectedProfile, setSelectedProfile] = useState(profiles[0]);

    if (error) {
        return <div>Error loading profiles</div>;
    }

    return (
        <div>
            <h1>Settings</h1>
            <select
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
            >
                {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>{profile.name}</option>
                ))}
            </select>
        </div>
    );
};

export default Settings;