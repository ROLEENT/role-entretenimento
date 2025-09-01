import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePublicAuth } from './usePublicAuth';
import { toast } from 'sonner';

export const useUploadMedia = () => {
  const { user, isAuthenticated } = usePublicAuth();
  const [uploading, setUploading] = useState(false);

  const uploadMedia = async (profileId: string, file: File, data: {
    title?: string;
    description?: string;
    media_type: 'image' | 'video' | 'audio';
    category?: string;
  }) => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer upload');
      return { error: { message: 'Não autenticado' } };
    }

    setUploading(true);
    try {
      // Upload do arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}/${Date.now()}.${fileExt}`;
      const filePath = `profile-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-media')
        .getPublicUrl(filePath);

      // Salvar referência no banco
      const { error: dbError } = await supabase
        .from('profile_media')
        .insert({
          profile_id: profileId,
          user_id: user.id,
          media_url: publicUrl,
          media_type: data.media_type,
          title: data.title,
          description: data.description,
          category: data.category,
          file_size: file.size,
          file_name: file.name,
          uploaded_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      toast.success('Media enviada com sucesso!');
      return { data: { url: publicUrl }, error: null };
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da media');
      return { error };
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (mediaId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return { error: { message: 'Não autenticado' } };
    }

    try {
      // Buscar dados da media para deletar arquivo do storage
      const { data: media } = await supabase
        .from('profile_media')
        .select('media_url, user_id')
        .eq('id', mediaId)
        .single();

      if (!media) {
        throw new Error('Media não encontrada');
      }

      // Verificar se o usuário é o dono da media
      if (media.user_id !== user.id) {
        throw new Error('Você não tem permissão para deletar esta media');
      }

      // Extrair caminho do arquivo da URL
      const url = new URL(media.media_url);
      const filePath = url.pathname.split('/storage/v1/object/public/profile-media/')[1];

      // Deletar arquivo do storage
      await supabase.storage
        .from('profile-media')
        .remove([filePath]);

      // Deletar referência do banco
      const { error } = await supabase
        .from('profile_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      toast.success('Media deletada com sucesso!');
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao deletar media:', error);
      toast.error('Erro ao deletar media');
      return { error };
    }
  };

  return {
    uploadMedia,
    deleteMedia,
    uploading,
    isAuthenticated,
    canUpload: isAuthenticated
  };
};