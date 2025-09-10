import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Ticket, CheckCircle } from 'lucide-react';
import { useEngagement, EngagementType } from '@/hooks/useEngagement';
import { LikeSystem } from './events/LikeSystem';
import { cn } from '@/lib/utils';

interface CompactEngagementSystemProps {
  entityId: string;
  entityType: 'event' | 'highlight';
  showCounts?: boolean;
}

export const CompactEngagementSystem: React.FC<CompactEngagementSystemProps> = ({
  entityId,
  entityType,
  showCounts = true,
}) => {
  const {
    interestCount,
    ticketCount,
    attendCount,
    userEngagements,
    loading,
    toggleEngagement,
  } = useEngagement(entityId, entityType);

  const buttons = [
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
  ];

  const attendButton = {
    type: 'will_attend' as EngagementType,
    icon: CheckCircle,
    label: 'Vou Comparecer',
    count: attendCount,
    color: 'text-secondary-foreground',
    bgColor: 'bg-secondary hover:bg-secondary/80',
    activeColor: 'bg-secondary-foreground text-secondary',
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {buttons.map((button) => (
            <div
              key={button.type}
              className="animate-pulse bg-muted rounded-md px-2 py-1"
            >
              <div className="w-20 h-4 bg-muted-foreground/20 rounded"></div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="animate-pulse bg-muted rounded-md px-2 py-1 flex-1">
            <div className="w-20 h-4 bg-muted-foreground/20 rounded"></div>
          </div>
          <div className="animate-pulse bg-muted rounded-md px-2 py-1 flex-1">
            <div className="w-16 h-4 bg-muted-foreground/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* First row: Interest and Ticket */}
      <div className="grid grid-cols-2 gap-2">
        {buttons.map((button) => {
          const Icon = button.icon;
          const isActive = userEngagements.includes(button.type);
          
          return (
            <Button
              key={button.type}
              variant="ghost"
              size="sm"
              onClick={() => toggleEngagement(button.type)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-xs',
                isActive ? button.activeColor : `${button.color} ${button.bgColor}`
              )}
            >
              <Icon className="w-3 h-3" />
              <span className="truncate">{button.label}</span>
              {showCounts && button.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 text-xs px-1 py-0 h-4 min-w-[16px] flex items-center justify-center"
                >
                  {button.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      
      {/* Second row: Attend and Like side by side */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleEngagement(attendButton.type)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 text-xs flex-1',
            userEngagements.includes(attendButton.type) 
              ? attendButton.activeColor 
              : `${attendButton.color} ${attendButton.bgColor}`
          )}
        >
          <CheckCircle className="w-3 h-3" />
          <span className="truncate">{attendButton.label}</span>
          {showCounts && attendButton.count > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-1 text-xs px-1 py-0 h-4 min-w-[16px] flex items-center justify-center"
            >
              {attendButton.count}
            </Badge>
          )}
        </Button>
        
        <div className="flex-1">
          <LikeSystem 
            entityId={entityId}
            entityType={entityType}
            showCount={true}
          />
        </div>
      </div>
    </div>
  );
};