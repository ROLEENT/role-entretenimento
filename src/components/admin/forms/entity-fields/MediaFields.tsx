import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { VenueEnhancedForm } from '@/schemas/entities/venue-enhanced';
import { OrganizerEnhancedForm } from '@/schemas/entities/organizer-enhanced';
import { ArtistEnhancedForm } from '@/schemas/entities/artist-enhanced';

interface MediaFieldsProps {
  form: UseFormReturn<any>;
  entityType: 'venue' | 'organizer' | 'artist';
}

export const MediaFields: React.FC<MediaFieldsProps> = ({ form, entityType }) => {
  const logoFieldName = entityType === 'artist' ? 'profile_image_url' : 'logo_url';
  const logoAltFieldName = entityType === 'artist' ? 'profile_image_alt' : 'logo_alt';
  const coverFieldName = entityType === 'artist' ? 'cover_image_url' : 'cover_url';
  const coverAltFieldName = entityType === 'artist' ? 'cover_image_alt' : 'cover_alt';

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name={logoFieldName as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {entityType === 'artist' ? 'Foto de Perfil' : 'Logo'} *
            </FormLabel>
            <FormControl>
              <Input 
                placeholder={`URL da ${entityType === 'artist' ? 'foto de perfil' : 'logo'}`} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={logoAltFieldName as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Descrição da {entityType === 'artist' ? 'Foto' : 'Logo'} *
            </FormLabel>
            <FormControl>
              <Input 
                placeholder={`Descrição da ${entityType === 'artist' ? 'foto de perfil' : 'logo'} para acessibilidade`} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={coverFieldName as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Imagem de Capa</FormLabel>
            <FormControl>
              <Input placeholder="URL da imagem de capa" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={coverAltFieldName as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição da Capa</FormLabel>
            <FormControl>
              <Input placeholder="Descrição da imagem de capa para acessibilidade" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};