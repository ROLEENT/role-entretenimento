import { useState, useEffect } from 'react';
import { telemetry } from '@/lib/telemetry';

export interface V5AnalyticsData {
  v4Clicks: number;
  v5Clicks: number;
  v5Sessions: number;
  v4Sessions: number;
  formCompletions: { v4: number; v5: number };
  abandonment: { v4: number; v5: number };
  userFeedback: Array<{
    version: 'v4' | 'v5';
    rating: number;
    comment?: string;
    timestamp: Date;
  }>;
}

export const useV5Analytics = () => {
  const [analytics, setAnalytics] = useState<V5AnalyticsData>({
    v4Clicks: 0,
    v5Clicks: 0,
    v5Sessions: 0,
    v4Sessions: 0,
    formCompletions: { v4: 0, v5: 0 },
    abandonment: { v4: 0, v5: 0 },
    userFeedback: []
  });

  useEffect(() => {
    // Load analytics from localStorage
    const stored = localStorage.getItem('v5-analytics');
    if (stored) {
      setAnalytics(JSON.parse(stored));
    }
  }, []);

  const updateAnalytics = (data: Partial<V5AnalyticsData>) => {
    const updated = { ...analytics, ...data };
    setAnalytics(updated);
    localStorage.setItem('v5-analytics', JSON.stringify(updated));
  };

  const trackEditClick = (version: 'v4' | 'v5', entityType: string) => {
    telemetry.track('admin_edit_click', {
      version,
      entity_type: entityType,
      timestamp: new Date().toISOString()
    });

    if (version === 'v4') {
      updateAnalytics({ v4Clicks: analytics.v4Clicks + 1 });
    } else {
      updateAnalytics({ v5Clicks: analytics.v5Clicks + 1 });
    }
  };

  const trackFormStart = (version: 'v4' | 'v5', entityType: string) => {
    telemetry.track('admin_form_start', {
      version,
      entity_type: entityType,
      timestamp: new Date().toISOString()
    });

    if (version === 'v4') {
      updateAnalytics({ v4Sessions: analytics.v4Sessions + 1 });
    } else {
      updateAnalytics({ v5Sessions: analytics.v5Sessions + 1 });
    }
  };

  const trackFormComplete = (version: 'v4' | 'v5', entityType: string) => {
    telemetry.track('admin_form_complete', {
      version,
      entity_type: entityType,
      timestamp: new Date().toISOString()
    });

    const completions = { ...analytics.formCompletions };
    completions[version]++;
    updateAnalytics({ formCompletions: completions });
  };

  const trackFormAbandon = (version: 'v4' | 'v5', entityType: string) => {
    telemetry.track('admin_form_abandon', {
      version,
      entity_type: entityType,
      timestamp: new Date().toISOString()
    });

    const abandonment = { ...analytics.abandonment };
    abandonment[version]++;
    updateAnalytics({ abandonment });
  };

  const addUserFeedback = (feedback: {
    version: 'v4' | 'v5';
    rating: number;
    comment?: string;
  }) => {
    telemetry.track('admin_version_feedback', {
      ...feedback,
      timestamp: new Date().toISOString()
    });

    const newFeedback = {
      ...feedback,
      timestamp: new Date()
    };

    updateAnalytics({
      userFeedback: [...analytics.userFeedback, newFeedback]
    });
  };

  const getAdoptionRate = () => {
    const totalClicks = analytics.v4Clicks + analytics.v5Clicks;
    if (totalClicks === 0) return 0;
    return Math.round((analytics.v5Clicks / totalClicks) * 100);
  };

  const getCompletionRate = (version: 'v4' | 'v5') => {
    const sessions = version === 'v4' ? analytics.v4Sessions : analytics.v5Sessions;
    const completions = analytics.formCompletions[version];
    if (sessions === 0) return 0;
    return Math.round((completions / sessions) * 100);
  };

  const getAverageRating = (version: 'v4' | 'v5') => {
    const feedback = analytics.userFeedback.filter(f => f.version === version);
    if (feedback.length === 0) return 0;
    const total = feedback.reduce((sum, f) => sum + f.rating, 0);
    return Math.round((total / feedback.length) * 10) / 10;
  };

  return {
    analytics,
    trackEditClick,
    trackFormStart,
    trackFormComplete,
    trackFormAbandon,
    addUserFeedback,
    getAdoptionRate,
    getCompletionRate,
    getAverageRating
  };
};