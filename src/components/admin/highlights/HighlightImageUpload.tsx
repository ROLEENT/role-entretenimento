import React from 'react';
import { UnifiedImageUpload } from '@/components/ui/unified-image-upload';
import { useFormContext } from 'react-hook-form';

interface HighlightImageUploadProps {
  name: string;
  label?: string;
  disabled?: boolean;
}

export const HighlightImageUpload: React.FC<HighlightImageUploadProps> = ({
  name,
  label = "Imagem do Destaque",
  disabled = false
}) => {
  const { watch, setValue } = useFormContext();
  const value = watch(name);

  return (
    <UnifiedImageUpload
      value={value}
      onChange={(url) => setValue(name, url)}
      label={label}
      description="Recomendado: 1200x800px, formato JPG ou PNG"
      bucket="highlights"
      folder="images"
      maxSizeMB={10}
      allowedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
      disabled={disabled}
      variant="banner"
      aspectRatio="3/2"
      showProgress={true}
    />
  );
};