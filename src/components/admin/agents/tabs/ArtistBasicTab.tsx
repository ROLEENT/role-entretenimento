import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArtistFlexibleForm } from '@/schemas/agents-flexible';
import { RHFSlug } from '../RHFSlug';
import { CountrySelect } from '@/components/form/CountrySelect';
import { AgentesTagsInput } from '@/components/agentes/AgentesTagsInput';
import { RHFArtistCategorySelect } from '@/components/form/RHFArtistCategorySelect';

interface ArtistBasicTabProps {
  form: UseFormReturn<ArtistFlexibleForm>;
}

const ARTIST_TYPE_OPTIONS = [
  { value: 'banda', label: 'Banda' },
  { value: 'dj', label: 'DJ' },
  { value: 'solo', label: 'Solo' },
  { value: 'drag', label: 'Drag' },
  { value: 'dupla', label: 'Dupla' },
  { value: 'grupo', label: 'Grupo' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

export const ArtistBasicTab: React.FC<ArtistBasicTabProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="stage_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nome Artístico
              <span className="text-destructive ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Ex: João Silva Band" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="real_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Real</FormLabel>
            <FormControl>
              <Input placeholder="Ex: João Silva" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <RHFSlug
        name="slug"
        label="Slug (URL)"
        sourceField="stage_name"
        table="artists"
        excludeId={form.getValues("id")}
        required={true}
      />

      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RHFArtistCategorySelect 
                name="category_id" 
                label="Categoria"
                placeholder="Digite para buscar categoria... Ex: DJ, Produtor, Cantor"
                maxCategories={1}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="artist_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Artista</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ARTIST_TYPE_OPTIONS.map((option) => (
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
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
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
        name="pronouns"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pronomes</FormLabel>
            <FormControl>
              <Input placeholder="Ex: ele/dele, ela/dela" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="bio_short"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio Curta</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Breve descrição do artista (até 500 caracteres)"
                  className="min-h-[80px]"
                  maxLength={500}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País</FormLabel>
              <FormControl>
                <CountrySelect
                  name="country"
                  placeholder="Selecione o país"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <AgentesTagsInput
                  name="tags"
                  placeholder="Digite uma tag e pressione Enter"
                  maxTags={10}
                />
              </FormControl>
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
              <FormLabel>Bio Longa</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição completa do artista"
                  className="min-h-[120px]"
                  {...field} 
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