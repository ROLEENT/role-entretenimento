import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ArtistEnhancedForm } from '@/schemas/entities/artist-enhanced';

interface ArtistTypeFieldsProps {
  form: UseFormReturn<ArtistEnhancedForm>;
  artistType: string;
}

export const ArtistTypeFields: React.FC<ArtistTypeFieldsProps> = ({ form, artistType }) => {
  const watchedValue = form.watch();

  const addItem = (fieldName: keyof ArtistEnhancedForm, value: string) => {
    const currentArray = (watchedValue[fieldName] as string[]) || [];
    if (value && !currentArray.includes(value)) {
      form.setValue(fieldName, [...currentArray, value] as any);
    }
  };

  const removeItem = (fieldName: keyof ArtistEnhancedForm, value: string) => {
    const currentArray = (watchedValue[fieldName] as string[]) || [];
    form.setValue(fieldName, currentArray.filter(item => item !== value) as any);
  };

  const renderArrayField = (
    fieldName: keyof ArtistEnhancedForm,
    label: string,
    placeholder: string,
    suggestions: string[] = []
  ) => (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <div className="space-y-2">
        <Input
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const value = e.currentTarget.value.trim();
              if (value) {
                addItem(fieldName, value);
                e.currentTarget.value = '';
              }
            }
          }}
        />
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addItem(fieldName, suggestion)}
                className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {((watchedValue[fieldName] as string[]) || []).map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                type="button"
                onClick={() => removeItem(fieldName, item)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  switch (artistType) {
    case 'dj':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="dj_style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estilo Musical *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Tech House, Techno, Deep House" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="set_duration_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração Típica do Set (minutos) *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    placeholder="60" 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="equipment_needs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Necessidades de Equipamento</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva equipamentos específicos que costuma usar ou necessitar"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'banda':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="band_members"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Integrantes *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    placeholder="4" 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {renderArrayField('instruments', 'Instrumentos *', 'Ex: Guitarra, Bateria, Baixo', [
            'Guitarra', 'Baixo', 'Bateria', 'Teclado', 'Violão', 'Saxofone', 'Trompete', 'Vocal'
          ])}

          <FormField
            control={form.control}
            name="technical_rider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rider Técnico</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva necessidades técnicas específicas"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'performer':
    case 'drag':
      return (
        <div className="space-y-4">
          {renderArrayField('performance_type', 'Tipos de Performance *', 'Ex: Stand-up, Drag Show, Teatro', [
            'Drag Show', 'Stand-up', 'Teatro', 'Dança', 'Performance Art', 'Burlesque', 'Circo'
          ])}

          <FormField
            control={form.control}
            name="costume_requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Necessidades de Figurino</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva necessidades especiais de figurino ou caracterização"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="special_needs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Necessidades Especiais</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Camarim, iluminação específica, etc."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'ator':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="theater_experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experiência Teatral</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva experiência em teatro, formação, cursos"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {renderArrayField('repertoire', 'Repertório', 'Ex: Hamlet, Romeu e Julieta')}

          {renderArrayField('acting_styles', 'Estilos de Atuação *', 'Ex: Teatro clássico, Contemporâneo', [
            'Teatro Clássico', 'Contemporâneo', 'Comédia', 'Drama', 'Musical', 'Experimental'
          ])}
        </div>
      );

    case 'fotografo':
      return (
        <div className="space-y-4">
          {renderArrayField('photography_style', 'Estilo Fotográfico *', 'Ex: Retrato, Evento, Street', [
            'Retrato', 'Evento', 'Moda', 'Street', 'Documental', 'Artística', 'Produtos'
          ])}

          <FormField
            control={form.control}
            name="equipment_owned"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipamentos Próprios</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Liste câmeras, lentes e equipamentos que possui"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {renderArrayField('portfolio_highlights', 'Destaques do Portfólio', 'Ex: Cobertura Rock in Rio 2024')}
        </div>
      );

    default:
      return null;
  }
};