import { MoreHorizontal, Eye, Edit, Trash2, Copy, Instagram, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { createAdminClient, handleAdminError } from "@/lib/adminClient";
import { useState } from "react";

interface RowActionsProps {
  entity: 'artists' | 'organizers' | 'venues';
  id: string;
  name: string;
  slug?: string;
  instagram?: string;
  editPath: string;
  viewPath: string;
  onDuplicate?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onAfterDelete?: () => void;
  isLoading?: boolean;
  showV5Option?: boolean;
}

export function RowActions({
  entity,
  id,
  name,
  slug,
  instagram,
  editPath,
  viewPath,
  onDuplicate,
  onStatusChange,
  onAfterDelete,
  isLoading = false,
  showV5Option = true,
}: RowActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const adminClient = await createAdminClient();
      
      // Use soft delete for consistency
      await adminClient.restCall(`${entity}?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          deleted_at: new Date().toISOString(),
          status: 'inactive',
          updated_at: new Date().toISOString()
        }),
      });

      toast.success(`${entity === 'artists' ? 'Artista' : entity === 'organizers' ? 'Organizador' : 'Local'} excluído com sucesso`);
      onAfterDelete?.();
    } catch (error: any) {
      const errorMessage = handleAdminError(error);
      console.error('Erro ao excluir:', error);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(id);
    } else {
      toast.info('Função de duplicar não implementada ainda');
    }
  };

  const handleStatusChange = () => {
    if (onStatusChange) {
      onStatusChange(id, 'active');
    } else {
      toast.info('Função de alterar status não implementada ainda');
    }
  };

  const getV5EditPath = () => {
    switch (entity) {
      case 'artists':
        return `/admin-v3/artistas-v5/${id}`;
      case 'organizers':
        return `/admin-v3/organizadores-v5/${id}`;
      case 'venues':
        return `/admin-v3/venues-v5/${id}`;
      default:
        return editPath;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0"
          disabled={isLoading || isDeleting}
        >
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50">
        <DropdownMenuItem asChild>
          <Link to={editPath}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>

        {showV5Option && (
          <DropdownMenuItem asChild>
            <Link to={getV5EditPath()}>
              <Sparkles className="mr-2 h-4 w-4" />
              <div className="flex items-center gap-2">
                Editar V5
                <Badge variant="secondary" className="text-xs">NOVO</Badge>
              </div>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem asChild>
          <Link to={viewPath}>
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Link>
        </DropdownMenuItem>

        {instagram && (
          <DropdownMenuItem asChild>
            <a 
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="mr-2 h-4 w-4" />
              Instagram
            </a>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicar
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleStatusChange}>
          <Eye className="mr-2 h-4 w-4" />
          Alterar Status
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()}
              className="text-destructive focus:text-destructive"
              data-testid="row-delete"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso irá excluir permanentemente{' '}
                <strong>{name}</strong> e remover todos os dados associados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="row-delete-confirm"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}