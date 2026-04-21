
import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import SessionSetupForm from '@/components/session/SessionSetupForm';

const SessionSetup = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-grow py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-medical-900">TensPilot+ Session Setup</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Configure your pain type, electrode placement, and device parameters to start a personalized TENS therapy session.
            </p>
          </div>
          
          <SessionSetupForm />
        </div>
      </main>
      
      <footer className="border-t py-4 bg-gray-50">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            TENS therapy should be used under appropriate medical guidance. These settings are general guidelines only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SessionSetup;
