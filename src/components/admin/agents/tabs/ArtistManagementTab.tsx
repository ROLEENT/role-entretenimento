import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArtistFormData } from '../AdminArtistForm';

interface ArtistManagementTabProps {
  form: UseFormReturn<ArtistFormData>;
}

const PRIORITY_LEVELS = [
  { value: 0, label: 'Normal' },
  { value: 1, label: 'Alta' },
  { value: 2, label: 'Muito Alta' },
  { value: 3, label: 'Crítica' },
];

export const ArtistManagementTab: React.FC<ArtistManagementTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      {/* Responsible Contact */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pessoa Responsável</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="responsible_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Responsável</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome da pessoa responsável pelo artista" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsible_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Função do Responsável</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Manager, Agente, Produtor" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Internal Management */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Gestão Interna</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Prioridade</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="internal_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas Internas</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Anotações internas sobre o artista (não visíveis publicamente)"
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

      {/* Image Rights and Legal */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Direitos e Legal</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="image_rights_authorized"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Direitos de Imagem Autorizados
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    O artista autorizou o uso de suas imagens para divulgação
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Tags and Classification */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tags e Classificação</h3>
        <div className="space-y-4">
          <div>
            <FormLabel>Tags</FormLabel>
            <p className="text-sm text-muted-foreground mb-2">
              Adicione tags separadas por vírgula (ex: house, techno, underground)
            </p>
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="house, techno, underground, festival"
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag.length > 0);
                        field.onChange(tags);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Informações Importantes</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• As notas internas são visíveis apenas para administradores</li>
          <li>• O nível de prioridade afeta a ordem de exibição nas listagens</li>
          <li>• Tags ajudam na categorização e busca de artistas</li>
          <li>• Autorização de direitos de imagem é importante para divulgação</li>
        </ul>
      </div>
    </div>
  );
};