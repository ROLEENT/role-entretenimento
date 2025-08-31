import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  label?: string;
  description?: string;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'avatar' | 'banner' | 'thumbnail';
  aspectRatio?: string;
  placeholder?: string;
  showProgress?: boolean;
}

const VARIANT_STYLES = {
  default: {
    container: 'w-full',
    image: 'w-full h-48 object-cover',
    dropZone: 'h-48'
  },
  avatar: {
    container: 'w-32 h-32',
    image: 'w-full h-full object-cover rounded-full',
    dropZone: 'h-32 rounded-full'
  },
  banner: {
    container: 'w-full',
    image: 'w-full h-32 object-cover',
    dropZone: 'h-32'
  },
  thumbnail: {
    container: 'w-24 h-24',
    image: 'w-full h-full object-cover rounded',
    dropZone: 'h-24'
  }
};

export const UnifiedImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = "Imagem",
  description,
  bucket = "agenda-images",
  folder,
  maxSizeMB = 10,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  disabled = false,
  className,
  variant = 'default',
  aspectRatio,
  placeholder,
  showProgress = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { uploadFile, deleteFile, uploading, uploadProgress } = useStorageUpload(bucket);

  const styles = VARIANT_STYLES[variant];

  const handleUpload = useCallback(async (file: File) => {
    console.log('UnifiedImageUpload: Tentando upload para bucket:', bucket, 'folder:', folder);
    const url = await uploadFile(file, bucket, folder, {
      maxSizeMB,
      allowedTypes
    });
    
    if (url) {
      console.log('UnifiedImageUpload: Upload sucesso, URL:', url);
      onChange(url);
    } else {
      console.error('UnifiedImageUpload: Upload falhou');
    }
  }, [uploadFile, bucket, folder, maxSizeMB, allowedTypes, onChange]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Clear input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file && allowedTypes.includes(file.type)) {
      handleUpload(file);
    }
  }, [handleUpload, allowedTypes]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }, []);

  const handleRemove = useCallback(async () => {
    if (value) {
      const success = await deleteFile(value, bucket);
      if (success) {
        onChange(null);
      }
    } else {
      onChange(null);
    }
  }, [value, deleteFile, bucket, onChange]);

  const openFileDialog = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploading]);

  const formatFileTypes = useCallback(() => {
    return allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ');
  }, [allowedTypes]);

  return (
    <div className={cn("space-y-3", styles.container, className)}>
      {label && (
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {value ? (
        <Card className="relative overflow-hidden group">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={value}
                alt={label}
                className={styles.image}
                style={aspectRatio ? { aspectRatio } : undefined}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={openFileDialog}
                  disabled={disabled || uploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || uploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <CardContent className="p-6">
            <div
              className={cn("flex flex-col items-center justify-center space-y-4 text-center", styles.dropZone)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
            >
              {uploading ? (
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="space-y-2 w-full max-w-xs">
                    <p className="text-sm text-muted-foreground">Enviando...</p>
                    {showProgress && (
                      <Progress value={uploadProgress} className="w-full" />
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-muted rounded-full">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {placeholder || "Clique para selecionar ou arraste uma imagem"}
                    </p>
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-xs text-muted-foreground">
                        {formatFileTypes()} até {maxSizeMB}MB
                      </p>
                      {folder && (
                        <Badge variant="outline" className="text-xs">
                          {folder}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled || uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
};