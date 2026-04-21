
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  linkTo: string;
  buttonText: string;
  iconBg?: string;
  iconColor?: string;
}

const FeatureCard = ({ title, description, icon: Icon, linkTo, buttonText }: FeatureCardProps) => {
  return (
    <Card className="flex flex-col h-full medical-card animate-in">
      <CardHeader className="p-4 sm:p-6">
        <div className="mb-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full icon-surface flex items-center justify-center">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'var(--accent-dark)' }} />
        </div>
        <CardTitle className="text-base sm:text-lg font-semibold" style={{ color: 'var(--ink)' }}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0 sm:p-6 sm:pt-0">
        <p className="text-sm hidden sm:block" style={{ color: 'var(--ink-muted)' }}>{description}</p>
        <Link to={linkTo} className="text-sm font-medium flex items-center gap-1 mt-2 hover:gap-2 transition-all" style={{ color: 'var(--accent-hex)' }}>
          Open → <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0 sm:p-6 sm:pt-0">
        <Button asChild className="w-full btn-primary text-sm">
          <Link to={linkTo}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureCard;
