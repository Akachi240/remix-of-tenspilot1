import React from 'react';

const Settings = () => {
  // Removed syncing state

  const handleSave = () => {
    // handle saving settings
  };

  return (
    <div>
      <h1>Settings</h1>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default Settings;