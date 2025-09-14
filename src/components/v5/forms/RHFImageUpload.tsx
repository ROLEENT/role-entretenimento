import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RHFImageUploadProps {
  name: string;
  altName: string;
  label: string;
  bucket: string;
  className?: string;
  required?: boolean;
  accept?: string;
}

export function RHFImageUpload({ 
  name, 
  altName,
  label, 
  bucket,
  className,
  required,
  accept = "image/*"
}: RHFImageUploadProps) {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const [isUploading, setIsUploading] = useState(false);
  
  const imageUrl = watch(name);
  const altText = watch(altName);
  const error = errors[name] || errors[altName];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setValue(name, publicUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setValue(name, '');
    setValue(altName, '');
  };

  return (
    <div className={className}>
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      
      {imageUrl ? (
        <div className="space-y-4">
          <div className="relative inline-block">
            <img 
              src={imageUrl} 
              alt={altText || 'Preview'} 
              className="max-w-sm max-h-48 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <Label htmlFor={altName}>
              Texto alternativo *
            </Label>
            <Input
              id={altName}
              placeholder="Descreva a imagem..."
              {...register(altName)}
              className={errors[altName] ? 'border-destructive' : ''}
            />
            {errors[altName] && (
              <p className="text-sm text-destructive mt-1">
                {errors[altName]?.message as string}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Clique para selecionar uma imagem
          </p>
          <Button 
            type="button" 
            variant="outline" 
            disabled={isUploading}
            onClick={() => document.getElementById(`file-${name}`)?.click()}
          >
            {isUploading ? 'Enviando...' : 'Selecionar arquivo'}
          </Button>
          <input
            id={`file-${name}`}
            type="file"
            accept={accept}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive mt-1">
          {error.message as string}
        </p>
      )}
    </div>
  );
}