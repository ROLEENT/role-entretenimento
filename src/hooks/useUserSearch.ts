import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserSearchResult {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  followers_count: number;
  is_verified: boolean;
}

export const useUserSearch = () => {
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('search_users_by_username', { search_term: searchTerm });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('validate_username', { new_username: username });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao validar username:', error);
      return false;
    }
  };

  return {
    results,
    loading,
    searchUsers,
    validateUsername
  };
};