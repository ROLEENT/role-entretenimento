import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { OrganizerFlexibleForm } from '@/schemas/agents-flexible';

interface OrganizerMediaTabProps {
  form: UseFormReturn<OrganizerFlexibleForm>;
}

export const OrganizerMediaTab: React.FC<OrganizerMediaTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Logo</h3>
        
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  value={field.value || ''}
                  onChange={field.onChange}
                  label="Logo do Organizador"
                  bucket="organizers"
                  maxSizeMB={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo_alt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto alternativo do logo</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Texto alternativo do logo (para acessibilidade)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Imagem de Capa</h3>
        
        <FormField
          control={form.control}
          name="cover_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUpload
                  value={field.value || ''}
                  onChange={field.onChange}
                  label="Imagem de Capa do Organizador"
                  bucket="organizers"
                  maxSizeMB={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cover_alt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto alternativo da capa</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Texto alternativo da capa (para acessibilidade)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};