import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  city?: string;
  preferences?: Record<string, any>;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  confirmed_at?: string;
  unsubscribed_at?: string;
  created_at: string;
}

export interface NewsletterStats {
  total_subscribers: number;
  confirmed_subscribers: number;
  pending_subscribers: number;
  unsubscribed_subscribers: number;
  growth_rate: number;
}

export const useNewsletterManagement = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  
  const { toast } = useToast();

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`);
      }
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      if (cityFilter) {
        query = query.eq('city', cityFilter);
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await query.range(from, to);
      
      if (error) throw error;
      
      setSubscribers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar assinantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_newsletter_stats');
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching newsletter stats:', error);
    }
  };

  const sendNewsletterCampaign = async (subject: string, content: string, targetSegment?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: { 
          subject, 
          content, 
          target_segment: targetSegment 
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Newsletter enviada com sucesso",
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar newsletter",
        variant: "destructive",
      });
      throw error;
    }
  };

  const exportSubscribers = async (format: 'csv' | 'json' = 'csv') => {
    try {
      setLoading(true);
      
      // Fetch all subscribers for export
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (format === 'csv') {
        const csvContent = [
          'Email,Nome,Cidade,Data de Confirmação',
          ...data.map(sub => 
            `${sub.email},${sub.name || ''},${sub.city || ''},${sub.confirmed_at || ''}`
          )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Sucesso",
        description: "Lista de assinantes exportada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar assinantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [searchQuery, statusFilter, cityFilter, currentPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    subscribers,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    cityFilter,
    setCityFilter,
    currentPage,
    setCurrentPage,
    totalCount,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    sendNewsletterCampaign,
    exportSubscribers,
    refreshSubscribers: fetchSubscribers,
    refreshStats: fetchStats,
  };
};