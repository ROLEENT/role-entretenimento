import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  bucket: string;
  path?: string;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  bucket,
  path = '',
  maxSize = 5,
  accept = 'image/*',
  className = '',
  placeholder = 'Clique para fazer upload da imagem'
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo ${maxSize}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [bucket, path, maxSize, onChange]);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    onChange(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {value ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative group">
              <img
                src={value}
                alt="Upload preview"
                className="w-full max-w-md h-48 object-cover rounded-lg mx-auto"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Remover
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Clique na imagem para alterar
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          } ${uploading ? 'pointer-events-none' : 'hover:border-primary hover:bg-primary/5'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              {uploading ? (
                <>
                  <div className="animate-pulse">
                    <Upload className="h-8 w-8 mx-auto text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Enviando imagem...</p>
                    <Progress value={progress} className="w-full max-w-xs mx-auto" />
                    <p className="text-xs text-muted-foreground">{progress}%</p>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{placeholder}</p>
                    <p className="text-xs text-muted-foreground">
                      Arraste e solte ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Máximo {maxSize}MB • PNG, JPG, WebP
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};