import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SelectionReasonsManager: React.FC = () => {
  const { control, watch, setValue } = useFormContext<EventFormData>();
  const [newReason, setNewReason] = useState('');
  
  const selectionReasons = watch('selection_reasons') || [];
  const highlightType = watch('highlight_type');

  const addReason = () => {
    if (newReason.trim() && !selectionReasons.includes(newReason.trim())) {
      const updatedReasons = [...selectionReasons, newReason.trim()];
      setValue('selection_reasons', updatedReasons);
      setNewReason('');
    }
  };

  const removeReason = (reasonToRemove: string) => {
    const updatedReasons = selectionReasons.filter(reason => reason !== reasonToRemove);
    setValue('selection_reasons', updatedReasons);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addReason();
    }
  };

  // Only show for curatorial highlights
  if (highlightType !== 'curatorial') {
    return null;
  }

  return (
    <FormField
      control={control}
      name="selection_reasons"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Motivos da Escolha *</FormLabel>
          <FormDescription>
            Explique por que este evento merece destaque curatorial. Adicione motivos específicos que justifiquem a seleção.
          </FormDescription>
          
          {/* Add new reason */}
          <div className="flex gap-2">
            <FormControl>
              <Input
                placeholder="Ex: Primeira vez no Brasil, lineup exclusivo, venue histórico..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
            </FormControl>
            <Button
              type="button"
              onClick={addReason}
              disabled={!newReason.trim() || selectionReasons.includes(newReason.trim())}
              size="sm"
              className="px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Display selected reasons */}
          {selectionReasons.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Motivos selecionados:</p>
              <div className="flex flex-wrap gap-2">
                {selectionReasons.map((reason, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {reason}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReason(reason)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectionReasons.length} motivo{selectionReasons.length !== 1 ? 's' : ''} adicionado{selectionReasons.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};