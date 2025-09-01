import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ProfileType = 'artist' | 'venue' | 'organizer';
export type ProfileRole = 'owner' | 'editor' | 'viewer';

export interface Profile {
  id: string;
  handle: string;
  name: string;
  type: ProfileType;
  bio?: string;
  location?: string;
  avatar_url?: string;
  cover_url?: string;
  website?: string;
  instagram?: string;
  email?: string;
  phone?: string;
  visibility: 'public' | 'private' | 'draft';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  handle: string;
  name: string;
  type: ProfileType;
  bio?: string;
  location?: string;
  website?: string;
  instagram?: string;
  email?: string;
  phone?: string;
  visibility?: 'public' | 'private' | 'draft';
  metadata?: Record<string, any>;
}

export const useProfiles = () => {
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();

  const createProfile = useCallback(async (data: CreateProfileData): Promise<Profile | null> => {
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          ...data,
          visibility: data.visibility || 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Perfil criado",
        description: `Perfil ${profile.name} criado com sucesso!`
      });

      return profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Erro ao criar perfil",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateProfile = useCallback(async (id: string, data: Partial<CreateProfileData>): Promise<Profile | null> => {
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: `Perfil ${profile.name} atualizado com sucesso!`
      });

      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getProfile = useCallback(async (id: string): Promise<Profile | null> => {
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProfileByHandle = useCallback(async (handle: string): Promise<Profile | null> => {
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', handle)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error fetching profile by handle:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const listProfiles = useCallback(async (type?: ProfileType): Promise<Profile[]> => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data: profiles, error } = await query;

      if (error) throw error;
      setProfiles(profiles || []);
      return profiles || [];
    } catch (error) {
      console.error('Error listing profiles:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProfile = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Perfil deletado",
        description: "Perfil deletado com sucesso!"
      });

      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Erro ao deletar perfil",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    profiles,
    createProfile,
    updateProfile,
    getProfile,
    getProfileByHandle,
    listProfiles,
    deleteProfile
  };
};