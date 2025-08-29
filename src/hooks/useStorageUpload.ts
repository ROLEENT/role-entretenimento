import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStorageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File, path?: string): Promise<string | null> => {
    if (!file) return null;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WebP.');
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = path || `${crypto.randomUUID()}.${fileExt}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 20, 90));
      }, 200);

      const { data, error } = await supabase.storage
        .from('agenda-images')
        .upload(fileName, file, {
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) throw error;

      setUploadProgress(100);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('agenda-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha ao enviar arquivo",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [toast]);

  const deleteFile = useCallback(async (url: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      const { error } = await supabase.storage
        .from('agenda-images')
        .remove([fileName]);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Erro ao remover",
        description: "Falha ao remover arquivo do storage",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    uploadFile,
    deleteFile,
    uploading,
    uploadProgress
  };
};