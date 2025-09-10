import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { VenueEnhancedForm, CUISINE_TYPES, STAGE_TYPES } from '@/schemas/entities/venue-enhanced';

interface VenueTypeFieldsProps {
  form: UseFormReturn<VenueEnhancedForm>;
  venueType: string;
}

export const VenueTypeFields: React.FC<VenueTypeFieldsProps> = ({ form, venueType }) => {
  const watchedValue = form.watch();

  const addItem = (fieldPath: string, value: string) => {
    const pathArray = fieldPath.split('.');
    const currentValue = pathArray.reduce((obj, key) => obj?.[key], watchedValue) as string[] || [];
    if (value && !currentValue.includes(value)) {
      form.setValue(fieldPath as any, [...currentValue, value]);
    }
  };

  const removeItem = (fieldPath: string, value: string) => {
    const pathArray = fieldPath.split('.');
    const currentValue = pathArray.reduce((obj, key) => obj?.[key], watchedValue) as string[] || [];
    form.setValue(fieldPath as any, currentValue.filter(item => item !== value));
  };

  const renderArrayField = (
    fieldPath: string,
    label: string,
    placeholder: string,
    suggestions: string[] = []
  ) => {
    const pathArray = fieldPath.split('.');
    const currentValue = pathArray.reduce((obj, key) => obj?.[key], watchedValue) as string[] || [];

    return (
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
                  addItem(fieldPath, value);
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
                  onClick={() => addItem(fieldPath, suggestion)}
                  className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {currentValue.map((item) => (
              <Badge key={item} variant="secondary" className="flex items-center gap-1">
                {item}
                <button
                  type="button"
                  onClick={() => removeItem(fieldPath, item)}
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
  };

  const renderCheckboxGroup = (
    basePath: string,
    options: { key: string; label: string }[]
  ) => (
    <div className="grid grid-cols-2 gap-4">
      {options.map(({ key, label }) => (
        <FormField
          key={key}
          control={form.control}
          name={`${basePath}.${key}` as any}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  {label}
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      ))}
    </div>
  );

  switch (venueType) {
    case 'bar':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Características do Bar</h3>
            {renderCheckboxGroup('bar_features', [
              { key: 'happy_hour', label: 'Happy Hour' },
              { key: 'craft_beer', label: 'Cervejas Artesanais' },
              { key: 'cocktails', label: 'Coquetéis' },
              { key: 'wine_selection', label: 'Seleção de Vinhos' },
              { key: 'outdoor_seating', label: 'Área Externa' },
              { key: 'pool_table', label: 'Mesa de Bilhar' },
              { key: 'sports_tv', label: 'TV para Esportes' },
              { key: 'live_music', label: 'Música ao Vivo' },
            ])}
          </div>
        </div>
      );

    case 'teatro':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Características do Teatro</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="theater_features.stage_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Palco *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de palco" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAGE_TYPES.map((type) => (
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
                name="theater_features.seating_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade de Assentos *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="200" 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="theater_features.backstage_rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camarins</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="2" 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {renderArrayField(
              'theater_features.technical_equipment', 
              'Equipamentos Técnicos', 
              'Ex: Mesa de som, Refletores LED',
              ['Mesa de Som', 'Refletores LED', 'Sistema de Áudio', 'Projetores', 'Cortinas Motorizadas']
            )}

            {renderArrayField(
              'theater_features.accessibility_features', 
              'Recursos de Acessibilidade', 
              'Ex: Tradução em Libras, Audiodescrição',
              ['Tradução em Libras', 'Audiodescrição', 'Lugares para Cadeirantes', 'Banheiros Acessíveis']
            )}
          </div>
        </div>
      );

    case 'clube':
    case 'casa-noturna':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Características do Clube</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="club_features.sound_system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sistema de Som *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Funktion-One, L-Acoustics" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="club_features.lighting_system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sistema de Iluminação</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: LED RGB, Moving lights" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="club_features.dance_floor_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho da Pista (m²)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="100" 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="club_features.security_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Segurança</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basica">Básica</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {renderCheckboxGroup('club_features', [
              { key: 'vip_areas', label: 'Áreas VIP' },
              { key: 'smoking_area', label: 'Área para Fumantes' },
              { key: 'coat_check', label: 'Guarda-Volumes' },
            ])}
          </div>
        </div>
      );

    case 'restaurante':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Características do Restaurante</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="restaurant_features.price_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faixa de Preço *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a faixa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="$">$ - Econômico</SelectItem>
                        <SelectItem value="$$">$$ - Moderado</SelectItem>
                        <SelectItem value="$$$">$$$ - Alto</SelectItem>
                        <SelectItem value="$$$$">$$$$ - Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {renderArrayField(
              'restaurant_features.cuisine_type', 
              'Tipos de Culinária *', 
              'Ex: Brasileira, Italiana',
              CUISINE_TYPES
            )}

            <div>
              <h4 className="text-md font-medium mb-3">Características</h4>
              {renderCheckboxGroup('restaurant_features', [
                { key: 'serves_alcohol', label: 'Serve Bebidas Alcoólicas' },
                { key: 'outdoor_dining', label: 'Área Externa' },
                { key: 'private_dining', label: 'Sala Privativa' },
                { key: 'catering', label: 'Serviço de Catering' },
              ])}
            </div>

            <div>
              <h4 className="text-md font-medium mb-3">Opções Dietéticas</h4>
              {renderCheckboxGroup('restaurant_features.dietary_options', [
                { key: 'vegetarian', label: 'Vegetariano' },
                { key: 'vegan', label: 'Vegano' },
                { key: 'gluten_free', label: 'Sem Glúten' },
                { key: 'halal', label: 'Halal' },
                { key: 'kosher', label: 'Kosher' },
              ])}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};