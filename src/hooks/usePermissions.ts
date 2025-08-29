import { supabase } from '@/integrations/supabase/client';

export interface UserPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
  role: 'viewer' | 'editor' | 'admin';
}

export const usePermissions = () => {
  const checkPermissions = async (): Promise<UserPermissions> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          canCreate: false,
          canEdit: false,
          canPublish: false,
          canDelete: false,
          role: 'viewer'
        };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const role = profile?.role || 'viewer';

      return {
        canCreate: role === 'editor' || role === 'admin',
        canEdit: role === 'editor' || role === 'admin',
        canPublish: role === 'editor' || role === 'admin',
        canDelete: role === 'admin',
        role: role as 'viewer' | 'editor' | 'admin'
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        canCreate: false,
        canEdit: false,
        canPublish: false,
        canDelete: false,
        role: 'viewer'
      };
    }
  };

  return { checkPermissions };
};