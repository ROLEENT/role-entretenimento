import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileImageUploadProps {
  profileId?: string;
  type: 'avatar' | 'cover';
  currentUrl?: string;
  onImageChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  profileId,
  type,
  currentUrl,
  onImageChange,
  disabled = false,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const bucketName = type === 'avatar' ? 'profile-avatars' : 'profile-covers';
  const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for avatars, 10MB for covers
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de arquivo não permitido. Use: ${acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`;
    }
    
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024);
      return `Arquivo muito grande. Máximo: ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!profileId) {
      toast({
        title: "Erro",
        description: "ID do perfil não fornecido",
        variant: "destructive"
      });
      return null;
    }

    const validation = validateFile(file);
    if (validation) {
      toast({
        title: "Arquivo inválido",
        description: validation,
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}.${fileExt}`;
      const filePath = `${profileId}/${fileName}`;

      // Remove existing file if it exists
      if (currentUrl) {
        const existingPath = currentUrl.split('/').slice(-2).join('/');
        await supabase.storage
          .from(bucketName)
          .remove([existingPath]);
      }

      // Upload new file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      toast({
        title: "Upload concluído",
        description: `${type === 'avatar' ? 'Avatar' : 'Capa'} enviado com sucesso!`
      });

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file);
    if (url) {
      onImageChange(url);
    }

    // Clear input
    event.target.value = '';
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    const url = await uploadFile(file);
    if (url) {
      onImageChange(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const removeImage = async () => {
    if (!currentUrl) return;

    try {
      const path = currentUrl.split('/').slice(-2).join('/');
      await supabase.storage
        .from(bucketName)
        .remove([path]);

      onImageChange(null);
      
      toast({
        title: "Imagem removida",
        description: `${type === 'avatar' ? 'Avatar' : 'Capa'} removido com sucesso!`
      });
    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: "Erro ao remover",
        description: "Falha ao remover a imagem",
        variant: "destructive"
      });
    }
  };

  if (type === 'avatar') {
    return (
      <div className={`space-y-4 ${className}`}>
        <Label>Avatar</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentUrl} />
            <AvatarFallback>
              <Camera className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || uploading}
                onClick={() => document.getElementById(`${type}-upload`)?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Enviando...' : currentUrl ? 'Alterar' : 'Enviar'}
              </Button>
              
              {currentUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={removeImage}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              JPG, PNG ou WebP. Máximo 5MB.
            </p>
          </div>
        </div>
        
        <input
          id={`${type}-upload`}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Imagem de Capa</Label>
      
      {currentUrl ? (
        <Card className="relative overflow-hidden">
          <img
            src={currentUrl}
            alt="Capa do perfil"
            className="w-full h-48 object-cover"
          />
          
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => document.getElementById(`${type}-upload`)?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Enviando...' : 'Alterar'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={removeImage}
            >
              <X className="h-4 w-4 mr-2" />
              Remover
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && document.getElementById(`${type}-upload`)?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          
          <p className="text-sm text-muted-foreground text-center">
            {uploading ? 'Enviando...' : 'Clique ou arraste uma imagem aqui'}
          </p>
          
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG ou WebP. Máximo 10MB.
          </p>
        </Card>
      )}
      
      <input
        id={`${type}-upload`}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};