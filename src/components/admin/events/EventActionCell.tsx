import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Edit, Copy, Trash2 } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface EventActionCellProps {
  event: Event;
  onEventDeleted: () => void;
  onEventDuplicated?: (event: Event) => void;
}

export function EventActionCell({ event, onEventDeleted, onEventDuplicated }: EventActionCellProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('🗑️ Iniciando soft delete do evento:', event.id);
      
      // Use soft delete function
      const { error } = await supabase.rpc('soft_delete_event', {
        p_event_id: event.id
      });

      if (error) {
        console.error('❌ Erro no soft delete:', error);
        throw error;
      }

      console.log('✅ Evento excluído com sucesso (soft delete)');
      toast.success('Evento excluído com sucesso!');
      onEventDeleted(); // Trigger refresh
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('❌ Erro ao excluir evento:', error);
      toast.error('Erro ao excluir evento: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsDeleting(false);
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
          // Portal is automatically handled by Radix UI
        >
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
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento "{event.title}"? 
              Esta ação pode ser revertida pelo administrador se necessário.
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
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}