import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSearchResult } from './useUserSearch';

export const useDiscoverUsers = (selectedCity?: string) => {
  const [suggestedUsers, setSuggestedUsers] = useState<UserSearchResult[]>([]);
  const [popularUsers, setPopularUsers] = useState<UserSearchResult[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          username,
          display_name,
          avatar_url,
          followers_count,
          is_verified
        `)
        .eq('username', 'NOT NULL')
        .neq('username', null)
        .order('followers_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários sugeridos:', error);
      return [];
    }
  };

  const fetchPopularUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          username,
          display_name,
          avatar_url,
          followers_count,
          is_verified
        `)
        .eq('username', 'NOT NULL')
        .neq('username', null)
        .gte('followers_count', 1)
        .order('followers_count', { ascending: false })
        .limit(15);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários populares:', error);
      return [];
    }
  };

  const fetchNearbyUsers = async (city: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          username,
          display_name,
          avatar_url,
          followers_count,
          is_verified,
          location
        `)
        .eq('username', 'NOT NULL')
        .neq('username', null)
        .ilike('location', `%${city}%`)
        .order('followers_count', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários próximos:', error);
      return [];
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [suggested, popular, nearby] = await Promise.all([
        fetchSuggestedUsers(),
        fetchPopularUsers(),
        selectedCity ? fetchNearbyUsers(selectedCity) : Promise.resolve([])
      ]);

      setSuggestedUsers(suggested);
      setPopularUsers(popular);
      setNearbyUsers(nearby);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedCity]);

  return {
    suggestedUsers,
    popularUsers,
    nearbyUsers,
    loading,
    refetch: loadUsers
  };
};