
import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import EducationGuide from '@/components/education/EducationGuide';

const Education = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-grow py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-medical-900">TENS Education Guide</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Understand the science behind TENS therapy, proper electrode placement, and best practices for pain management.
            </p>
          </div>
          
          <EducationGuide />
        </div>
      </main>
      
      <footer className="border-t py-4 bg-gray-50">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Educational content is for informational purposes only. Always consult qualified healthcare professionals.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Education;
