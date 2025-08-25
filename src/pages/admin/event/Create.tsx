import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';
import { Calendar, MapPin, Clock, Plus } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  city: string;
  state: string;
  date_start: string;
  date_end: string;
  price_min: number;
  price_max: number;
  image_url: string;
}

export default function EventCreate() {
  const navigate = useNavigate();
  const { triggerNewEventNotification } = useNotificationTriggers();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    city: '',
    state: '',
    date_start: '',
    date_end: '',
    price_min: 0,
    price_max: 0,
    image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.city || !formData.date_start) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, cidade e data de início",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...formData,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger notificação automática para novos eventos
      if (data) {
        triggerNewEventNotification({
          event_id: data.id,
          title: data.title,
          city: data.city,
          date_start: data.date_start,
          venue: 'Venue a definir'
        });
      }

      toast({
        title: "Evento criado!",
        description: "Notificações automáticas foram enviadas aos usuários interessados"
      });

      navigate('/admin/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erro ao criar evento",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Novo Evento
          </CardTitle>
          <CardDescription>
            Preencha as informações do evento. Notificações automáticas serão enviadas aos usuários.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título *</label>
                <Input
                  placeholder="Nome do evento"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade *</label>
                <Select value={formData.city} onValueChange={(value) => updateFormData('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sao_paulo">São Paulo</SelectItem>
                    <SelectItem value="rio_de_janeiro">Rio de Janeiro</SelectItem>
                    <SelectItem value="belo_horizonte">Belo Horizonte</SelectItem>
                    <SelectItem value="porto_alegre">Porto Alegre</SelectItem>
                    <SelectItem value="curitiba">Curitiba</SelectItem>
                    <SelectItem value="florianopolis">Florianópolis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                placeholder="Descreva o evento..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data de Início *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.date_start}
                  onChange={(e) => updateFormData('date_start', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Data de Término
                </label>
                <Input
                  type="datetime-local"
                  value={formData.date_end}
                  onChange={(e) => updateFormData('date_end', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Mínimo (R$)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_min}
                  onChange={(e) => updateFormData('price_min', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Máximo (R$)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_max}
                  onChange={(e) => updateFormData('price_max', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL da Imagem</label>
              <Input
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.image_url}
                onChange={(e) => updateFormData('image_url', e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/events')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Criando..." : "Criar Evento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}