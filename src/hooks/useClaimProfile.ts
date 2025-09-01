import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClaimProfileData {
  handle: string;
  email: string;
  password: string;
  claimCode: string;
  verificationMethod?: 'email' | 'phone' | 'document';
}

export const useClaimProfile = () => {
  const [loading, setLoading] = useState(false);

  const claimProfile = async (data: ClaimProfileData) => {
    setLoading(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('link-profile', {
        body: {
          handle: data.handle,
          email: data.email,
          password: data.password,
          claimCode: data.claimCode,
          verificationMethod: data.verificationMethod || 'email'
        }
      });

      if (error) {
        throw error;
      }

      if (result.error) {
        throw new Error(result.error);
      }

      return { data: result, error: null };
    } catch (error: any) {
      console.error('Error claiming profile:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    claimProfile,
    loading
  };
};