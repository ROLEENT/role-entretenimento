import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArtistFormData } from '../AdminArtistForm';

interface ArtistMediaTabProps {
  form: UseFormReturn<ArtistFormData>;
}

export const ArtistMediaTab: React.FC<ArtistMediaTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Imagens</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="profile_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Imagem de Perfil</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://exemplo.com/perfil.jpg"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cover_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Imagem de Capa</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://exemplo.com/capa.jpg"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image_credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Créditos das Imagens</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Fotos por João Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Redes Sociais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input placeholder="@usuario ou usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
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
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Streaming e Música</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="spotify_url"
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
            name="soundcloud_url"
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
            name="youtube_url"
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
            name="beatport_url"
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
            name="audius_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audius</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://audius.co/usuario"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="presskit_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL do Press Kit</FormLabel>
            <FormControl>
              <Input 
                type="url"
                placeholder="https://exemplo.com/presskit.pdf"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};