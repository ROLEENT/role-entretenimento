import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage } from '@/lib/simpleUpload';

interface Venue {
  id?: string;
  name: string;
  slug?: string;
  address: string;
  city: string;
  state: string;
  map_url?: string;
  capacity?: number;
  cover_url?: string;
  contacts_json?: {
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
  };
}

interface VenueFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue?: Venue | null;
  onSuccess: () => void;
}

export const VenueFormModal = ({ open, onOpenChange, venue, onSuccess }: VenueFormModalProps) => {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    city: '',
    state: '',
    map_url: '',
    capacity: '',
    cover_url: '',
    contacts: {
      phone: '',
      email: '',
      website: '',
      instagram: ''
    }
  });

  const cities = ['Porto Alegre', 'Florianópolis', 'Curitiba', 'São Paulo', 'Rio de Janeiro'];
  const states = [
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'PR', label: 'Paraná' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'RJ', label: 'Rio de Janeiro' }
  ];

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name,
        slug: venue.slug || '',
        address: venue.address,
        city: venue.city,
        state: venue.state,
        map_url: venue.map_url || '',
        capacity: venue.capacity?.toString() || '',
        cover_url: venue.cover_url || '',
        contacts: {
          phone: venue.contacts_json?.phone || '',
          email: venue.contacts_json?.email || '',
          website: venue.contacts_json?.website || '',
          instagram: venue.contacts_json?.instagram || ''
        }
      });
    } else {
      resetForm();
    }
  }, [venue, open]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.city || !formData.state) {
      toast.error('Nome, endereço, cidade e estado são obrigatórios');
      return;
    }

    try {
      setSaving(true);
      
      const slug = formData.slug || generateSlug(formData.name);
      
      // Check if slug already exists (excluding current venue if editing)
      const { data: existingVenue } = await supabase
        .from('venues')
        .select('id')
        .eq('slug', slug)
        .not('id', 'eq', venue?.id || 'none')
        .single();

      if (existingVenue) {
        toast.error('URL já existe. Escolha um nome diferente ou defina uma URL personalizada.');
        return;
      }

      const venueData = {
        name: formData.name,
        slug,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        map_url: formData.map_url || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        cover_url: formData.cover_url || null,
        contacts_json: formData.contacts
      };

      if (venue) {
        const { error } = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', venue.id);
        
        if (error) throw error;
        toast.success('Local atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('venues')
          .insert([venueData]);
        
        if (error) throw error;
        toast.success('Local criado com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar local:', error);
      toast.error(error.message || 'Erro ao salvar local');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadImage(file, 'venues');
      setFormData(prev => ({ ...prev, cover_url: imageUrl }));
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      address: '',
      city: '',
      state: '',
      map_url: '',
      capacity: '',
      cover_url: '',
      contacts: {
        phone: '',
        email: '',
        website: '',
        instagram: ''
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {venue ? 'Editar Local' : 'Novo Local'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do local"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL (slug)</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-do-local (opcional)"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Endereço *</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Rua, número, bairro"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Cidade *</label>
              <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Estado *</label>
              <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Capacidade</label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">URL do Google Maps</label>
            <Input
              value={formData.map_url}
              onChange={(e) => setFormData(prev => ({ ...prev, map_url: e.target.value }))}
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Imagem de Capa</label>
            <div className="space-y-2">
              {formData.cover_url && (
                <div className="flex items-center gap-2">
                  <img src={formData.cover_url} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, cover_url: '' }))}
                  >
                    Remover
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
                />
                {uploading && <span className="text-sm text-muted-foreground">Enviando...</span>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contatos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={formData.contacts.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contacts: { ...prev.contacts, phone: e.target.value }
                  }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.contacts.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contacts: { ...prev.contacts, email: e.target.value }
                  }))}
                  placeholder="contato@local.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={formData.contacts.website}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contacts: { ...prev.contacts, website: e.target.value }
                  }))}
                  placeholder="https://exemplo.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Instagram</label>
                <Input
                  value={formData.contacts.instagram}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contacts: { ...prev.contacts, instagram: e.target.value }
                  }))}
                  placeholder="@instagram"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={saving || uploading} className="flex-1">
              {saving ? 'Salvando...' : venue ? 'Atualizar' : 'Criar'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};