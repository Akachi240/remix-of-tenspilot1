import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

const PageHeader = ({
  title,
  description,
  badge,
  align = 'center',
  className,
}: PageHeaderProps) => {
  return (
    <header
      className={cn(
        'mb-8 md:mb-10 animate-in',
        align === 'center' ? 'text-center' : 'text-left',
        className
      )}
    >
      {badge && (
        <div className={cn('mb-3', align === 'center' && 'flex justify-center')}>
          {badge}
        </div>
      )}
      <h1 className="page-title">{title}</h1>
      {description && (
        <p className="page-subtitle mt-2 max-w-2xl mx-auto">{description}</p>
      )}
    </header>
  );
};

export default PageHeader;
