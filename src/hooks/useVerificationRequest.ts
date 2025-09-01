import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VerificationRequestData {
  profile_user_id: string;
  verification_type: 'identity' | 'business' | 'artist';
  documents?: Array<{ type: string; url: string; name: string }>;
  social_proof?: {
    instagram_followers?: number;
    spotify_monthly_listeners?: number;
    youtube_subscribers?: number;
    website_url?: string;
  };
  business_info?: {
    business_name?: string;
    tax_id?: string;
    registration_number?: string;
    business_type?: string;
  };
}

export const useVerificationRequest = () => {
  const [loading, setLoading] = useState(false);

  const submitVerificationRequest = async (data: VerificationRequestData) => {
    setLoading(true);
    
    try {
      const { data: result, error } = await supabase
        .from('verification_requests')
        .insert({
          profile_user_id: data.profile_user_id,
          requested_by: data.profile_user_id, // Same as profile user
          verification_type: data.verification_type,
          documents: data.documents || [],
          social_proof: data.social_proof || {},
          business_info: data.business_info || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Create admin notification
      await supabase
        .from('admin_notifications')
        .insert({
          type: 'verification_request',
          title: 'Nova solicitação de verificação',
          message: `Novo pedido de verificação ${data.verification_type}`,
          data: {
            verification_id: result.id,
            profile_user_id: data.profile_user_id,
            verification_type: data.verification_type
          },
          priority: 'normal'
        });

      toast.success('Solicitação de verificação enviada com sucesso!');
      return { data: result, error: null };
    } catch (error: any) {
      console.error('Error submitting verification request:', error);
      toast.error('Erro ao enviar solicitação de verificação');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const getVerificationRequests = async (profileUserId: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('profile_user_id', profileUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching verification requests:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    submitVerificationRequest,
    getVerificationRequests,
    loading
  };
};