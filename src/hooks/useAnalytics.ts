import { useEffect, useCallback } from 'react';
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrackEventParams {
  eventName: string;
  city?: string;
  referrer?: string;
  source?: string;
  pageUrl?: string;
  eventData?: Record<string, any>;
}

export const useAnalytics = () => {
  // Generate session ID
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Main tracking function
  const trackEvent = useCallback(async ({
    eventName,
    city,
    referrer,
    source = 'web',
    pageUrl,
    eventData = {}
  }: TrackEventParams) => {
    try {
      const sessionId = getSessionId();
      
      // Enhanced event data
      const enhancedEventData = {
        ...eventData,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase.rpc('track_analytics_event', {
        p_event_name: eventName,
        p_city: city || null,
        p_referrer: referrer || null,
        p_source: source,
        p_page_url: pageUrl || window.location.pathname,
        p_event_data: enhancedEventData,
        p_session_id: sessionId
      });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [getSessionId]);

  // Track page view automatically
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await trackEvent({
          eventName: 'pageview',
          pageUrl: window.location.pathname,
          referrer: document.referrer || undefined,
          source: 'web'
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [trackEvent]);


  // Convenience methods for common events
  const trackClick = useCallback((elementName: string, city?: string, additionalData?: Record<string, any>) => {
    trackEvent({
      eventName: 'click',
      city,
      source: 'web',
      eventData: {
        element: elementName,
        ...additionalData
      }
    });
  }, [trackEvent]);

  const trackConversion = useCallback((conversionType: string, value?: number, city?: string) => {
    trackEvent({
      eventName: 'conversion',
      city,
      source: 'web',
      eventData: {
        conversion_type: conversionType,
        value: value || 1
      }
    });
  }, [trackEvent]);

  const trackCTAClick = useCallback((ctaName: string, city?: string, url?: string) => {
    trackEvent({
      eventName: 'cta_click',
      city,
      source: 'web',
      eventData: {
        cta_name: ctaName,
        target_url: url
      }
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string, city?: string) => {
    trackEvent({
      eventName: 'form_submit',
      city,
      source: 'web',
      eventData: {
        form_name: formName
      }
    });
  }, [trackEvent]);

  const trackDownload = useCallback((fileName: string, fileType: string, city?: string) => {
    trackEvent({
      eventName: 'download',
      city,
      source: 'web',
      eventData: {
        file_name: fileName,
        file_type: fileType
      }
    });
  }, [trackEvent]);

  // Enhanced tracking methods
  const trackEventSaved = useCallback((eventId?: string, eventTitle?: string, city?: string) => {
    trackEvent({ 
      eventName: 'event_save', 
      city, 
      eventData: { event_id: eventId, event_title: eventTitle } 
    });
  }, [trackEvent]);

  const trackArtistFollowed = useCallback((artistId?: string, artistName?: string, city?: string) => {
    trackEvent({
      eventName: 'artist_follow',
      city,
      eventData: { artist_id: artistId, artist_name: artistName }
    });
  }, [trackEvent]);

  const trackAlertActivated = useCallback((type?: string, targetId?: string, targetName?: string, city?: string) => {
    trackEvent({
      eventName: 'alert_activated',
      city,
      eventData: { alert_type: type, target_id: targetId, target_name: targetName }
    });
  }, [trackEvent]);

  const trackContentShare = useCallback((contentType?: string, contentId?: string, platform?: string, city?: string) => {
    trackEvent({
      eventName: 'content_share',
      city,
      eventData: { content_type: contentType, content_id: contentId, platform }
    });
  }, [trackEvent]);

  const trackTicketClick = useCallback((platform?: string, eventId?: string, city?: string) => {
    trackEvent({
      eventName: 'ticket_click',
      city,
      eventData: { platform, event_id: eventId }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackClick,
    trackConversion,
    trackCTAClick,
    trackFormSubmit,
    trackDownload,
    trackEventSaved,
    trackArtistFollowed,
    trackAlertActivated,
    trackContentShare,
    trackTicketClick
  };
};

export default useAnalytics;