
import React from 'react';
import { Zap, Home, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AppHeader = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto py-3 sm:py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 sm:h-6 sm:w-6 logo-icon" />
          <span className="text-base sm:text-xl app-name">TensPilot+</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/home" className="text-sm transition-colors hover:opacity-70" style={{ color: 'var(--ink-muted)' }}>
            Home
          </Link>
          <Link to="/session-setup" className="text-sm transition-colors hover:opacity-70" style={{ color: 'var(--ink-muted)' }}>
            Setup Session
          </Link>
          <Link to="/active-session" className="text-sm transition-colors hover:opacity-70" style={{ color: 'var(--ink-muted)' }}>
            Active Therapy
          </Link>
          <Link to="/education" className="text-sm transition-colors hover:opacity-70" style={{ color: 'var(--ink-muted)' }}>
            Education
          </Link>
          <Link to="/dashboard" className="text-sm transition-colors hover:opacity-70" style={{ color: 'var(--ink-muted)' }}>
            Dashboard
          </Link>
          <Link to="/settings" className="text-sm transition-colors hover:opacity-70" style={{ color: 'var(--ink-muted)' }}>
            <Settings className="h-5 w-5" />
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link to="/home">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
