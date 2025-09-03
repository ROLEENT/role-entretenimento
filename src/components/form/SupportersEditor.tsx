import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface Supporter {
  agent_id?: string;
  name?: string;
  tier?: string;
}

interface SupportersEditorProps {
  value: Supporter[];
  onChange: (value: Supporter[]) => void;
  disabled?: boolean;
  title: string;
  addButtonText: string;
}

const supportTiers = [
  { value: 'principal', label: 'Principal' },
  { value: 'oficial', label: 'Oficial' },
  { value: 'apoio', label: 'Apoio' },
  { value: 'media', label: 'Mídia' },
];

export const SupportersEditor = ({ 
  value, 
  onChange, 
  disabled, 
  title,
  addButtonText 
}: SupportersEditorProps) => {
  const addSupporter = () => {
    const newSupporter: Supporter = {
      name: '',
      tier: 'apoio',
    };
    onChange([...value, newSupporter]);
  };

  const updateSupporter = (index: number, field: keyof Supporter, newValue: string) => {
    const updated = value.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    );
    onChange(updated);
  };

  const removeSupporter = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{title}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSupporter}
          disabled={disabled}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          {addButtonText}
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Nenhum item adicionado</p>
          <p className="text-xs">Clique em "{addButtonText}" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((supporter, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{title.slice(0, -1)} #{index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSupporter(index)}
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
                    <Label htmlFor={`supporter-name-${index}`}>Nome*</Label>
                    <Input
                      id={`supporter-name-${index}`}
                      value={supporter.name || ''}
                      onChange={(e) => updateSupporter(index, 'name', e.target.value)}
                      placeholder="Nome da empresa/organização..."
                      disabled={disabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`supporter-tier-${index}`}>Categoria</Label>
                    <Select
                      value={supporter.tier}
                      onValueChange={(value) => updateSupporter(index, 'tier', value)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {supportTiers.map((tier) => (
                          <SelectItem key={tier.value} value={tier.value}>
                            {tier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};