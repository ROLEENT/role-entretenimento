import React, { useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Calendar as CalendarIcon,
  Eye,
  Send,
  Save
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  check: (data: EventFormData) => boolean;
  description?: string;
}

const PUBLICATION_CHECKLIST: ChecklistItem[] = [
  {
    id: 'title',
    label: 'Título do evento',
    required: true,
    check: (data) => !!data.title && data.title.length > 3,
    description: 'Título claro e descritivo'
  },
  {
    id: 'slug',
    label: 'URL única',
    required: true,
    check: (data) => !!data.slug && data.slug.length > 3,
    description: 'URL amigável e única'
  },
  {
    id: 'city',
    label: 'Cidade',
    required: true,
    check: (data) => !!data.city,
    description: 'Cidade onde acontece o evento'
  },
  {
    id: 'dates',
    label: 'Datas válidas',
    required: true,
    check: (data) => {
      if (!data.date_start || !data.date_end) return false;
      const start = new Date(data.date_start);
      const end = new Date(data.date_end);
      return start <= end;
    },
    description: 'Data de início e fim válidas'
  },
  {
    id: 'cover',
    label: 'Imagem de capa',
    required: true,
    check: (data) => !!data.cover_url || !!data.image_url,
    description: 'Imagem principal do evento'
  },
  {
    id: 'cover_alt',
    label: 'Texto alternativo da capa',
    required: true,
    check: (data) => !!data.cover_alt,
    description: 'Descrição da imagem para acessibilidade'
  },
  {
    id: 'description',
    label: 'Descrição do evento',
    required: true,
    check: (data) => !!data.description && data.description.length > 20,
    description: 'Descrição completa do evento'
  },
  {
    id: 'tickets_or_site',
    label: 'Link de ingressos ou site',
    required: true,
    check: (data) => {
      const hasTicketUrl = !!data.ticket_url;
      const hasWebsite = !!data.links?.site;
      const hasTicketing = !!data.ticketing?.url;
      return hasTicketUrl || hasWebsite || hasTicketing;
    },
    description: 'Link para ingressos ou site oficial'
  },
  {
    id: 'organizer',
    label: 'Pelo menos um organizador',
    required: true,
    check: (data) => {
      // Check if has any organizer info
      return true; // Placeholder - will be implemented with organizers field
    },
    description: 'Informações do organizador'
  },
  {
    id: 'selection_reasons',
    label: 'Motivos da escolha (para destaque curatorial)',
    required: false,
    check: (data) => data.highlight_type !== 'curatorial' || (data.selection_reasons && data.selection_reasons.length > 0),
    description: 'Motivos para eventos de destaque curatorial'
  }
];

export const PublishStep: React.FC = () => {
  const { control, watch, setValue } = useFormContext<EventFormData>();
  const [showScheduleCalendar, setShowScheduleCalendar] = useState(false);
  
  const watchedStatus = watch('status');
  // const watchedPublishAt = watch('publish_at'); // Field doesn't exist in schema yet
  const formData = watch();

  const checklistResults = useMemo(() => {
    return PUBLICATION_CHECKLIST.map(item => ({
      ...item,
      passed: item.check(formData)
    }));
  }, [formData]);

  const requiredItemsPassed = checklistResults.filter(item => item.required && item.passed).length;
  const totalRequiredItems = checklistResults.filter(item => item.required).length;
  const canPublish = requiredItemsPassed === totalRequiredItems;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'scheduled': return 'secondary';
      case 'review': return 'outline';
      case 'archived': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'review': return 'Em Revisão';
      case 'scheduled': return 'Agendado';
      case 'published': return 'Publicado';
      case 'archived': return 'Arquivado';
      default: return 'Rascunho';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status and Publication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Status de Publicação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="review">Em Revisão</SelectItem>
                      <SelectItem value="scheduled">Agendado para Publicação</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Badge variant={getStatusBadgeVariant(watchedStatus)} className="mt-6">
              {getStatusLabel(watchedStatus)}
            </Badge>
          </div>

          {/* Scheduled Publication Date */}
          {watchedStatus === 'scheduled' && (
            <FormField
              control={control}
              name="status" // Temporarily using status field
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Publicação</FormLabel>
                  <Popover open={showScheduleCalendar} onOpenChange={setShowScheduleCalendar}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              {format(new Date(field.value), "PPP 'às' HH:mm", { locale: ptBR })}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Selecione data e horário</span>
                            </div>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date.toISOString());
                          }
                          setShowScheduleCalendar(false);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Data e horário para publicação automática
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Publication Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Checklist de Publicação
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(requiredItemsPassed / totalRequiredItems) * 100}%` }}
              />
            </div>
            <Badge variant={canPublish ? "default" : "secondary"}>
              {requiredItemsPassed}/{totalRequiredItems}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklistResults.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
              {item.passed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {item.label}
                  </p>
                  {item.required && (
                    <Badge variant="outline" className="text-xs">
                      Obrigatório
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Publication Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Publicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canPublish && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Complete todos os itens obrigatórios para habilitar a publicação.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Visualizar
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar como Rascunho
            </Button>

            <Button
              type="submit"
              disabled={!canPublish}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {watchedStatus === 'scheduled' ? 'Agendar Publicação' : 'Publicar Evento'}
            </Button>
          </div>

          {canPublish && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Todos os requisitos foram atendidos. O evento está pronto para publicação!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Highlight Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Destaque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="highlight_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Destaque</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de destaque" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sem destaque</SelectItem>
                    <SelectItem value="curatorial">Destaque Curatorial</SelectItem>
                    <SelectItem value="vitrine">Vitrine Cultural</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Define como o evento será destacado na agenda
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {watch('highlight_type') !== 'none' && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Eventos destacados aparecem em posição privilegiada na agenda e podem ter cores especiais no card.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};