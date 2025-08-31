import { useState, useCallback } from 'react';
import { useStorageUpload } from './useStorageUpload';
import { toast } from 'sonner';

interface ImageUploadResult {
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

interface UseMultipleImageUploadProps {
  bucket?: string;
  folder?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const useMultipleImageUpload = ({
  bucket = 'agenda-images',
  folder,
  maxFiles = 10,
  maxSizeMB = 10,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
}: UseMultipleImageUploadProps = {}) => {
  const [images, setImages] = useState<ImageUploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const { uploadFile, deleteFile } = useStorageUpload(bucket);

  const uploadMultipleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate total number of files
    if (images.length + fileArray.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} imagens permitido`);
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        const fileKey = `${file.name}-${index}`;
        
        try {
          // Update progress for this file
          setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));
          
          const url = await uploadFile(file, bucket, folder, {
            maxSizeMB,
            allowedTypes
          });
          
          if (url) {
            setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
            
            return {
              url,
              name: file.name,
              size: file.size,
              uploadedAt: new Date()
            };
          }
          return null;
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          setUploadProgress(prev => ({ ...prev, [fileKey]: -1 })); // Error state
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result): result is ImageUploadResult => result !== null);
      
      if (successfulUploads.length > 0) {
        setImages(prev => [...prev, ...successfulUploads]);
        toast.success(`${successfulUploads.length} imagem(ns) enviada(s) com sucesso`);
      }
      
      if (results.length > successfulUploads.length) {
        const failedCount = results.length - successfulUploads.length;
        toast.error(`${failedCount} imagem(ns) falharam no upload`);
      }
    } catch (error) {
      console.error('Error in multiple upload:', error);
      toast.error('Erro no upload múltiplo');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [uploadFile, bucket, folder, maxSizeMB, allowedTypes, images.length, maxFiles]);

  const removeImage = useCallback(async (index: number) => {
    const imageToRemove = images[index];
    if (!imageToRemove) return;

    try {
      const success = await deleteFile(imageToRemove.url, bucket);
      if (success) {
        setImages(prev => prev.filter((_, i) => i !== index));
        toast.success('Imagem removida com sucesso');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Erro ao remover imagem');
    }
  }, [images, deleteFile, bucket]);

  const reorderImages = useCallback((startIndex: number, endIndex: number) => {
    setImages(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const clearAllImages = useCallback(async () => {
    if (images.length === 0) return;

    try {
      setUploading(true);
      
      const deletePromises = images.map(image => 
        deleteFile(image.url, bucket)
      );
      
      await Promise.all(deletePromises);
      setImages([]);
      toast.success('Todas as imagens foram removidas');
    } catch (error) {
      console.error('Error clearing images:', error);
      toast.error('Erro ao remover todas as imagens');
    } finally {
      setUploading(false);
    }
  }, [images, deleteFile, bucket]);

  const getImageUrls = useCallback(() => {
    return images.map(img => img.url);
  }, [images]);

  const getTotalSize = useCallback(() => {
    return images.reduce((total, img) => total + img.size, 0);
  }, [images]);

  const getTotalSizeMB = useCallback(() => {
    return getTotalSize() / (1024 * 1024);
  }, [getTotalSize]);

  return {
    images,
    uploading,
    uploadProgress,
    uploadMultipleFiles,
    removeImage,
    reorderImages,
    clearAllImages,
    getImageUrls,
    getTotalSize,
    getTotalSizeMB,
    canUploadMore: images.length < maxFiles,
    remainingSlots: maxFiles - images.length
  };
};