import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArtistEnhancedForm, ARTIST_TYPES } from '@/schemas/entities/artist-enhanced';
import { MultiSelect } from '@/components/ui/multi-select';
import { ARTIST_CATEGORIES, MUSIC_GENRES, PERFORMANCE_GENRES } from '@/schemas/entities/artist-enhanced';

interface ArtistBasicFieldsProps {
  form: UseFormReturn<ArtistEnhancedForm>;
}

export const ArtistBasicFields: React.FC<ArtistBasicFieldsProps> = ({ form }) => {
  const artistType = form.watch('type');
  
  // Get relevant genres based on artist type
  const getRelevantGenres = (type: string) => {
    if (['performer', 'drag', 'ator'].includes(type)) {
      return [...MUSIC_GENRES, ...PERFORMANCE_GENRES];
    }
    return MUSIC_GENRES;
  };

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
              <Input placeholder="Ex: DJ Silva, Banda Lua Nova" {...field} />
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

      <FormField
        control={form.control}
        name="categories"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Categorias
              <span className="text-destructive ml-1">*</span>
            </FormLabel>
            <FormControl>
              <MultiSelect
                options={ARTIST_CATEGORIES.map(cat => ({ label: cat, value: cat }))}
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecione suas categorias"
                maxSelected={3}
              />
            </FormControl>
            <FormDescription>
              Selecione até 3 categorias que melhor descrevem sua atuação
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="genres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gêneros</FormLabel>
              <FormControl>
                <MultiSelect
                  options={getRelevantGenres(artistType).map(genre => ({ label: genre, value: genre }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Selecione os gêneros relacionados"
                  maxSelected={5}
                />
              </FormControl>
              <FormDescription>
                Selecione até 5 gêneros que representam seu trabalho
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
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