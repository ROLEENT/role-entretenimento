import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { FocalPointSelector } from '@/components/ui/focal-point-selector';
import { HighlightForm } from '@/schemas/highlight';
import { Eye, Image } from 'lucide-react';

interface MediaSectionProps {
  form: UseFormReturn<HighlightForm>;
}

export function MediaSection({ form }: MediaSectionProps) {
  const coverUrl = form.watch('cover_url');
  const altText = form.watch('alt_text');
  const focalPointX = form.watch('focal_point_x');
  const focalPointY = form.watch('focal_point_y');
  const title = form.watch('title');
  const slug = form.watch('slug');

  const handleImageUpload = (url: string) => {
    form.setValue('cover_url', url);
  };

  const handleImageRemove = () => {
    form.setValue('cover_url', '');
    form.setValue('alt_text', '');
    form.setValue('focal_point_x', 0.5);
    form.setValue('focal_point_y', 0.5);
  };

  const handleFocalPointChange = (x: number, y: number) => {
    form.setValue('focal_point_x', x);
    form.setValue('focal_point_y', y);
  };

  const generatePreviewUrl = () => {
    if (!slug) return '#';
    return `/preview/${slug}?preview=true&noindex=true`;
  };

  const openPreview = () => {
    const previewUrl = generatePreviewUrl();
    if (previewUrl !== '#') {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Imagem de Capa
          </div>
          {coverUrl && slug && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openPreview}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver prévia
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Upload da imagem */}
        <div className="space-y-4">
          <ImageUpload
            value={coverUrl}
            onChange={handleImageUpload}
            onRemove={handleImageRemove}
            bucket="admin"
            maxSize={5}
            allowedTypes={['image/png', 'image/jpg', 'image/jpeg', 'image/webp']}
            showPreview={!!slug}
            onPreview={openPreview}
          />
        </div>

        {/* Campo de texto alternativo */}
        <FormField
          control={form.control}
          name="alt_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto alternativo *</FormLabel>
              <FormControl>
                <Input 
                  placeholder={coverUrl ? "Descreva a imagem para acessibilidade..." : "Adicione uma imagem primeiro"}
                  disabled={!coverUrl}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Descrição da imagem para pessoas com deficiência visual e SEO.
                {!coverUrl && " Adicione uma imagem primeiro."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Seletor de ponto focal */}
        {coverUrl && (
          <FocalPointSelector
            imageUrl={coverUrl}
            focalPointX={focalPointX}
            focalPointY={focalPointY}
            onFocalPointChange={handleFocalPointChange}
          />
        )}

        {/* Preview não indexável */}
        {coverUrl && slug && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <h4 className="text-sm font-medium mb-2">Preview Público</h4>
            <div className="text-xs text-muted-foreground mb-3">
              URL de prévia: {window.location.origin}{generatePreviewUrl()}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 rounded border overflow-hidden bg-muted">
                <img
                  src={coverUrl}
                  alt={altText || "Preview"}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${focalPointX * 100}% ${focalPointY * 100}%`
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {title || 'Título do destaque'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ponto focal: {Math.round(focalPointX * 100)}%, {Math.round(focalPointY * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}