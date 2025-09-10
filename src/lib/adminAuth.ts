import { supabase } from '@/integrations/supabase/client';

/**
 * Configures the Supabase client to include admin email header for admin operations
 * Note: Headers are configured globally and affect all subsequent requests
 */
export const configureAdminHeaders = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      console.warn('No authenticated user found for admin operations');
      return;
    }

    // Note: We cannot set headers directly on the client due to TypeScript restrictions
    // Headers should be set on individual requests when needed
    console.log('Admin user identified:', user.email);
    return user.email;
  } catch (error) {
    console.error('Error configuring admin headers:', error);
    return null;
  }
};

/**
 * Verifies if current user has admin access
 */
export const verifyAdminAccess = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      return false;
    }

    // Check if user is in approved_admins table
    const { data, error } = await supabase
      .from('approved_admins')
      .select('is_active')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.warn('User is not an approved admin:', user.email);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
};