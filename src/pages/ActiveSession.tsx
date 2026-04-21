
import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import ActiveSessionPanel from '@/components/session/ActiveSessionPanel';

const ActiveSession = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-grow py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-medical-900">Active Therapy Session</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Monitor your current TENS session with a live timer and quick-access controls.
            </p>
          </div>
          
          <ActiveSessionPanel />
        </div>
      </main>
      
      <footer className="border-t py-4 bg-gray-50">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            If you experience any discomfort, use the emergency stop button immediately and consult a healthcare professional.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ActiveSession;
