import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationMetric {
  date: string;
  notification_type: string;
  city: string;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  avg_delivery_time_ms: number;
}

export interface HourlyPerformance {
  hour_of_day: number;
  total_sent: number;
  total_opened: number;
  open_rate: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  notificationType?: string;
  city?: string;
}

export const useNotificationAnalytics = () => {
  const [metrics, setMetrics] = useState<NotificationMetric[]>([]);
  const [hourlyPerformance, setHourlyPerformance] = useState<HourlyPerformance[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async (filters: AnalyticsFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('calculate_notification_metrics', {
        p_start_date: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: filters.endDate || new Date().toISOString().split('T')[0],
        p_notification_type: filters.notificationType || null,
        p_city: filters.city || null
      });

      if (error) throw error;
      setMetrics(data || []);
    } catch (err) {
      console.error('Error fetching notification metrics:', err);
      setError('Erro ao carregar métricas de notificação');
    } finally {
      setLoading(false);
    }
  };

  const fetchHourlyPerformance = async () => {
    try {
      const { data, error } = await supabase.rpc('get_notification_performance_by_hour');
      if (error) throw error;
      setHourlyPerformance(data || []);
    } catch (err) {
      console.error('Error fetching hourly performance:', err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const getTopPerformingTypes = () => {
    const typeMetrics = metrics.reduce((acc, metric) => {
      const type = metric.notification_type;
      if (!acc[type]) {
        acc[type] = {
          total_sent: 0,
          total_opened: 0,
          total_clicked: 0,
          total_failed: 0
        };
      }
      acc[type].total_sent += metric.total_sent;
      acc[type].total_opened += metric.total_opened;
      acc[type].total_clicked += metric.total_clicked;
      acc[type].total_failed += metric.total_failed;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(typeMetrics)
      .map(([type, data]) => ({
        type,
        ...data,
        open_rate: data.total_sent > 0 ? (data.total_opened / data.total_sent) * 100 : 0,
        click_rate: data.total_opened > 0 ? (data.total_clicked / data.total_opened) * 100 : 0,
        success_rate: data.total_sent > 0 ? ((data.total_sent - data.total_failed) / data.total_sent) * 100 : 0
      }))
      .sort((a, b) => b.open_rate - a.open_rate);
  };

  const getTopPerformingCities = () => {
    const cityMetrics = metrics.reduce((acc, metric) => {
      const city = metric.city || 'Todas';
      if (!acc[city]) {
        acc[city] = {
          total_sent: 0,
          total_opened: 0,
          total_clicked: 0
        };
      }
      acc[city].total_sent += metric.total_sent;
      acc[city].total_opened += metric.total_opened;
      acc[city].total_clicked += metric.total_clicked;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(cityMetrics)
      .map(([city, data]) => ({
        city,
        ...data,
        open_rate: data.total_sent > 0 ? (data.total_opened / data.total_sent) * 100 : 0,
        click_rate: data.total_opened > 0 ? (data.total_clicked / data.total_opened) * 100 : 0
      }))
      .sort((a, b) => b.open_rate - a.open_rate);
  };

  const getTotalMetrics = () => {
    return metrics.reduce((acc, metric) => {
      acc.total_sent += metric.total_sent;
      acc.total_delivered += metric.total_delivered;
      acc.total_opened += metric.total_opened;
      acc.total_clicked += metric.total_clicked;
      acc.total_failed += metric.total_failed;
      return acc;
    }, {
      total_sent: 0,
      total_delivered: 0,
      total_opened: 0,
      total_clicked: 0,
      total_failed: 0
    });
  };

  const getBestSendingHours = () => {
    return hourlyPerformance
      .filter(hour => hour.total_sent > 0)
      .sort((a, b) => b.open_rate - a.open_rate)
      .slice(0, 5);
  };

  const createCampaign = async (campaignData: any) => {
    try {
      const { data, error } = await supabase
        .from('notification_campaigns')
        .insert(campaignData)
        .select()
        .single();

      if (error) throw error;
      await fetchCampaigns();
      return data;
    } catch (err) {
      console.error('Error creating campaign:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchHourlyPerformance();
    fetchCampaigns();
  }, []);

  return {
    metrics,
    hourlyPerformance,
    campaigns,
    loading,
    error,
    fetchMetrics,
    fetchHourlyPerformance,
    fetchCampaigns,
    getTopPerformingTypes,
    getTopPerformingCities,
    getTotalMetrics,
    getBestSendingHours,
    createCampaign
  };
};