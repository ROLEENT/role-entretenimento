import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateFile, generateFileName, getPublicUrl, type FileValidationOptions } from '@/utils/fileValidation';
import { useAdminToast } from '@/hooks/useAdminToast';

interface AdminFileUploadProps {
  bucket: 'events' | 'venues' | 'organizers' | 'posts';
  onUploadComplete?: (url: string, fileName: string) => void;
  currentUrl?: string;
  label?: string;
  className?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export function AdminFileUpload({
  bucket,
  onUploadComplete,
  currentUrl,
  label = 'Upload de Imagem',
  className,
  maxSize,
  allowedTypes,
}: AdminFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useAdminToast();

  const validationOptions: FileValidationOptions = {
    bucket,
    maxSize,
    allowedTypes,
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file, validationOptions);
    if (!validation.isValid) {
      showError(new Error(validation.error!));
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const fileName = generateFileName(file.name, bucket);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const publicUrl = getPublicUrl(`${bucket}/${data.path}`);
      onUploadComplete?.(publicUrl, data.path);
      showSuccess('Arquivo enviado com sucesso!');
      
    } catch (error: any) {
      console.error('[ADMIN] Upload error:', error);
      showError(error, 'Erro ao fazer upload do arquivo');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete?.('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label}</Label>
      
      <Card className="mt-2">
        <CardContent className="p-4">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={triggerFileInput}
            >
              <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Clique para selecionar uma imagem
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP ou GIF até 50MB
              </p>
            </div>
          )}

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {!preview && (
            <Button
              onClick={triggerFileInput}
              disabled={uploading}
              className="w-full mt-4"
              variant="outline"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}