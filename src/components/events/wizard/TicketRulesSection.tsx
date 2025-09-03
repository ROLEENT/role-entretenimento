import React from 'react';
import { useFormContext } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Clock, Users, Info } from 'lucide-react';

export const TicketRulesSection: React.FC = () => {
  const { control, watch, setValue } = useFormContext<EventFormData>();
  
  // Use a simple object to store additional ticket rules
  const watchedTicketRules = watch('ticket_rules') || [];

  // Store additional ticket info in description fields
  const getTicketRule = (type: string) => {
    return watchedTicketRules.find(rule => rule.rule === type);
  };

  const updateTicketRule = (type: string, description: string) => {
    const currentRules = watchedTicketRules.filter(rule => rule.rule !== type);
    if (description) {
      currentRules.push({ rule: type, description });
    }
    setValue('ticket_rules', currentRules);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Regras Especiais de Ingressos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Until */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Grátis até
              </label>
              <Switch
                checked={!!getTicketRule('free_until')}
                onCheckedChange={(checked) => 
                  updateTicketRule('free_until', checked ? 'Entrada gratuita até data específica' : '')
                }
              />
            </div>
            {getTicketRule('free_until') && (
              <Textarea
                placeholder="Ex: Entrada gratuita até 22h"
                value={getTicketRule('free_until')?.description || ''}
                onChange={(e) => updateTicketRule('free_until', e.target.value)}
                rows={2}
              />
            )}
          </div>

          {/* Half Price Available */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Meia-entrada disponível
              </label>
              <Switch
                checked={!!getTicketRule('half_price')}
                onCheckedChange={(checked) => 
                  updateTicketRule('half_price', checked ? 'Meia-entrada disponível' : '')
                }
              />
            </div>
            {getTicketRule('half_price') && (
              <Textarea
                placeholder="Ex: Estudantes, idosos e pessoas com deficiência"
                value={getTicketRule('half_price')?.description || ''}
                onChange={(e) => updateTicketRule('half_price', e.target.value)}
                rows={2}
              />
            )}
          </div>
        </div>

        {/* Guest List Info */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Lista de Convidados / Observações
          </label>
          <Textarea
            placeholder="Informações sobre lista VIP, assessoria de imprensa, etc."
            value={getTicketRule('guestlist')?.description || ''}
            onChange={(e) => updateTicketRule('guestlist', e.target.value)}
            rows={3}
          />
        </div>

        {/* General Notes */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4" />
            Observações Gerais
          </label>
          <Textarea
            placeholder="Políticas de cancelamento, troca, reembolso, etc."
            value={getTicketRule('general_notes')?.description || ''}
            onChange={(e) => updateTicketRule('general_notes', e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};