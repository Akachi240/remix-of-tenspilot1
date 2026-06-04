import React from 'react';
import { Zap } from 'lucide-react';

interface AppFooterProps {
  disclaimer?: string;
  className?: string;
}

const AppFooter = ({
  disclaimer = 'This application is for informational purposes only and does not replace professional medical advice.',
  className = '',
}: AppFooterProps) => {
  return (
    <footer
      className={`device-footer border-t mt-auto ${className}`}
      role="contentinfo"
    >
      <div className="container mx-auto px-4 md:px-6 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="device-icon-chip h-8 w-8">
              <Zap className="h-4 w-4" aria-hidden />
            </div>
            <span className="text-sm font-semibold app-name">TensPilot+</span>
          </div>
          <p className="text-xs md:text-sm max-w-xl text-[var(--ink-muted)] leading-relaxed">
            {disclaimer}
          </p>
          <p className="text-xs text-[var(--ink-subtle)]">
            © {new Date().getFullYear()} TensPilot+
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
