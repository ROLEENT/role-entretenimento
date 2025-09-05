import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar,
  MapPin,
  User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventCompletionBadge } from '@/components/admin/common/CompletionBadgeList';
import { EventActionCell } from './EventActionCell';

interface Event {
  id: string;
  title: string;
  slug: string;
  status: string;
  city?: string;
  starts_at?: string;
  created_at: string;
  venue?: { id: string; name: string; location?: string };
  organizer?: { id: string; name: string };
}

interface AdminEventTableProps {
  events: Event[];
  loading: boolean;
  error: any;
  onRefresh: () => void;
  onBulkAction: (action: string, eventIds: string[]) => void;
}

export function AdminEventTable({
  events,
  loading,
  error,
  onRefresh,
  onBulkAction,
}: AdminEventTableProps) {
  const navigate = useNavigate();
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents([...selectedEvents, eventId]);
    } else {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(events.map(event => event.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Publicado";
      case "draft":
        return "Rascunho";
      case "archived":
        return "Arquivado";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Carregando eventos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Erro ao carregar eventos: {error.message}</p>
        <Button onClick={onRefresh} variant="outline" size="sm" className="mt-2">
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum evento encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedEvents.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedEvents.length} evento(s) selecionado(s)
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBulkAction("delete", selectedEvents)}
          >
            Excluir Selecionados
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedEvents.length === events.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Organizador</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-12 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={(checked) => 
                      handleSelectEvent(event.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{event.title}</div>
                    {event.city && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.city}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(event.status)}>
                    {getStatusLabel(event.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <EventCompletionBadge event={event as any} />
                </TableCell>
                <TableCell>
                  {event.starts_at ? (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(event.starts_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {event.venue ? (
                    <div className="text-sm">
                      {event.venue.name}
                      {event.venue.location && (
                        <div className="text-muted-foreground">{event.venue.location}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {event.organizer ? (
                    <div className="flex items-center text-sm">
                      <User className="h-3 w-3 mr-1" />
                      {event.organizer.name}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(event.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell className="relative text-right">
                  <EventActionCell 
                    event={event}
                    onEventDeleted={onRefresh}
                    onEventDuplicated={(event) => {
                      // TODO: Implementar duplicação
                      console.log('Duplicar evento:', event);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}