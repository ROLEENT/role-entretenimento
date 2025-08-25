import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CompanionRequest {
  id: string;
  event_id: string;
  user_id: string;
  message?: string;
  companions_needed: number;
  contact_preference: string;
  contact_info?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string;
    username: string;
    avatar_url?: string;
  };
  event?: {
    title: string;
    date_start: string;
    city: string;
  };
}

export interface CompanionResponse {
  id: string;
  companion_request_id: string;
  user_id: string;
  message?: string;
  status: string;
  created_at: string;
  profile?: {
    display_name: string;
    username: string;
    avatar_url?: string;
  };
}

export const useEventCompanions = () => {
  const [companionRequests, setCompanionRequests] = useState<CompanionRequest[]>([]);
  const [userRequests, setUserRequests] = useState<CompanionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCompanionRequests = async (eventId?: string, city?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('event_companions')
        .select(`
          *,
          profiles:user_id (
            display_name,
            username,
            avatar_url
          ),
          events:event_id (
            title,
            date_start,
            city
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data?.map(request => ({
        ...request,
        profile: request.profiles,
        event: request.events
      })) || [];

      if (city) {
        filteredData = filteredData.filter(req => req.event?.city === city);
      }

      setCompanionRequests(filteredData);
    } catch (error) {
      console.error('Erro ao buscar pedidos de companhia:', error);
      toast.error('Erro ao carregar pedidos de companhia');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_companions')
        .select(`
          *,
          events:event_id (
            title,
            date_start,
            city
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const requestsWithEvent = data?.map(request => ({
        ...request,
        event: request.events
      })) || [];

      setUserRequests(requestsWithEvent);
    } catch (error) {
      console.error('Erro ao buscar seus pedidos:', error);
      toast.error('Erro ao carregar seus pedidos');
    } finally {
      setLoading(false);
    }
  };

  const createCompanionRequest = async (requestData: {
    event_id: string;
    message?: string;
    companions_needed: number;
    contact_preference: string;
    contact_info?: string;
  }) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um pedido');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('event_companions')
        .insert({
          ...requestData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Pedido de companhia criado!');
      await fetchCompanionRequests();
      await fetchUserRequests();
      return data;
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      if (error.code === '23505') {
        toast.error('Você já tem um pedido para este evento');
      } else {
        toast.error('Erro ao criar pedido de companhia');
      }
      return null;
    }
  };

  const updateCompanionRequest = async (requestId: string, updates: {
    message?: string;
    companions_needed?: number;
    contact_preference?: string;
    contact_info?: string;
    is_active?: boolean;
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('event_companions')
        .update(updates)
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Pedido atualizado!');
      await fetchCompanionRequests();
      await fetchUserRequests();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      toast.error('Erro ao atualizar pedido');
      return false;
    }
  };

  const deleteCompanionRequest = async (requestId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('event_companions')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Pedido removido!');
      await fetchCompanionRequests();
      await fetchUserRequests();
      return true;
    } catch (error) {
      console.error('Erro ao remover pedido:', error);
      toast.error('Erro ao remover pedido');
      return false;
    }
  };

  const respondToRequest = async (requestId: string, message?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para responder');
      return false;
    }

    try {
      const { error } = await supabase
        .from('companion_responses')
        .insert({
          companion_request_id: requestId,
          user_id: user.id,
          message,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Resposta enviada!');
      return true;
    } catch (error: any) {
      console.error('Erro ao responder:', error);
      if (error.code === '23505') {
        toast.error('Você já respondeu a este pedido');
      } else {
        toast.error('Erro ao enviar resposta');
      }
      return false;
    }
  };

  const fetchRequestResponses = async (requestId: string): Promise<CompanionResponse[]> => {
    try {
      const { data, error } = await supabase
        .from('companion_responses')
        .select(`
          *,
          profiles:user_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('companion_request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(response => ({
        ...response,
        profile: response.profiles
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchCompanionRequests();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserRequests();
    }
  }, [user]);

  return {
    companionRequests,
    userRequests,
    loading,
    fetchCompanionRequests,
    fetchUserRequests,
    createCompanionRequest,
    updateCompanionRequest,
    deleteCompanionRequest,
    respondToRequest,
    fetchRequestResponses
  };
};