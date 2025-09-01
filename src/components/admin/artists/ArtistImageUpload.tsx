import React from 'react';
import { UnifiedImageUpload } from '@/components/ui/unified-image-upload';

interface ArtistImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  label?: string;
  disabled?: boolean;
  type?: 'profile' | 'cover' | 'gallery';
}

export const ArtistImageUpload: React.FC<ArtistImageUploadProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  type = 'profile'
}) => {
  const getConfig = () => {
    switch (type) {
      case 'profile':
        return {
          label: label || "Foto de Perfil",
          description: "Imagem principal do artista. Recomendado: formato quadrado, alta qualidade",
          variant: 'avatar' as const,
          aspectRatio: '1/1',
          folder: 'profiles'
        };
      case 'cover':
        return {
          label: label || "Imagem de Capa",
          description: "Imagem de capa do artista. Recomendado: 1200x400px",
          variant: 'banner' as const,
          aspectRatio: '3/1',
          folder: 'covers'
        };
      case 'gallery':
        return {
          label: label || "Imagem da Galeria",
          description: "Imagem adicional para galeria do artista",
          variant: 'default' as const,
          aspectRatio: '4/3',
          folder: 'gallery'
        };
      default:
        return {
          label: label || "Imagem",
          description: "Imagem do artista",
          variant: 'default' as const,
          folder: 'general'
        };
    }
  };

  const config = getConfig();

  return (
    <UnifiedImageUpload
      value={value}
      onChange={onChange}
      label={config.label}
      description={config.description}
      bucket="artist-images"
      folder={config.folder}
      maxSizeMB={10}
      allowedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
      disabled={disabled}
      variant={config.variant}
      aspectRatio={config.aspectRatio}
      showProgress={true}
    />
  );
};