import React from 'react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';

interface PageShellProps {
  children: React.ReactNode;
  /** Pass false to hide the global header (e.g. splash) */
  showHeader?: boolean;
  showFooter?: boolean;
  footerDisclaimer?: string;
  /** Override default AppHeader */
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  mainClassName?: string;
}

const PageShell = ({
  children,
  showHeader = true,
  showFooter = true,
  footerDisclaimer,
  header,
  footer,
  className,
  mainClassName,
}: PageShellProps) => {
  return (
    <div className={cn('device-app-shell min-h-screen flex flex-col', className)}>
      {showHeader && (header ?? <AppHeader />)}
      <main className={cn('flex-grow page-container', mainClassName)}>
        {children}
      </main>
      {showFooter && (footer ?? <AppFooter disclaimer={footerDisclaimer} />)}
    </div>
  );
};

export default PageShell;
