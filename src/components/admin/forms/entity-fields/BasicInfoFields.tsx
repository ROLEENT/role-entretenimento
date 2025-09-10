import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VenueEnhancedForm, VENUE_TYPES } from '@/schemas/entities/venue-enhanced';
import { OrganizerEnhancedForm, ORGANIZER_TYPES } from '@/schemas/entities/organizer-enhanced';
import { ArtistEnhancedForm, ARTIST_TYPES } from '@/schemas/entities/artist-enhanced';

interface BasicInfoFieldsProps {
  form: UseFormReturn<any>;
  entityType: 'venue' | 'organizer' | 'artist';
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form, entityType }) => {
  const getTypeOptions = () => {
    switch (entityType) {
      case 'venue':
        return VENUE_TYPES;
      case 'organizer':
        return ORGANIZER_TYPES;
      case 'artist':
        return ARTIST_TYPES;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nome {entityType === 'artist' ? 'Artístico' : ''} *
            </FormLabel>
            <FormControl>
              <Input placeholder={`Digite o nome ${entityType === 'venue' ? 'do local' : entityType === 'organizer' ? 'do organizador' : 'artístico'}`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {getTypeOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cidade *</FormLabel>
            <FormControl>
              <Input placeholder="Digite a cidade" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {entityType === 'organizer' && (
        <FormField
          control={form.control}
          name="manifesto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manifesto *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o manifesto ou filosofia do organizador (50-1000 caracteres)"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="bio_short"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio Curta *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={`Descreva brevemente ${entityType === 'venue' ? 'o local' : entityType === 'organizer' ? 'o organizador' : 'o artista'} (20-500 caracteres)`}
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="about"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sobre (Opcional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descrição mais detalhada"
                className="min-h-[120px]"
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