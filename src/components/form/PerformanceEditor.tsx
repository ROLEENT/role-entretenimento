import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { DateTimePickerStandalone } from '@/components/form/DateTimePickerStandalone';

interface Performance {
  name: string;
  kind: 'live' | 'performance' | 'instalacao' | 'intervencao' | 'teatro' | 'outro';
  starts_at?: string;
  stage?: string;
  notes?: string;
}

interface PerformanceEditorProps {
  value: Performance[];
  onChange: (value: Performance[]) => void;
  disabled?: boolean;
}

const performanceKinds = [
  { value: 'live', label: 'Live/Música' },
  { value: 'performance', label: 'Performance' },
  { value: 'instalacao', label: 'Instalação' },
  { value: 'intervencao', label: 'Intervenção' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'outro', label: 'Outro' },
];

export const PerformanceEditor = ({ value, onChange, disabled }: PerformanceEditorProps) => {
  const [isAdding, setIsAdding] = useState(false);

  const addPerformance = () => {
    const newPerformance: Performance = {
      name: '',
      kind: 'performance',
    };
    onChange([...value, newPerformance]);
    setIsAdding(true);
  };

  const updatePerformance = (index: number, field: keyof Performance, newValue: any) => {
    const updated = value.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    );
    onChange(updated);
  };

  const removePerformance = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Performances Cênicas</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPerformance}
          disabled={disabled}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Performance
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Nenhuma performance adicionada</p>
          <p className="text-xs">Clique em "Adicionar Performance" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((performance, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Performance #{index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePerformance(index)}
                    disabled={disabled}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`performance-name-${index}`}>Nome*</Label>
                    <Input
                      id={`performance-name-${index}`}
                      value={performance.name}
                      onChange={(e) => updatePerformance(index, 'name', e.target.value)}
                      placeholder="Nome da performance..."
                      disabled={disabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`performance-kind-${index}`}>Tipo</Label>
                    <Select
                      value={performance.kind}
                      onValueChange={(value) => updatePerformance(index, 'kind', value)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {performanceKinds.map((kind) => (
                          <SelectItem key={kind.value} value={kind.value}>
                            {kind.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`performance-stage-${index}`}>Palco/Local</Label>
                    <Input
                      id={`performance-stage-${index}`}
                      value={performance.stage || ''}
                      onChange={(e) => updatePerformance(index, 'stage', e.target.value)}
                      placeholder="Palco principal, sala 2..."
                      disabled={disabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`performance-time-${index}`}>Horário</Label>
                    <DateTimePickerStandalone
                      id={`performance-time-${index}`}
                      value={performance.starts_at ? new Date(performance.starts_at) : undefined}
                      onChange={(date) => updatePerformance(index, 'starts_at', date?.toISOString())}
                      disabled={disabled}
                      placeholder="Selecione horário da performance..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`performance-notes-${index}`}>Observações</Label>
                  <Textarea
                    id={`performance-notes-${index}`}
                    value={performance.notes || ''}
                    onChange={(e) => updatePerformance(index, 'notes', e.target.value)}
                    placeholder="Informações adicionais sobre a performance..."
                    disabled={disabled}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};