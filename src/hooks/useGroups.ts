import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Group {
  id: string;
  name: string;
  description: string;
  city: string;
  category: string;
  image_url?: string;
  is_public: boolean;
  max_members: number;
  current_members_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_member?: boolean;
  user_role?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    display_name: string;
    username: string;
    avatar_url?: string;
  };
}

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchGroups = async (city?: string, category?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(user_id, role)
        `);

      if (city) {
        query = query.eq('city', city);
      }
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      const groupsWithMembership = data?.map(group => ({
        ...group,
        is_member: user ? group.group_members.some((m: any) => m.user_id === user.id) : false,
        user_role: user ? group.group_members.find((m: any) => m.user_id === user.id)?.role : null,
        group_members: undefined // Remove from final object
      })) || [];

      setGroups(groupsWithMembership);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          role,
          groups:group_id (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const userGroupsList = data?.map(item => ({
        ...(item.groups as any),
        user_role: item.role
      } as Group)) || [];

      setUserGroups(userGroupsList);
    } catch (error) {
      console.error('Erro ao buscar grupos do usuário:', error);
      toast.error('Erro ao carregar seus grupos');
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para entrar em um grupo');
      return false;
    }

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast.success('Você entrou no grupo!');
      await fetchGroups();
      await fetchUserGroups();
      return true;
    } catch (error: any) {
      console.error('Erro ao entrar no grupo:', error);
      if (error.code === '23505') {
        toast.error('Você já é membro deste grupo');
      } else {
        toast.error('Erro ao entrar no grupo');
      }
      return false;
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Você saiu do grupo');
      await fetchGroups();
      await fetchUserGroups();
      return true;
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
      toast.error('Erro ao sair do grupo');
      return false;
    }
  };

  const createGroup = async (groupData: {
    name: string;
    description: string;
    city: string;
    category: string;
    image_url?: string;
    is_public?: boolean;
    max_members?: number;
  }) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um grupo');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          created_by: user.id,
          is_public: groupData.is_public ?? true,
          max_members: groupData.max_members ?? 100
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Grupo criado com sucesso!');
      await fetchGroups();
      await fetchUserGroups();
      return data;
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast.error('Erro ao criar grupo');
      return null;
    }
  };

  const fetchGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profiles:user_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      return data?.map(member => ({
        ...member,
        profile: member.profiles
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar membros do grupo:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserGroups();
    }
  }, [user]);

  return {
    groups,
    userGroups,
    loading,
    fetchGroups,
    fetchUserGroups,
    joinGroup,
    leaveGroup,
    createGroup,
    fetchGroupMembers
  };
};