import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArtistFormData } from '../AdminArtistForm';

interface ArtistBasicTabProps {
  form: UseFormReturn<ArtistFormData>;
}

const ARTIST_TYPES = [
  { value: 'banda', label: 'Banda' },
  { value: 'dj', label: 'DJ' },
  { value: 'solo', label: 'Solo' },
  { value: 'drag', label: 'Drag' },
  { value: 'dupla', label: 'Dupla' },
  { value: 'grupo', label: 'Grupo' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo', variant: 'default' },
  { value: 'inactive', label: 'Inativo', variant: 'secondary' },
];

export const ArtistBasicTab: React.FC<ArtistBasicTabProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Name and Stage Name */}
      <FormField
        control={form.control}
        name="stage_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Artístico *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Artista Incrível" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo *</FormLabel>
            <FormControl>
              <Input placeholder="Nome completo do artista" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Slug */}
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug (URL) *</FormLabel>
            <FormControl>
              <Input 
                placeholder="artista-incrivel" 
                {...field}
                className="font-mono text-sm"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Artist Type */}
      <FormField
        control={form.control}
        name="artist_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Artista *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

      {/* Status */}
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant as any} className="px-2 py-0">
                        {status.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Real Name and Pronouns */}
      <FormField
        control={form.control}
        name="real_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Real</FormLabel>
            <FormControl>
              <Input placeholder="Nome real (opcional)" {...field} />
            </FormControl>
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

      {/* Bio Short */}
      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="bio_short"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio Curta</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição resumida do artista (máx. 200 caracteres)"
                  className="resize-none"
                  rows={3}
                  maxLength={200}
                  {...field}
                />
              </FormControl>
              <div className="text-sm text-muted-foreground text-right">
                {field.value?.length || 0}/200
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Bio Long */}
      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="bio_long"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio Completa</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Biografia completa do artista"
                  className="resize-none"
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* About */}
      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sobre</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais sobre o artista"
                  className="resize-none"
                  rows={4}
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