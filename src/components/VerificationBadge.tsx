import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Verified, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  verified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verified = false,
  size = 'md',
  showText = false,
  className
}) => {
  if (!verified) return null;

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  const badgeSize = {
    sm: 'h-5 text-xs',
    md: 'h-6 text-sm',
    lg: 'h-7 text-base'
  }[size];

  if (showText) {
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          'bg-primary/10 text-primary border-primary/20 flex items-center gap-1',
          badgeSize,
          className
        )}
      >
        <Verified className={iconSize} />
        Verificado
      </Badge>
    );
  }

  return (
    <div className={cn(
      'inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground',
      {
        'w-4 h-4': size === 'sm',
        'w-5 h-5': size === 'md',
        'w-6 h-6': size === 'lg'
      },
      className
    )}>
      <Verified className={cn(iconSize, 'fill-current')} />
    </div>
  );
};