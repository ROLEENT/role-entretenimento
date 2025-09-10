import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArtistEnhancedForm } from '@/schemas/entities/artist-enhanced';
import { Plus, Trash2 } from 'lucide-react';

interface ArtistMediaFieldsProps {
  form: UseFormReturn<ArtistEnhancedForm>;
}

export const ArtistMediaFields: React.FC<ArtistMediaFieldsProps> = ({ form }) => {
  const [newGalleryItem, setNewGalleryItem] = useState({ url: '', alt: '', caption: '' });

  const addGalleryItem = () => {
    if (newGalleryItem.url && newGalleryItem.alt) {
      const currentGallery = form.getValues('gallery') || [];
      form.setValue('gallery', [...currentGallery, newGalleryItem]);
      setNewGalleryItem({ url: '', alt: '', caption: '' });
    }
  };

  const removeGalleryItem = (index: number) => {
    const currentGallery = form.getValues('gallery') || [];
    form.setValue('gallery', currentGallery.filter((_, i) => i !== index));
  };

  const addOtherLink = () => {
    const currentLinks = form.getValues('links.other') || [];
    form.setValue('links.other', [...currentLinks, { label: '', url: '' }]);
  };

  const removeOtherLink = (index: number) => {
    const currentLinks = form.getValues('links.other') || [];
    form.setValue('links.other', currentLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Main Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Imagens Principais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="profile_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Foto de Perfil / Press Kit
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || ''}
                    onChange={field.onChange}
                    label="Foto Principal"
                    maxSizeMB={5}
                  />
                </FormControl>
                <FormDescription>
                  Foto que será usada como perfil principal (requerida)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profile_image_alt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Descrição da Foto de Perfil
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: DJ Silva em apresentação, sorrindo"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Descrição para acessibilidade e SEO
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cover_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagem de Capa (opcional)</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || ''}
                    onChange={field.onChange}
                    label="Imagem de Capa"
                    maxSizeMB={10}
                  />
                </FormControl>
                <FormDescription>
                  Imagem para banner/header do perfil
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cover_image_alt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição da Imagem de Capa</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: DJ Silva em performance no palco principal"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Gallery */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Galeria de Imagens</h3>
        
        {/* Existing gallery items */}
        <div className="space-y-3">
          {(form.watch('gallery') || []).map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <img src={item.url} alt={item.alt} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="font-medium">{item.alt}</p>
                {item.caption && <p className="text-sm text-muted-foreground">{item.caption}</p>}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeGalleryItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new gallery item */}
        <div className="p-4 border rounded-lg space-y-3">
          <h4 className="font-medium">Adicionar Nova Imagem</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="URL da imagem"
              value={newGalleryItem.url}
              onChange={(e) => setNewGalleryItem({...newGalleryItem, url: e.target.value})}
            />
            <Input
              placeholder="Descrição (obrigatória)"
              value={newGalleryItem.alt}
              onChange={(e) => setNewGalleryItem({...newGalleryItem, alt: e.target.value})}
            />
            <Input
              placeholder="Legenda (opcional)"
              value={newGalleryItem.caption}
              onChange={(e) => setNewGalleryItem({...newGalleryItem, caption: e.target.value})}
            />
          </div>
          <Button type="button" onClick={addGalleryItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Imagem
          </Button>
        </div>
      </div>

      {/* Social Media & Streaming Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Links Externos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="links.instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Instagram
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="@usuario ou usuario"
                    {...field}
                    onChange={(e) => {
                      let value = e.target.value.replace('@', '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links.spotify"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spotify</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://open.spotify.com/artist/..."
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links.soundcloud"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SoundCloud</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://soundcloud.com/usuario"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links.youtube"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://youtube.com/c/canal"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links.beatport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beatport</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://beatport.com/artist/..."
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links.website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website Oficial</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://www.exemplo.com"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links.portfolio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfólio</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://portfolio.exemplo.com"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Especialmente importante para fotógrafos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links.facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://facebook.com/usuario"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="links.tiktok"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TikTok</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://tiktok.com/@usuario"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Other Links */}
        <div className="space-y-3">
          <h4 className="font-medium">Outros Links</h4>
          {(form.watch('links.other') || []).map((link, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                placeholder="Nome do link"
                value={link.label}
                onChange={(e) => {
                  const currentLinks = form.getValues('links.other') || [];
                  currentLinks[index].label = e.target.value;
                  form.setValue('links.other', currentLinks);
                }}
              />
              <Input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => {
                  const currentLinks = form.getValues('links.other') || [];
                  currentLinks[index].url = e.target.value;
                  form.setValue('links.other', currentLinks);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeOtherLink(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addOtherLink}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Link
          </Button>
        </div>
      </div>
    </div>
  );
};
