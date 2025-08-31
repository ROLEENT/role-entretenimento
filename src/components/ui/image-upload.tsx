import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  bucket = "artist-images",
  folder = "",
  className,
  placeholder
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    try {
      setIsUploading(true);

      // Verificar tamanho do arquivo
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast.error(`Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB`);
        return;
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload para o Supabase Storage
      console.log('Tentando upload para bucket:', bucket, 'path:', filePath);
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        console.error('Bucket:', bucket, 'Path:', filePath);
        toast.error(`Erro ao fazer upload: ${error.message}`);
        return;
      }

      console.log('Upload sucesso:', data);

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onChange(publicUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  }, [onChange, maxSizeMB]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  }, [uploadFile]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    } else {
      toast.error('Por favor, selecione um arquivo de imagem válido');
    }
  }, [uploadFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
  }, [onChange, onRemove]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>

      {value ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative group">
              <img
                src={value}
                alt={label}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
          <CardContent className="p-6">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !disabled && !isUploading && document.getElementById(`file-upload-${label}`)?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Enviando...</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-muted rounded-full">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Clique para selecionar ou arraste uma imagem
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF até {maxSizeMB}MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled || isUploading}
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
        id={`file-upload-${label}`}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};