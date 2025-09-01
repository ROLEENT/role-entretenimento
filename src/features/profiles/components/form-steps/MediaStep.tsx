import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateProfile } from '../../schemas';
import { validateImageFile, validateImageDimensions } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';

interface MediaStepProps {
  form: UseFormReturn<CreateProfile>;
}

export function MediaStep({ form }: MediaStepProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (file: File, type: 'avatar' | 'cover') => {
    try {
      // Validate file type and size
      const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 8 * 1024 * 1024; // 5MB for avatar, 8MB for cover
      validateImageFile(file, maxSize);
      
      // Validate dimensions
      const minWidth = type === 'avatar' ? 320 : 1920;
      const minHeight = type === 'avatar' ? 320 : 640;
      await validateImageDimensions(file, minWidth, minHeight);
      
      // Create preview
      const preview = URL.createObjectURL(file);
      
      if (type === 'avatar') {
        setAvatarPreview(preview);
        form.setValue('avatar_file', file);
      } else {
        setCoverPreview(preview);
        form.setValue('cover_file', file);
      }
      
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        description: error instanceof Error ? error.message : 'Erro ao validar arquivo' 
      });
    }
  };

  const removeFile = (type: 'avatar' | 'cover') => {
    if (type === 'avatar') {
      setAvatarPreview(null);
      form.setValue('avatar_file', undefined);
    } else {
      setCoverPreview(null);
      form.setValue('cover_file', undefined);
    }
  };

  const FileUploadArea = ({ 
    type, 
    preview, 
    dimensions,
    description 
  }: { 
    type: 'avatar' | 'cover';
    preview: string | null;
    dimensions: string;
    description: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'avatar' ? <Camera className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
          {type === 'avatar' ? 'Avatar' : 'Capa'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name={`${type}_file` as keyof CreateProfile}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="space-y-4">
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${type}`}
                        className={`w-full object-cover border rounded-lg ${
                          type === 'avatar' ? 'aspect-square max-w-xs mx-auto' : 'aspect-[3/1] max-h-48'
                        }`}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeFile(type)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className={`
                      relative border-2 border-dashed border-muted-foreground/25 rounded-lg
                      hover:border-muted-foreground/50 transition-colors cursor-pointer
                      flex flex-col items-center justify-center gap-2 p-8
                      ${type === 'avatar' ? 'aspect-square max-w-xs mx-auto' : 'aspect-[3/1]'}
                    `}>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          Clique para fazer upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dimensions} • JPG ou PNG • Máximo {type === 'avatar' ? '5MB' : '8MB'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileChange(file, type);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Imagens do Perfil</h3>
        <p className="text-muted-foreground">
          Adicione um avatar e uma capa para tornar seu perfil mais atrativo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUploadArea
          type="avatar"
          preview={avatarPreview}
          dimensions="Mínimo 320x320px"
          description="Imagem quadrada que representa o perfil. Para artistas será circular, para locais e organizadores será quadrada com bordas arredondadas."
        />

        <FileUploadArea
          type="cover"
          preview={coverPreview}
          dimensions="Mínimo 1920x640px"
          description="Imagem de capa no formato 3:1. Será exibida no topo do perfil com um gradiente sutil no rodapé para melhor legibilidade."
        />
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium">Dicas para melhores resultados:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use imagens de alta qualidade e bem iluminadas</li>
          <li>• Para o avatar, centralize o elemento principal da imagem</li>
          <li>• Para a capa, evite texto nas bordas (área de corte no mobile)</li>
          <li>• Formatos recomendados: JPG para fotos, PNG para logos</li>
        </ul>
      </div>
    </div>
  );
}