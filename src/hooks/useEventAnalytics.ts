import { useEffect } from 'react';
import { telemetry } from '@/lib/telemetry';

interface EventAnalyticsConfig {
  eventId: string;
  eventTitle: string;
  eventCity?: string;
  eventDate?: Date;
}

export const useEventAnalytics = ({ eventId, eventTitle, eventCity, eventDate }: EventAnalyticsConfig) => {
  
  useEffect(() => {
    // Track event page view
    telemetry.track('event_page_view', {
      event_id: eventId,
      event_title: eventTitle,
      event_city: eventCity,
      event_date: eventDate?.toISOString(),
      timestamp: new Date().toISOString()
    });
  }, [eventId]);

  const trackTicketClick = (platform: string) => {
    telemetry.track('ticket_click', {
      event_id: eventId,
      event_title: eventTitle,
      platform,
      timestamp: new Date().toISOString()
    });
  };

  const trackEventSave = () => {
    telemetry.track('event_save', {
      event_id: eventId,
      event_title: eventTitle,
      timestamp: new Date().toISOString()
    });
  };

  const trackEventShare = (platform?: string) => {
    telemetry.track('event_share', {
      event_id: eventId,
      event_title: eventTitle,
      platform: platform || 'copy_link',
      timestamp: new Date().toISOString()
    });
  };

  const trackEventLike = () => {
    telemetry.track('event_like', {
      event_id: eventId,
      event_title: eventTitle,
      timestamp: new Date().toISOString()
    });
  };

  const trackEventReaction = (reaction: string) => {
    telemetry.track('event_reaction', {
      event_id: eventId,
      event_title: eventTitle,
      reaction,
      timestamp: new Date().toISOString()
    });
  };

  const trackComment = () => {
    telemetry.track('event_comment', {
      event_id: eventId,
      event_title: eventTitle,
      timestamp: new Date().toISOString()
    });
  };

  const trackProfileClick = (profileType: 'artist' | 'venue' | 'organizer', profileId: string) => {
    telemetry.track('profile_click_from_event', {
      event_id: eventId,
      profile_type: profileType,
      profile_id: profileId,
      timestamp: new Date().toISOString()
    });
  };

  return {
    trackTicketClick,
    trackEventSave,
    trackEventShare,
    trackEventLike,
    trackEventReaction,
    trackComment,
    trackProfileClick
  };
};