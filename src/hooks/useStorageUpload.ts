import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStorageUpload = (defaultBucket: string = 'agenda-images') => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = useCallback(async (
    file: File, 
    bucket?: string, 
    folder?: string,
    options?: { maxSizeMB?: number; allowedTypes?: string[] }
  ): Promise<string | null> => {
    if (!file) return null;

    setUploading(true);
    setUploadProgress(0);

    try {
      const bucketName = bucket || defaultBucket;
      const maxSizeMB = options?.maxSizeMB || 10;
      const allowedTypes = options?.allowedTypes || [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
      ];

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de arquivo não permitido. Use: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`);
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB.`);
      }

      // Generate unique filename with timestamp
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 9);
      const fileName = `${timestamp}-${randomId}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 20, 90));
      }, 200);

      // Check if we have admin access and add headers accordingly
      const adminEmail = localStorage.getItem('admin_email');
      let uploadResult;

      if (adminEmail) {
        // For admin operations, create a FormData and use fetch with headers
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/${bucketName}/${filePath}`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c',
              'x-admin-email': adminEmail
            },
            body: file
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: 'Upload failed' } }));
          throw new Error(errorData.error?.message || 'Upload failed');
        }

        uploadResult = { data: { path: filePath }, error: null };
      } else {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            upsert: false
          });
        
        uploadResult = { data, error };
      }

      clearInterval(progressInterval);

      if (uploadResult.error) throw uploadResult.error;

      setUploadProgress(100);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      toast({
        title: "Upload realizado",
        description: "Arquivo enviado com sucesso!",
        variant: "default"
      });

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
  }, [toast, defaultBucket]);

  const deleteFile = useCallback(async (url: string, bucket?: string): Promise<boolean> => {
    try {
      const bucketName = bucket || defaultBucket;
      
      // Extract path from URL - handle both public URLs and direct paths
      let filePath: string;
      if (url.includes('storage/v1/object/public/')) {
        const urlParts = url.split('/');
        const bucketIndex = urlParts.findIndex(part => part === bucketName);
        filePath = urlParts.slice(bucketIndex + 1).join('/');
      } else {
        filePath = url;
      }
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Arquivo removido",
        description: "Arquivo deletado com sucesso!",
        variant: "default"
      });

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
  }, [toast, defaultBucket]);

  return {
    uploadFile,
    deleteFile,
    uploading,
    uploadProgress
  };
};