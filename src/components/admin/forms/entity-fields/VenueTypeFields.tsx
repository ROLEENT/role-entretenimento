import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from '@/components/ui/multi-select';
import { 
  VenueEnhancedForm, 
  BAR_STYLES, 
  AMBIENT_TYPES, 
  STAGE_TYPES,
  TECHNICAL_EQUIPMENT,
  CUISINE_TYPES,
  MUSIC_GENRES 
} from '@/schemas/entities/venue-enhanced';

interface VenueTypeFieldsProps {
  form: UseFormReturn<VenueEnhancedForm>;
  venueType: string;
}

export const VenueTypeFields: React.FC<VenueTypeFieldsProps> = ({ form, venueType }) => {
  switch (venueType) {
    case 'bar':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Características do Bar</h3>
            
            <FormField
              control={form.control}
              name="bar_style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo do Bar</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={BAR_STYLES.map(style => ({ label: style, value: style }))}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione os estilos"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ambient_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={AMBIENT_TYPES.map(type => ({ label: type, value: type }))}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione o tipo de ambiente"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="drink_specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidades em Bebidas</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={[]}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Digite as especialidades"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                name="stage_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Palco</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAGE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seating_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade de Assentos</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="200" 
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="acoustic_treatment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tratamento Acústico</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technical_equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipamentos Técnicos</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={TECHNICAL_EQUIPMENT.map(eq => ({ label: eq, value: eq }))}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione os equipamentos"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      );

    case 'clube':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Características do Clube</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dance_floor_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho da Pista (m²)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="100" 
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sound_system"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sistema de Som</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Descrição do sistema de som" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lighting_system"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sistema de Iluminação</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Descrição da iluminação" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vip_areas"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Áreas VIP</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      );

    case 'restaurante':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Características do Restaurante</h3>
            
            <FormField
              control={form.control}
              name="cuisine_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Culinária</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={CUISINE_TYPES.map(cuisine => ({ label: cuisine, value: cuisine }))}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione os tipos de culinária"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faixa de Preço</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="economico">Econômico</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dining_style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo do Restaurante</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={[
                        { label: 'Fine Dining', value: 'Fine Dining' },
                        { label: 'Casual', value: 'Casual' },
                        { label: 'Fast Casual', value: 'Fast Casual' },
                        { label: 'Bistrô', value: 'Bistrô' },
                        { label: 'Buffet', value: 'Buffet' },
                      ]}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione o estilo"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outdoor_seating"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Área Externa</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      );

    case 'casa-noturna':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Características da Casa Noturna</h3>
            
            <FormField
              control={form.control}
              name="music_genres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gêneros Musicais</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={MUSIC_GENRES.map(genre => ({ label: genre, value: genre }))}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione os gêneros"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="text-md font-medium">Estrutura para Shows</h4>
              
              <FormField
                control={form.control}
                name="show_structure.stage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Palco</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_structure.backstage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Backstage</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_structure.green_room"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Camarim</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_structure.load_in"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acesso para Load-in</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Descrição do acesso para equipamentos" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};