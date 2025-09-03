import React, { useState, useRef } from 'react';
import { UseControllerProps, useController } from 'react-hook-form';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface RHFImageUploadProps {
  urlControl: UseControllerProps;
  altControl: UseControllerProps;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  maxSize?: number; // em MB
  acceptedFormats?: string[];
  showPreview?: boolean;
  showAltText?: boolean;
  bucketName?: string;
  folder?: string;
}

export function RHFImageUpload({
  urlControl,
  altControl,
  label = "Imagem",
  description,
  className,
  disabled = false,
  maxSize = 5, // 5MB por padrão
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  showPreview = true,
  showAltText = true,
  bucketName = 'event-images',
  folder = 'covers'
}: RHFImageUploadProps) {
  const {
    field: urlField,
    fieldState: { error: urlError }
  } = useController(urlControl);

  const {
    field: altField,
    fieldState: { error: altError }
  } = useController(altControl);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!acceptedFormats.includes(file.type)) {
      toast.error(`Formato não suportado. Use: ${acceptedFormats.join(', ')}`);
      return;
    }

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${folder}/${timestamp}.${extension}`;

      // Simulação de upload (substituir pela implementação real do Supabase Storage)
      // const { data, error } = await supabase.storage
      //   .from(bucketName)
      //   .upload(fileName, file, {
      //     onUploadProgress: (progress) => {
      //       setUploadProgress((progress.loaded / progress.total) * 100);
      //     }
      //   });

      // if (error) throw error;

      // const { data: { publicUrl } } = supabase.storage
      //   .from(bucketName)
      //   .getPublicUrl(fileName);

      // Simulação para desenvolvimento
      const reader = new FileReader();
      reader.onload = () => {
        // Simular progresso
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            
            // Usar data URL temporariamente
            urlField.onChange(reader.result as string);
            
            // Auto-gerar alt text básico se não existir
            if (!altField.value) {
              const baseName = file.name.split('.')[0].replace(/[-_]/g, ' ');
              altField.onChange(`Imagem: ${baseName}`);
            }
            
            toast.success('Imagem carregada com sucesso!');
            setUploading(false);
            setUploadProgress(0);
          }
        }, 100);
      };
      
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao fazer upload da imagem');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } } as any);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleRemove = () => {
    urlField.onChange('');
    altField.onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    urlField.onChange(url);
    // Auto-gerar alt text básico para URLs externas
    if (url && !altField.value) {
      altField.onChange('Imagem do evento');
    }
  };

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      
      <div className="space-y-4">
        {/* Preview da imagem */}
        {showPreview && urlField.value && (
          <div className="relative">
            <img
              src={urlField.value}
              alt={altField.value || 'Preview'}
              className="w-full h-48 object-cover rounded-lg border"
              onError={() => {
                toast.error('Erro ao carregar imagem');
                handleRemove();
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
            {altField.value && (
              <div className="absolute bottom-2 left-2 right-2">
                <Badge variant="secondary" className="text-xs truncate">
                  {altField.value}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Upload area */}
        {!urlField.value && (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || uploading}
            />
            
            {uploading ? (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
                <p className="text-sm text-muted-foreground">Fazendo upload...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</p>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arraste uma imagem aqui ou clique para selecionar
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </Button>
                <p className="text-xs text-muted-foreground">
                  Máximo {maxSize}MB • {acceptedFormats.map(f => f.split('/')[1]).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* URL manual */}
        <div className="space-y-2">
          <Label htmlFor="image-url">Ou cole uma URL de imagem</Label>
          <Input
            id="image-url"
            type="url"
            placeholder="https://exemplo.com/imagem.jpg"
            value={urlField.value || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Alt text */}
        {showAltText && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="alt-text">Texto alternativo (Alt)</Label>
              {!altField.value && (
                <Badge variant="outline" className="text-xs gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Obrigatório para acessibilidade
                </Badge>
              )}
            </div>
            <Input
              id="alt-text"
              placeholder="Descreva a imagem para pessoas com deficiência visual"
              value={altField.value || ''}
              onChange={(e) => altField.onChange(e.target.value)}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Descreva o que aparece na imagem de forma objetiva
            </p>
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <FormMessage>{urlError?.message || altError?.message}</FormMessage>
    </FormItem>
  );
}