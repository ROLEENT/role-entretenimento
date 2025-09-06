import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city_preferences: string[] | null;
  genre_preferences: string[] | null;
  accessibility_notes: string | null;
  is_profile_public: boolean;
  created_at: string;
}

export interface UserPublicStats {
  saved_events_count: number;
  attendances_count: number;
  following_count: number;
}

export function useUserProfile(username?: string) {
  return useQuery({
    queryKey: ['user-profile', username],
    queryFn: async () => {
      if (!username) return null;

      const { data, error } = await supabase
        .from('users_public')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data as UserProfile;
    },
    enabled: !!username,
  });
}

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users_public')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data as UserProfile;
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<UserProfile>) => {
      const { data, error } = await supabase.rpc('ensure_user_profile', {
        p_username: profile.username,
        p_display_name: profile.display_name,
        p_avatar_url: profile.avatar_url,
        p_bio: profile.bio,
        p_city_preferences: profile.city_preferences,
        p_genre_preferences: profile.genre_preferences,
        p_accessibility_notes: profile.accessibility_notes,
        p_is_profile_public: profile.is_profile_public,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
      toast.success('Perfil atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    },
  });
}

export function useUserStats(userId?: string) {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get saved events count
      const { count: savedCount } = await supabase
        .from('saved_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get attendances count
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get following count
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        saved_events_count: savedCount || 0,
        attendances_count: attendanceCount || 0,
        following_count: followingCount || 0,
      } as UserPublicStats;
    },
    enabled: !!userId,
  });
}

export function useValidateUsername() {
  return useMutation({
    mutationFn: async (username: string) => {
      const { data, error } = await supabase
        .from('users_public')
        .select('id')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return !data; // Return true if username is available
    },
  });
}