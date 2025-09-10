import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArtistEnhancedForm, ARTIST_TYPES } from '@/schemas/entities/artist-enhanced';
import { RHFMultiSelectCategories } from '@/components/form/RHFMultiSelectCategories';
import { RHFMultiSelectGenres } from '@/components/form/RHFMultiSelectGenres';

interface ArtistBasicFieldsProps {
  form: UseFormReturn<ArtistEnhancedForm>;
}

export const ArtistBasicFields: React.FC<ArtistBasicFieldsProps> = ({ form }) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nome Artístico
              <span className="text-destructive ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: DJ Silva, Banda Lua Nova" 
                data-testid="artist-name"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="handle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Handle (usuário único)
              <span className="text-destructive ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: djsilva, bandaluanova" 
                {...field}
                onChange={(e) => {
                  const value = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9._-]/g, '');
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription>
              Apenas letras minúsculas, números, pontos, hífens e underscores
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Tipo de Artista
              <span className="text-destructive ml-1">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ARTIST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <RHFMultiSelectCategories
        name="categories"
        label="Categorias"
        placeholder="Selecione ou crie categorias"
        description="Selecione até 3 categorias que melhor descrevem sua atuação"
        required
        maxCategories={3}
        data-testid="artist-categories"
      />

      <div className="md:col-span-2">
        <RHFMultiSelectGenres
          name="genres"
          label="Gêneros"
          placeholder="Selecione ou crie gêneros musicais/artísticos"
          description="Selecione até 5 gêneros que representam seu trabalho"
          maxGenres={5}
          data-testid="artist-genres"
        />
      </div>

      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="bio_short"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Bio Curta
                <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Conte sua história em até 3 parágrafos. Máximo 500 caracteres."
                  className="min-h-[120px]"
                  maxLength={500}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {field.value ? `${field.value.length}/500 caracteres` : '0/500 caracteres'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="bio_long"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio Completa (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição mais detalhada da trajetória, projetos e conquistas"
                  className="min-h-[200px]"
                  maxLength={3000}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {field.value ? `${field.value.length}/3000 caracteres` : '0/3000 caracteres'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};