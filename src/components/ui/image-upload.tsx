import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  bucket?: string;
  folder?: string;
  className?: string;
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  label = "Imagem",
  accept = "image/*",
  maxSizeMB = 5,
  disabled = false,
  bucket = "artists", // Updated to use correct bucket
  folder = "",
  className,
  placeholder
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { uploadFile, uploading } = useStorageUpload(bucket);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const url = await uploadFile(file, bucket, folder, {
        maxSizeMB,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      });
      
      if (url) {
        onChange(url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [uploadFile, bucket, folder, maxSizeMB, onChange]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemove = () => {
    onChange('');
    onRemove?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      
      <div className="space-y-4">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt={label}
              className="w-full h-48 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && !uploading && document.getElementById(`file-input-${label}`)?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Enviando...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Clique para enviar ou arraste aqui</p>
                  <p className="text-muted-foreground">
                    {placeholder || `Máximo ${maxSizeMB}MB`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <input
          id={`file-input-${label}`}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
      </div>
    </div>
  );
};