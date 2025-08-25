import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Save, Calendar, MapPin, Clock, Bell } from 'lucide-react';
import { usePersonalCalendar, CalendarEvent } from '@/hooks/usePersonalCalendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
}

const DEFAULT_COLORS = [
  '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', 
  '#10B981', '#F97316', '#EC4899', '#6366F1'
];

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const { addEvent, updateEvent, deleteEvent } = usePersonalCalendar();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    all_day: false,
    location: '',
    color: '#3B82F6',
    reminder_minutes: [15]
  });
  
  const [loading, setLoading] = useState(false);

  // Preencher formulário quando evento é selecionado
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        start_datetime: event.start_datetime.slice(0, 16), // Remove timezone for input
        end_datetime: event.end_datetime.slice(0, 16),
        all_day: event.all_day,
        location: event.location || '',
        color: event.color,
        reminder_minutes: event.reminder_minutes
      });
    } else {
      // Reset para novo evento
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      setFormData({
        title: '',
        description: '',
        start_datetime: format(now, "yyyy-MM-dd'T'HH:mm"),
        end_datetime: format(oneHourLater, "yyyy-MM-dd'T'HH:mm"),
        all_day: false,
        location: '',
        color: '#3B82F6',
        reminder_minutes: [15]
      });
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    setLoading(true);
    
    try {
      const eventData = {
        ...formData,
        start_datetime: new Date(formData.start_datetime).toISOString(),
        end_datetime: new Date(formData.end_datetime).toISOString(),
        is_synced: false
      };

      if (event) {
        await updateEvent(event.id, eventData);
      } else {
        await addEvent(eventData);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    setLoading(true);
    
    try {
      await deleteEvent(event.id);
      onClose();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{event ? 'Editar Evento' : 'Novo Evento'}</span>
            {event?.event_id && (
              <Badge variant="secondary" className="ml-2">
                Evento ROLÊ
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Digite o título do evento"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Adicione uma descrição..."
              rows={3}
            />
          </div>

          {/* Dia inteiro */}
          <div className="flex items-center space-x-2">
            <Switch
              id="all-day"
              checked={formData.all_day}
              onCheckedChange={(checked) => handleChange('all_day', checked)}
            />
            <Label htmlFor="all-day">Dia inteiro</Label>
          </div>

          {/* Datas e horários */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start">Início *</Label>
              <Input
                id="start"
                type={formData.all_day ? 'date' : 'datetime-local'}
                value={formData.all_day ? formData.start_datetime.split('T')[0] : formData.start_datetime}
                onChange={(e) => {
                  const value = formData.all_day ? e.target.value + 'T00:00' : e.target.value;
                  handleChange('start_datetime', value);
                }}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="end">Fim</Label>
              <Input
                id="end"
                type={formData.all_day ? 'date' : 'datetime-local'}
                value={formData.all_day ? formData.end_datetime.split('T')[0] : formData.end_datetime}
                onChange={(e) => {
                  const value = formData.all_day ? e.target.value + 'T23:59' : e.target.value;
                  handleChange('end_datetime', value);
                }}
              />
            </div>
          </div>

          {/* Local */}
          <div>
            <Label htmlFor="location" className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Local</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Adicione um local..."
            />
          </div>

          {/* Cor */}
          <div>
            <Label>Cor do evento</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color ? 'border-foreground scale-110' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </div>
          </div>

          {/* Lembretes */}
          <div>
            <Label className="flex items-center space-x-1">
              <Bell className="h-4 w-4" />
              <span>Lembretes</span>
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[5, 15, 30, 60, 1440].map((minutes) => {
                const isSelected = formData.reminder_minutes.includes(minutes);
                const label = minutes < 60 ? `${minutes}min` : 
                             minutes === 60 ? '1h' : 
                             minutes === 1440 ? '1 dia' : `${minutes}min`;
                
                return (
                  <Button
                    key={minutes}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newReminders = isSelected 
                        ? formData.reminder_minutes.filter(m => m !== minutes)
                        : [...formData.reminder_minutes, minutes];
                      handleChange('reminder_minutes', newReminders);
                    }}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-between pt-4">
            {event && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
            
            <div className="flex space-x-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={loading || !formData.title.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarEventModal;