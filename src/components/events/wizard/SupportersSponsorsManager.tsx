import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Heart, Star } from 'lucide-react';

interface SupporterSponsor {
  name: string;
  tier?: string;
}

interface SupportersSponsorsManagerProps {
  type: 'supporters' | 'sponsors';
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SupportersSponsorsManager: React.FC<SupportersSponsorsManagerProps> = ({
  type,
  title,
  icon: Icon
}) => {
  const { watch, setValue } = useFormContext<EventFormData>();
  const [newItemName, setNewItemName] = useState('');
  const [newItemTier, setNewItemTier] = useState('');
  
  // Use partners field with filtering by role
  const items = (watch('partners') || []).filter(p => 
    type === 'supporters' ? p.role === 'supporter' : p.role === 'sponsor'
  );

  const addItem = () => {
    if (newItemName.trim()) {
      const currentPartners = watch('partners') || [];
      const newPartner = {
        partner_id: '',
        partner_type: type === 'supporters' ? 'supporter' as const : 'sponsor' as const,
        role: type === 'supporters' ? 'supporter' as const : 'sponsor' as const,
        display_name: newItemName.trim(),
        position: currentPartners.length,
        is_main: false,
        tier: newItemTier || undefined
      };
      setValue('partners', [...currentPartners, newPartner]);
      setNewItemName('');
      setNewItemTier('');
    }
  };

  const removeItem = (index: number) => {
    const currentPartners = watch('partners') || [];
    const itemToRemove = items[index];
    const updatedPartners = currentPartners.filter(p => 
      !(p.role === itemToRemove.role && p.display_name === itemToRemove.display_name)
    );
    setValue('partners', updatedPartners);
  };

  const tierOptions = type === 'sponsors' 
    ? ['Diamante', 'Ouro', 'Prata', 'Bronze']
    : ['Principal', 'Parceiro', 'Apoio'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
          <Badge variant="outline">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new item */}
        <div className="space-y-3">
          <Input
            placeholder={`Nome do ${type === 'supporters' ? 'apoiador' : 'patrocinador'}`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          
          <div className="flex gap-2">
            <Select value={newItemTier} onValueChange={setNewItemTier}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Nível (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {tierOptions.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              type="button"
              onClick={addItem}
              disabled={!newItemName.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* List of items */}
        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {type === 'supporters' ? 'Apoiadores' : 'Patrocinadores'} adicionados:
            </p>
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{item.display_name}</span>
                  {item.tier && (
                    <Badge variant="secondary">{item.tier}</Badge>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum {type === 'supporters' ? 'apoiador' : 'patrocinador'} adicionado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};