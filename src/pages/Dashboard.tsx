
import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import UserDashboard from '@/components/dashboard/UserDashboard';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-grow py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-medical-900">Your TENS Therapy Dashboard</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Track your sessions, view pain relief trends, and monitor your progress over time.
            </p>
          </div>
          
          <UserDashboard />
        </div>
      </main>
      
      <footer className="border-t py-4 bg-gray-50">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Your session data is stored locally on your device and is not transmitted or saved elsewhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
