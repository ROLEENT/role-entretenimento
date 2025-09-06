import React from 'react';
import { EventSocialActions } from '@/components/events/EventSocialActions';

interface EventSocialButtonsProps {
  eventId: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export const EventSocialButtons: React.FC<EventSocialButtonsProps> = ({
  eventId,
  className,
  variant = 'default'
}) => {

  return (
    <EventSocialActions 
      eventId={eventId} 
      className={className}
      compact={variant === 'compact'}
    />
  );
};