import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import ActiveSessionPanel from '@/components/session/ActiveSessionPanel';

const ActiveSession = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <AppHeader />
      <main className="flex-grow">
        <ActiveSessionPanel />
      </main>
    </div>
  );
};

export default ActiveSession;
