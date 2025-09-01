import React from 'react';
import { CompletionBadge } from '@/components/ui/progress-indicator';
import { useVenueCompletionStatus, useEventCompletionStatus } from '@/hooks/useCompletionStatus';
import { VenueFlexibleFormData } from '@/schemas/venue-flexible';
import { EventFlexibleForm } from '@/schemas/event-flexible';

interface VenueCompletionBadgeProps {
  venue: Partial<VenueFlexibleFormData>;
  className?: string;
}

export const VenueCompletionBadge: React.FC<VenueCompletionBadgeProps> = ({ 
  venue, 
  className 
}) => {
  const completion = useVenueCompletionStatus(venue);
  return <CompletionBadge completion={completion} className={className} />;
};

interface EventCompletionBadgeProps {
  event: Partial<EventFlexibleForm>;
  className?: string;
}

export const EventCompletionBadge: React.FC<EventCompletionBadgeProps> = ({ 
  event, 
  className 
}) => {
  const completion = useEventCompletionStatus(event);
  return <CompletionBadge completion={completion} className={className} />;
};