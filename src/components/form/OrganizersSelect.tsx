import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, User } from 'lucide-react';
import { toast } from 'sonner';

interface Organizer {
  id: string;
  name: string;
  email?: string;
}

interface OrganizersSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const OrganizersSelect: React.FC<OrganizersSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Selecione um organizador"
}) => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrganizerName, setNewOrganizerName] = useState('');
  const [newOrganizerEmail, setNewOrganizerEmail] = useState('');

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      setOrganizers(data || []);
    } catch (error) {
      console.error('Error fetching organizers:', error);
      toast.error('Erro ao carregar organizadores');
    } finally {
      setLoading(false);
    }
  };

  const createOrganizer = async () => {
    if (!newOrganizerName.trim()) {
      toast.error('Nome do organizador é obrigatório');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('organizers')
        .insert({
          name: newOrganizerName.trim(),
          email: newOrganizerEmail.trim() || null
        })
        .select()
        .single();

      if (error) throw error;

      setOrganizers(prev => [...prev, data]);
      onValueChange(data.id);
      setNewOrganizerName('');
      setNewOrganizerEmail('');
      setIsDialogOpen(false);
      toast.success('Organizador criado com sucesso!');
    } catch (error) {
      console.error('Error creating organizer:', error);
      toast.error('Erro ao criar organizador');
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const selectedOrganizer = organizers.find(org => org.id === value);

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {organizers.map((organizer) => (
            <SelectItem key={organizer.id} value={organizer.id}>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <div>
                  <div className="font-medium">{organizer.name}</div>
                  {organizer.email && (
                    <div className="text-sm text-muted-foreground">{organizer.email}</div>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Organizador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                value={newOrganizerName}
                onChange={(e) => setNewOrganizerName(e.target.value)}
                placeholder="Nome do organizador"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newOrganizerEmail}
                onChange={(e) => setNewOrganizerEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={createOrganizer}
                disabled={!newOrganizerName.trim()}
              >
                Criar Organizador
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};