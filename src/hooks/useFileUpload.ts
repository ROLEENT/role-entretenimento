import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // in bytes, default 5MB
  allowedTypes?: string[];
  upsert?: boolean;
}

interface UploadResult {
  url: string | null;
  path: string | null;
  error: string | null;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = useCallback(async (
    file: File, 
    options: UploadOptions
  ): Promise<UploadResult> => {
    const {
      bucket,
      folder = '',
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      upsert = true
    } = options;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      const error = `Tipo de arquivo não permitido. Use: ${allowedTypes.join(', ')}`;
      toast({
        title: "Arquivo inválido",
        description: error,
        variant: "destructive"
      });
      return { url: null, path: null, error };
    }

    // Validate file size
    if (file.size > maxSize) {
      const error = `Arquivo muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`;
      toast({
        title: "Arquivo muito grande",
        description: error,
        variant: "destructive"
      });
      return { url: null, path: null, error };
    }

    setUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          upsert,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setProgress(100);
      
      toast({
        title: "Upload concluído",
        description: "Arquivo enviado com sucesso"
      });

      return { 
        url: publicUrl, 
        path: filePath, 
        error: null 
      };

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro no upload';
      
      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive"
      });

      return { 
        url: null, 
        path: null, 
        error: errorMessage 
      };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [toast]);

  const removeFile = useCallback(async (bucket: string, path: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Remove file error:', error);
      return false;
    }
  }, []);

  return {
    uploadFile,
    removeFile,
    uploading,
    progress
  };
};