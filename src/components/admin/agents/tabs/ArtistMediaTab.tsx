import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArtistFormData } from '../AdminArtistForm';

interface ArtistMediaTabProps {
  form: UseFormReturn<ArtistFormData>;
}

export const ArtistMediaTab: React.FC<ArtistMediaTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      {/* Profile Images */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Imagens de Perfil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="profile_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto de Perfil Principal</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://exemplo.com/foto-perfil.jpg" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar (Imagem Pequena)</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://exemplo.com/avatar.jpg" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem de Capa</FormLabel>
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
        </div>
      </div>

      {/* Image Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Image Preview */}
        {form.watch('profile_image_url') && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview - Foto de Perfil</label>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img 
                src={form.watch('profile_image_url')} 
                alt="Preview perfil"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Avatar Preview */}
        {form.watch('avatar_url') && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview - Avatar</label>
            <div className="aspect-square rounded-full overflow-hidden bg-muted max-w-24">
              <img 
                src={form.watch('avatar_url')} 
                alt="Preview avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Cover Image Preview */}
        {form.watch('cover_image_url') && (
          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-medium">Preview - Capa</label>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img 
                src={form.watch('cover_image_url')} 
                alt="Preview capa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Press Kit and Documents */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Materiais de Imprensa</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="presskit_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link do Press Kit</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://drive.google.com/..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_credits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Créditos das Imagens</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Fotógrafo: Nome do Fotógrafo\nMakeup: Nome do Maquiador\nLocal: Nome do Local"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Additional Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Links Adicionais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website Oficial</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://www.artistaincrivel.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Dicas para Imagens</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Foto de perfil: Formato quadrado, mínimo 400x400px</li>
          <li>• Avatar: Formato circular, mínimo 200x200px</li>
          <li>• Capa: Formato 16:9, mínimo 1200x675px</li>
          <li>• Use URLs diretas para as imagens (terminadas em .jpg, .png, etc.)</li>
          <li>• Recomendamos hospedar no Google Drive, Dropbox ou serviços similares</li>
        </ul>
      </div>
    </div>
  );
};