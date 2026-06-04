
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeatureCard from '@/components/home/FeatureCard';
import AppHeader from '@/components/layout/AppHeader';
import { Zap, Activity, BookOpen, BarChart3, Play, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-grow">
        {/* ── MOBILE-ONLY Hero ── */}
        <section className="flex sm:hidden flex-col items-center justify-center text-center px-6" style={{ minHeight: '100vh' }}>
          <h1 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '38px', lineHeight: '1.1', color: 'var(--ink)' }}>
            Pain relief,<br />guided by science
          </h1>
          <Link
            to="/session-setup"
            className="inline-block px-8 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent-dark)', borderRadius: '12px' }}
          >
            Start a Session
          </Link>
        </section>

        {/* ── MOBILE-ONLY How It Works ── */}
        <section className="flex sm:hidden flex-col gap-5 py-6 px-6">
          <h2 className="font-semibold text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            How it works
          </h2>
          {[
            { num: 1, title: 'Setup', desc: 'Configure pain type, placement & parameters' },
            { num: 2, title: 'Run', desc: 'Run your session with live timer controls' },
            { num: 3, title: 'Learn', desc: 'Understand the science behind TENS therapy' },
            { num: 4, title: 'Track', desc: 'Monitor pain reduction over time' },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                style={{ background: 'var(--accent-dark)' }}
              >
                {step.num}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{step.title}</p>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── DESKTOP Hero ── */}
        <div className="hidden sm:block">
          <HeroSection />
        </div>
        
        {/* ── DESKTOP Feature Grid ── */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                Your Complete TENS Therapy Toolkit
              </h2>
              <p className="mt-4 text-lg max-w-3xl mx-auto" style={{ color: 'var(--ink-muted)' }}>
                From session setup to progress tracking — everything you need for effective electrotherapy pain management.
              </p>
            </div>
            
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              <FeatureCard 
                title="Setup Session"
                description="Configure your personalised TENS parameters step by step"
                icon={Zap}
                linkTo="/session-setup"
                buttonText="Start Setup"
              />
              
              <FeatureCard 
                title="Active Therapy"
                description="Run your session with real-time guidance and timer"
                icon={Activity}
                linkTo="/active-session"
                buttonText="Start Session"
              />
              
              <FeatureCard 
                title="Education Guide"
                description="Learn the science behind TENS therapy and safe usage"
                icon={BookOpen}
                linkTo="/education"
                buttonText="Learn More"
              />
              
              <FeatureCard 
                title="My Dashboard"
                description="Track your progress and export clinical session reports"
                icon={BarChart3}
                linkTo="/dashboard"
                buttonText="View Dashboard"
              />
            </div>
          </div>
        </section>

        {/* Desktop How TENS Works section */}
        <section className="hidden md:block py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2 space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                  How TENS Therapy Works
                </h2>
                <p style={{ color: 'var(--ink-muted)' }}>
                  TENS (Transcutaneous Electrical Nerve Stimulation) delivers low-voltage electrical impulses to block pain signals and promote natural endorphin release.
                </p>
                <ul className="space-y-2">
                  {[
                    'Configure pain type and electrode placement',
                    'Set intensity, frequency, and pulse duration',
                    'Run timed sessions with real-time controls',
                    'Track pain reduction across sessions',
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-dark)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span style={{ color: 'var(--ink)' }}>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="md:w-1/2 medical-card p-6">
                <div className="space-y-4">
                  {[
                    { icon: Zap, title: 'Setup', desc: 'Configure pain type, placement & parameters' },
                    { icon: Play, title: 'Therapy', desc: 'Run your session with live timer controls' },
                    { icon: BookOpen, title: 'Learn', desc: 'Understand the science behind TENS therapy' },
                    { icon: LayoutDashboard, title: 'Track', desc: 'Monitor pain reduction over time' },
                  ].map((step, i, arr) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full icon-surface flex items-center justify-center">
                          <step.icon className="h-5 w-5" style={{ color: 'var(--accent-dark)' }} />
                        </div>
                        <div>
                          <h3 className="font-medium" style={{ color: 'var(--ink)' }}>{step.title}</h3>
                          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>{step.desc}</p>
                        </div>
                      </div>
                      {i < arr.length - 1 && <div className="w-0.5 h-6 ml-5" style={{ background: 'var(--ink-subtle)' }}></div>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" style={{ color: 'var(--accent-dark)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>TensPilot+</span>
            </div>
            
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              This application is for informational purposes only and does not replace professional medical advice.
            </p>
            
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              © {new Date().getFullYear()} TensPilot+. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
