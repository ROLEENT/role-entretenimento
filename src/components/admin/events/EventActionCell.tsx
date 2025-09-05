import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Edit, Copy, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { restoreEvent, hardDeleteEvent } from "@/lib/api/eventBulkActions";

interface Event {
  id: string;
  title: string;
  slug: string;
  status: string;
  deleted_at?: string | null;
}

interface EventActionCellProps {
  event: Event;
  onEventDeleted: () => void;
  onEventDuplicated?: (event: Event) => void;
  onEventRestored?: () => void;
}

export function EventActionCell({ event, onEventDeleted, onEventDuplicated, onEventRestored }: EventActionCellProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isDeleted = !!event.deleted_at;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('soft_delete_event', {
        p_event_id: event.id
      });

      if (error) {
        console.error('❌ Erro ao excluir evento:', error);
        toast.error(`Erro ao excluir evento: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error('Erro: permissão negada para excluir evento');
        return;
      }

      toast.success('Evento movido para lixeira!');
      setDeleteDialogOpen(false);
      onEventDeleted();
      
    } catch (error: any) {
      console.error('❌ Erro inesperado ao excluir evento:', error);
      toast.error(`Erro inesperado: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async () => {
    try {
      await restoreEvent(event.id);
      toast.success("Evento restaurado com sucesso");
      onEventRestored?.();
    } catch (error) {
      toast.error("Erro ao restaurar evento");
    }
  };

  const handleHardDelete = async () => {
    try {
      await hardDeleteEvent(event.id);
      toast.success("Evento excluído definitivamente");
      onEventDeleted();
    } catch (error) {
      toast.error("Erro ao excluir evento definitivamente");
    }
  };

  const handleDuplicate = () => {
    if (onEventDuplicated) {
      onEventDuplicated(event);
    }
    toast.success('Funcionalidade de duplicação será implementada em breve');
  };

  const handleView = () => {
    navigate(`/agenda/${event.slug || event.id}`);
  };

  const handleEdit = () => {
    navigate(`/admin-v3/eventos/${event.id}/editar`);
  };

  return (
    <div className="relative flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-md hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            onClick={(e) => e.stopPropagation()}
            aria-haspopup="menu"
            aria-label={`Ações para o evento ${event.title}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          side="bottom"
          className="z-50 min-w-44"
        >
          {!isDeleted && (
            <>
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Evento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Mover para lixeira
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mover para lixeira</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja mover o evento "{event.title}" para a lixeira? 
                      Você poderá restaurá-lo depois.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Movendo...' : 'Mover para lixeira'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          
          {isDeleted && (
            <>
              <DropdownMenuItem onClick={handleRestore}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restaurar
              </DropdownMenuItem>
              
              <AlertDialog open={hardDeleteDialogOpen} onOpenChange={setHardDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Excluir definitivamente
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir definitivamente</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir definitivamente o evento "{event.title}"? 
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleHardDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir definitivamente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  );
}