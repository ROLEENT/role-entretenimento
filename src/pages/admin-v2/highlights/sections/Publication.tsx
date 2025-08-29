import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { HighlightForm } from '@/schemas/highlight';
import { Send, Clock } from 'lucide-react';

interface PublicationSectionProps {
  form: UseFormReturn<HighlightForm>;
}

export function PublicationSection({ form }: PublicationSectionProps) {
  const status = form.watch('status');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Publicação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {status === 'scheduled' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="publish_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publicar em</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    Quando o destaque será publicado automaticamente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unpublish_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Despublicar em</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    Quando o destaque será removido automaticamente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  max="999"
                  placeholder="100"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 100)}
                />
              </FormControl>
              <FormDescription>
                Ordem de exibição (menor número = maior prioridade)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Publicidade
          </h4>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="patrocinado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Conteúdo Patrocinado</FormLabel>
                    <FormDescription>
                      Marcar como conteúdo patrocinado
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('patrocinado') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="anunciante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anunciante</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do anunciante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cupom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Cupom</FormLabel>
                      <FormControl>
                        <Input placeholder="DESCONTO10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}