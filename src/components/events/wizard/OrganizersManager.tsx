import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Crown, Users, Building } from 'lucide-react';
import { ComboboxAsync } from '@/components/ui/combobox-async';

interface Organizer {
  id?: string;
  agent_id?: string;
  name: string;
  is_primary?: boolean;
}

export const OrganizersManager: React.FC = () => {
  const { control, watch, setValue } = useFormContext<EventFormData>();
  const [newOrganizerName, setNewOrganizerName] = useState('');
  
  // Use partners field from schema instead of non-existent organizers field
  const organizers = (watch('partners') || []).filter(p => p.role === 'organizer');

  const addOrganizer = () => {
    if (newOrganizerName.trim()) {
      const currentPartners = watch('partners') || [];
      const newPartner = {
        partner_id: '',
        partner_type: 'organizer' as const,
        role: 'organizer' as const,
        display_name: newOrganizerName.trim(),
        position: currentPartners.length,
        is_main: organizers.length === 0
      };
      setValue('partners', [...currentPartners, newPartner]);
      setNewOrganizerName('');
    }
  };

  const removeOrganizer = (index: number) => {
    const currentPartners = watch('partners') || [];
    const organizerToRemove = organizers[index];
    const updatedPartners = currentPartners.filter(p => 
      !(p.role === 'organizer' && p.display_name === organizerToRemove.display_name)
    );
    setValue('partners', updatedPartners);
  };

  const setPrimary = (index: number) => {
    const currentPartners = watch('partners') || [];
    const selectedOrganizer = organizers[index];
    const updatedPartners = currentPartners.map(p => ({
      ...p,
      is_main: p.role === 'organizer' && p.display_name === selectedOrganizer.display_name
    }));
    setValue('partners', updatedPartners);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-5 h-5" />
          Organizadores do Evento
          <Badge variant="outline">{organizers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new organizer */}
        <div className="flex gap-2">
          <Input
            placeholder="Nome do organizador"
            value={newOrganizerName}
            onChange={(e) => setNewOrganizerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addOrganizer();
              }
            }}
          />
          <Button
            type="button"
            onClick={addOrganizer}
            disabled={!newOrganizerName.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* List of organizers */}
        {organizers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Organizadores adicionados:</p>
            {organizers.map((organizer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{organizer.display_name}</span>
                  {organizer.is_main && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Principal
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {!organizer.is_main && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPrimary(index)}
                    >
                      Tornar Principal
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOrganizer(index)}
                    className="text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {organizers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum organizador adicionado</p>
            <p className="text-sm">Adicione pelo menos um organizador para o evento</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};