import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Ticket, CheckCircle } from 'lucide-react';
import { useEngagement, EngagementType } from '@/hooks/useEngagement';
import { cn } from '@/lib/utils';

interface EngagementSystemProps {
  entityId: string;
  entityType: 'event' | 'highlight';
  showCounts?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
}

export const EngagementSystem: React.FC<EngagementSystemProps> = ({
  entityId,
  entityType,
  showCounts = true,
  size = 'md',
  variant = 'default',
}) => {
  const {
    interestCount,
    ticketCount,
    attendCount,
    userEngagements,
    loading,
    toggleEngagement,
  } = useEngagement(entityId, entityType);

  const engagementButtons = [
    {
      type: 'interest' as EngagementType,
      icon: Eye,
      label: 'Tenho Interesse',
      count: interestCount,
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20',
      activeColor: 'bg-primary text-primary-foreground',
    },
    {
      type: 'bought_ticket' as EngagementType,
      icon: Ticket,
      label: 'Comprei Ingresso',
      count: ticketCount,
      color: 'text-accent',
      bgColor: 'bg-accent/10 hover:bg-accent/20',
      activeColor: 'bg-accent text-accent-foreground',
    },
    {
      type: 'will_attend' as EngagementType,
      icon: CheckCircle,
      label: 'Vou Comparecer',
      count: attendCount,
      color: 'text-secondary-foreground',
      bgColor: 'bg-secondary hover:bg-secondary/80',
      activeColor: 'bg-secondary-foreground text-secondary',
    },
  ];

  const buttonSizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (loading) {
    return (
      <div className="flex gap-2">
        {engagementButtons.map((button) => (
          <div
            key={button.type}
            className={cn(
              'animate-pulse bg-muted rounded-md',
              buttonSizes[size]
            )}
          >
            <div className="w-20 h-4 bg-muted-foreground/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex gap-1">
        {engagementButtons.map((button) => {
          const Icon = button.icon;
          const isActive = userEngagements.includes(button.type);
          
          return (
            <Button
              key={button.type}
              variant="ghost"
              size="sm"
              onClick={() => toggleEngagement(button.type)}
              className={cn(
                'flex items-center gap-1',
                isActive ? button.activeColor : `${button.color} ${button.bgColor}`
              )}
            >
              <Icon className={iconSizes.sm} />
              {showCounts && button.count > 0 && (
                <span className="text-xs">{button.count}</span>
              )}
            </Button>
          );
        })}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          Seu Interesse no Evento
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {engagementButtons.map((button) => {
            const Icon = button.icon;
            const isActive = userEngagements.includes(button.type);
            
            return (
              <Button
                key={button.type}
                variant="outline"
                onClick={() => toggleEngagement(button.type)}
                className={cn(
                  'justify-start gap-3 h-auto py-3',
                  isActive && button.activeColor
                )}
              >
                <Icon className={iconSizes.md} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{button.label}</div>
                  {showCounts && (
                    <div className="text-xs text-muted-foreground">
                      {button.count} {button.count === 1 ? 'pessoa' : 'pessoas'}
                    </div>
                  )}
                </div>
                {isActive && (
                  <Badge variant="secondary" className="ml-auto">
                    Ativo
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-wrap gap-2">
      {engagementButtons.map((button) => {
        const Icon = button.icon;
        const isActive = userEngagements.includes(button.type);
        
        return (
          <Button
            key={button.type}
            variant="outline"
            onClick={() => toggleEngagement(button.type)}
            className={cn(
              'flex items-center gap-2',
              buttonSizes[size],
              isActive ? button.activeColor : `${button.color} ${button.bgColor}`
            )}
          >
            <Icon className={iconSizes[size]} />
            <span>{button.label}</span>
            {showCounts && button.count > 0 && (
              <Badge 
                variant="secondary" 
                className={cn(
                  'ml-1',
                  size === 'sm' && 'text-xs px-1'
                )}
              >
                {button.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};