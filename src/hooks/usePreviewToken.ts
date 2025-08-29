import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePreviewToken = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePreviewToken = useCallback(async (agendaId: string): Promise<string | null> => {
    setIsGenerating(true);
    try {
      // Generate a secure token
      const token = crypto.randomUUID();
      
      // Update the agenda item with the preview token
      const { error } = await supabase
        .from('agenda_itens')
        .update({ 
          preview_token: token,
          updated_at: new Date().toISOString()
        })
        .eq('id', agendaId);

      if (error) throw error;
      
      return token;
    } catch (error) {
      console.error('Erro ao gerar token de preview:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const openSecurePreview = useCallback(async (agendaId: string, slug: string) => {
    const token = await generatePreviewToken(agendaId);
    if (token) {
      const previewUrl = `/preview/agenda/${slug}?token=${token}`;
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  }, [generatePreviewToken]);

  const validatePreviewToken = useCallback(async (slug: string, token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('agenda_itens')
        .select('id')
        .eq('slug', slug)
        .eq('preview_token', token)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }, []);

  return {
    generatePreviewToken,
    openSecurePreview,
    validatePreviewToken,
    isGenerating
  };
};