import React from 'react';
import { UnifiedImageUpload } from '@/components/ui/unified-image-upload';

interface VenueImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  label?: string;
  disabled?: boolean;
  variant?: 'banner' | 'thumbnail';
}

export const VenueImageUpload: React.FC<VenueImageUploadProps> = ({
  value,
  onChange,
  label = "Imagem do Local",
  disabled = false,
  variant = 'banner'
}) => {
  return (
    <UnifiedImageUpload
      value={value}
      onChange={onChange}
      label={label}
      description="Imagem principal do local. Recomendado: alta qualidade"
      bucket="venues"
      folder="images"
      maxSizeMB={10}
      allowedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
      disabled={disabled}
      variant={variant}
      showProgress={true}
    />
  );
};