import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FocalPointSelector } from '@/components/highlights/FocalPointSelector';
import { supabase } from '@/integrations/supabase/client';
import { HighlightForm } from '@/schemas/highlight';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface MediaSectionProps {
  form: UseFormReturn<HighlightForm>;
}

export function MediaSection({ form }: MediaSectionProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato não suportado. Use PNG, JPG, JPEG ou WebP.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const fileName = `highlight-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { data, error } = await supabase.storage
        .from('admin-uploads')
        .upload(fileName, file);

      clearInterval(progressInterval);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('admin-uploads')
        .getPublicUrl(data.path);

      form.setValue('cover_url', urlData.publicUrl);
      setUploadProgress(100);
      
      // Auto-gerar alt_text baseado no nome do arquivo
      if (!form.getValues('alt_text')) {
        const altText = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        form.setValue('alt_text', altText);
      }
      
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
      console.error(error);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const removeImage = () => {
    form.setValue('cover_url', '');
    form.setValue('alt_text', '');
    form.setValue('focal_point_x', 0.5);
    form.setValue('focal_point_y', 0.5);
  };

  const coverUrl = form.watch('cover_url');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Mídia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4">
          <FormLabel>Imagem de Capa *</FormLabel>
          
          {!coverUrl ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" disabled={isUploading} asChild>
                      <span>
                        {isUploading ? 'Enviando...' : 'Selecionar Imagem'}
                      </span>
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, JPEG ou WebP. Máximo 5MB.
                  </p>
                </div>
                
                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {uploadProgress}% enviado
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border">
                <img 
                  src={coverUrl} 
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <FocalPointSelector
                imageUrl={coverUrl}
                initialX={form.watch('focal_point_x')}
                initialY={form.watch('focal_point_y')}
                onFocalPointChange={(x, y) => {
                  form.setValue('focal_point_x', x);
                  form.setValue('focal_point_y', y);
                }}
              />
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="alt_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto Alternativo *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Descreva a imagem para acessibilidade" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Importante para acessibilidade e SEO
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

      </CardContent>
    </Card>
  );
}