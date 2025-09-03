import React, { useState, useCallback } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Eye, 
  Download,
  Search,
  Grid,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  onRemove?: () => void;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  src, 
  alt, 
  onRemove, 
  className 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (imageError || !src) {
    return (
      <div className={cn(
        "border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50",
        className
      )}>
        <div className="text-center p-4">
          <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {imageError ? 'Erro ao carregar' : 'Nenhuma imagem'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      <img
        src={src}
        alt={alt || 'Preview'}
        className="w-full h-full object-cover rounded-lg"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => window.open(src, '_blank')}
        >
          <Eye className="w-4 h-4" />
        </Button>
        {onRemove && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const MediaStep: React.FC = () => {
  const { control, watch } = useFormContext<EventFormData>();
  const [activeTab, setActiveTab] = useState('main');
  
  const {
    fields: galleryImages,
    append: appendGalleryImage,
    remove: removeGalleryImage
  } = useFieldArray({
    control,
    name: 'gallery'
  });

  const watchedImageUrl = watch('image_url');
  const watchedCoverUrl = watch('cover_url');
  const watchedOgImageUrl = watch('og_image_url');

  const addGalleryImage = useCallback((url: string) => {
    if (url.trim()) {
      appendGalleryImage({ url: url.trim(), type: 'image' });
    }
  }, [appendGalleryImage]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main">Imagens Principais</TabsTrigger>
          <TabsTrigger value="gallery">Galeria</TabsTrigger>
          <TabsTrigger value="seo">SEO & Social</TabsTrigger>
        </TabsList>

        {/* Main Images */}
        <TabsContent value="main" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Imagens Principais</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Defina as imagens principais que representarão seu evento
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Image */}
            <div className="space-y-4">
              <FormField
                control={control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem Principal *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemplo.com/imagem.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL da imagem principal do evento (formato 16:9 recomendado)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <ImagePreview 
                src={watchedImageUrl || ''} 
                alt="Imagem principal"
                className="aspect-video"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-4">
              <FormField
                control={control}
                name="cover_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem de Capa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemplo.com/capa.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Imagem de capa para destaque (formato 21:9 recomendado)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ImagePreview 
                src={watchedCoverUrl || ''} 
                alt="Imagem de capa"
                className="aspect-[21/9]"
              />
            </div>
          </div>

            {/* Cover Alt Text - REQUIRED */}
            <FormField
              control={control}
              name="cover_alt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto Alternativo da Capa *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descrição da imagem para acessibilidade"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormDescription>
                    <strong>Obrigatório:</strong> Descrição da imagem para leitores de tela e SEO
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </TabsContent>

        {/* Gallery */}
        <TabsContent value="gallery" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Galeria de Imagens</h3>
              <p className="text-sm text-muted-foreground">
                Adicione imagens adicionais para a galeria do evento
              </p>
            </div>
            <Badge variant="outline">
              {galleryImages.length} imagem{galleryImages.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Add Gallery Image */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="URL da imagem para adicionar à galeria"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      addGalleryImage(input.value);
                      input.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="URL da imagem"]') as HTMLInputElement;
                    if (input) {
                      addGalleryImage(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Cole a URL da imagem e pressione Enter ou clique no botão para adicionar
              </p>
            </CardContent>
          </Card>

          {/* Gallery Grid */}
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image, index) => (
                <ImagePreview
                  key={`${image.id}-${index}`}
                  src={image.url || ''}
                  alt={`Galeria ${index + 1}`}
                  className="aspect-square"
                  onRemove={() => removeGalleryImage(index)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Grid className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Galeria vazia</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione imagens para criar uma galeria visual do evento
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SEO & Social */}
        <TabsContent value="seo" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">SEO & Redes Sociais</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Imagens otimizadas para buscadores e compartilhamento social
            </p>
          </div>

          <div className="space-y-6">
            {/* Open Graph Image */}
            <div className="space-y-4">
              <FormField
                control={control}
                name="og_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem Open Graph</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemplo.com/og-image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Imagem que aparece ao compartilhar nas redes sociais (1200x630px recomendado)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedOgImageUrl && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Preview do Compartilhamento</p>
                  <Card className="max-w-md">
                    <CardContent className="p-0">
                      <ImagePreview 
                        src={watchedOgImageUrl} 
                        alt="Open Graph"
                        className="aspect-[1.91/1] rounded-t-lg"
                      />
                      <div className="p-4">
                        <p className="font-medium line-clamp-1">
                          {watch('title') || 'Título do Evento'}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {watch('summary') || 'Descrição do evento...'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {watch('city') || 'Cidade'} • meusite.com
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Image Guidelines */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Diretrizes de Imagens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Imagem Principal:</p>
                  <p className="text-muted-foreground">1920x1080px (16:9) • JPG/PNG • Máx. 2MB</p>
                </div>
                <div>
                  <p className="font-medium">Imagem de Capa:</p>
                  <p className="text-muted-foreground">2100x900px (21:9) • JPG/PNG • Máx. 2MB</p>
                </div>
                <div>
                  <p className="font-medium">Open Graph:</p>
                  <p className="text-muted-foreground">1200x630px (1.91:1) • JPG/PNG • Máx. 1MB</p>
                </div>
                <div>
                  <p className="font-medium">Galeria:</p>
                  <p className="text-muted-foreground">1000x1000px (1:1) • JPG/PNG • Máx. 1MB cada</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (watchedImageUrl && !watchedOgImageUrl) {
                        control._formValues.og_image_url = watchedImageUrl;
                      }
                    }}
                    disabled={!watchedImageUrl || !!watchedOgImageUrl}
                  >
                    Usar Imagem Principal como OG
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (watchedImageUrl) {
                        addGalleryImage(watchedImageUrl);
                      }
                    }}
                    disabled={!watchedImageUrl}
                  >
                    Adicionar Principal à Galeria
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};