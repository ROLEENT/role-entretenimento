import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/auth/AuthContext';

export const useStorageUpload = (defaultBucket: string = 'agenda-images') => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { isAdmin, user: authUser } = useAuth();

  const uploadFile = useCallback(async (
    file: File, 
    bucket?: string, 
    folder?: string,
    options?: { maxSizeMB?: number; allowedTypes?: string[] }
  ): Promise<string | null> => {
    if (!file) return null;

    // Check authentication first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer upload",
        variant: "destructive"
      });
      return null;
    }

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

      // Generate unique filename with user ID and timestamp for better organization
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 9);
      const fileName = `${user.id}/${timestamp}-${randomId}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 20, 90));
      }, 200);

      let uploadData;

      // Handle admin-only buckets that require x-admin-email header
      if (isAdmin && authUser?.email && (bucketName === 'events' || bucketName === 'venues' || bucketName === 'artists')) {
        // For admin buckets, we need to make a custom request with headers
        // Since Supabase JS client doesn't directly support custom headers for storage,
        // we'll make the request manually
        try {
          const supabaseUrl = 'https://nutlcbnruabjsxecqpnd.supabase.co';
          const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c';
          
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'x-admin-email': authUser.email
            },
            body: formData
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `HTTP ${response.status}: ${response.statusText}`);
          }

          uploadData = await response.json();
        } catch (fetchError) {
          console.error('Admin upload error:', fetchError);
          
          // Fallback to regular upload for admin users
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              upsert: false
            });

          if (error) {
            if (error.message?.includes('row-level security')) {
              throw new Error(`Acesso negado ao bucket '${bucketName}'. Este bucket requer permissões especiais de administrador.`);
            }
            throw error;
          }
          uploadData = data;
        }
      } else {
        // Standard buckets - use regular Supabase client
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            upsert: false
          });
          
        if (error) {
          if (error.message?.includes('row-level security')) {
            throw new Error(`Acesso negado ao bucket '${bucketName}'. Verifique suas permissões.`);
          }
          throw error;
        }
        uploadData = data;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData?.path || filePath);

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
  }, [toast, defaultBucket, isAdmin, authUser]);

  const deleteFile = useCallback(async (url: string, bucket?: string): Promise<boolean> => {
    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para deletar arquivos",
          variant: "destructive"
        });
        return false;
      }

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
      
      // Handle admin buckets with proper authentication
      if (isAdmin && authUser?.email && (bucketName === 'events' || bucketName === 'venues' || bucketName === 'artists')) {
        // For admin buckets, try manual delete with headers
        try {
          const supabaseUrl = 'https://nutlcbnruabjsxecqpnd.supabase.co';
          const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c';
          
          const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'x-admin-email': authUser.email
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (fetchError) {
          console.error('Admin delete error:', fetchError);
          
          // Fallback to regular delete
          const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);
            
          if (error) {
            if (error.message?.includes('row-level security')) {
              throw new Error(`Acesso negado ao bucket '${bucketName}'. Apenas administradores podem deletar arquivos aqui.`);
            }
            throw error;
          }
        }
      } else {
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);
          
        if (error) {
          if (error.message?.includes('row-level security')) {
            throw new Error(`Acesso negado ao bucket '${bucketName}'. Verifique suas permissões.`);
          }
          throw error;
        }
      }

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
  }, [toast, defaultBucket, isAdmin, authUser]);

  return {
    uploadFile,
    deleteFile,
    uploading,
    uploadProgress
  };
};