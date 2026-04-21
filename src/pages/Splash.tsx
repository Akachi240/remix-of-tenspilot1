import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Splash = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      {/* Logo */}
      <div className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 flex items-center justify-center mb-4 shadow-sm">
        <Zap className="h-7 w-7" style={{ color: 'var(--accent-dark)' }} />
      </div>

      {/* Brand */}
      <p className="text-lg font-medium mb-8" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
        TensPilot<sup>+</sup>
      </p>

      {/* Headline */}
      <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        Relief,<br />
        <em style={{ color: 'var(--accent-hex)' }}>made</em><br />
        for you
      </h1>

      {/* Subtitle */}
      <p className="text-base md:text-lg mb-10 max-w-sm" style={{ color: 'var(--ink-muted)' }}>
        Personalized TENS therapy<br />guided by your body.
      </p>

      {/* CTA */}
      <Link
        to="/home"
        className="inline-block px-12 py-4 rounded-full text-sm font-semibold uppercase tracking-widest transition-all hover:opacity-90"
        style={{ background: 'var(--ink)', color: '#ffffff' }}
      >
        Get Started
      </Link>

      {/* Disclaimer */}
      <div className="mt-12 max-w-md space-y-2">
        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
          Medical disclaimer — TensPilot+ is for wellness support only and does not replace professional medical advice or treatment. Consult a healthcare provider before starting any new therapy.
        </p>
        <p className="text-xs" style={{ color: 'var(--ink-subtle)' }}>
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Splash;
