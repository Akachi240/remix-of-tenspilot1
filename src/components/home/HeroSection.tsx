
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="py-8 md:py-24 hero-bg">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <span className="hero-badge">
            ⚡ Clinical-Grade TENS Companion
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl app-name" style={{ lineHeight: '1.1', color: 'var(--ink)' }}>
              Your Intelligent <span style={{ color: 'var(--accent-hex)' }}>TENS Therapy</span> Companion
            </h1>
            <p className="mx-auto max-w-3xl md:text-xl" style={{ color: 'var(--ink-muted)' }}>
              Evidence-based session configuration. Real-time therapy guidance. Track your recovery journey.
            </p>
          </div>
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>Your TENS Therapy Companion</p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button asChild size="lg" className="btn-primary w-full sm:w-auto">
              <Link to="/session-setup">Start a Session →</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-outline-ice w-full sm:w-auto">
              <Link to="/education">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
