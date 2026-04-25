import React, { useState, useRef, useEffect } from 'react';
import { Zap, Home, MoreVertical, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { to: '/home',          label: 'Home' },
  { to: '/session-setup', label: 'Setup Session' },
  { to: '/active-session',label: 'Active Therapy' },
  { to: '/education',     label: 'Education' },
  { to: '/dashboard',     label: 'Dashboard' },
  { to: '/settings',      label: 'Settings' },
];

const AppHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <header className="border-b relative z-50">
      <div className="container mx-auto py-3 sm:py-4 px-4 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2">
          <Zap className="h-5 w-5 sm:h-6 sm:w-6 logo-icon" />
          <span className="text-base sm:text-xl app-name">TensPilot+</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to} className="text-sm transition-colors hover:opacity-70"
              style={{ color: location.pathname === link.to ? 'var(--accent-dark)' : 'var(--ink-muted)', fontWeight: location.pathname === link.to ? 600 : 400 }}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <Button asChild variant="ghost" size="icon">
            <Link to="/home"><Home className="h-5 w-5" /></Link>
          </Button>
          <div ref={menuRef} className="relative">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(prev => !prev)}>
              {menuOpen ? <X className="h-5 w-5" /> : <MoreVertical className="h-5 w-5" />}
            </Button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 rounded-2xl shadow-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0,0,0,0.08)' }}>
                {NAV_LINKS.map((link, i) => (
                  <Link key={link.to} to={link.to}
                    className="flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-blue-50"
                    style={{ color: location.pathname === link.to ? 'var(--accent-dark)' : 'var(--ink)', borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : undefined }}>
                    {location.pathname === link.to && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0" />}
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;