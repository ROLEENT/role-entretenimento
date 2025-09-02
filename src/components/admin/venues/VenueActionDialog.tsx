import React from 'react';
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

interface VenueActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'duplicate' | 'deactivate';
  venueName: string;
  isActive: boolean;
  onConfirm: () => void;
}

export const VenueActionDialog: React.FC<VenueActionDialogProps> = ({
  open,
  onOpenChange,
  action,
  venueName,
  isActive,
  onConfirm,
}) => {
  const getTitle = () => {
    if (action === 'duplicate') {
      return 'Duplicar Local';
    }
    return isActive ? 'Desativar Local' : 'Ativar Local';
  };

  const getDescription = () => {
    if (action === 'duplicate') {
      return `Tem certeza que deseja duplicar o local "${venueName}"? Uma cópia será criada com o nome "${venueName} (Cópia)".`;
    }
    if (isActive) {
      return `Tem certeza que deseja desativar o local "${venueName}"? O local não aparecerá mais nos resultados de busca pública.`;
    }
    return `Tem certeza que deseja ativar o local "${venueName}"? O local voltará a aparecer nos resultados de busca pública.`;
  };

  const getActionText = () => {
    if (action === 'duplicate') {
      return 'Duplicar';
    }
    return isActive ? 'Desativar' : 'Ativar';
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={action === 'deactivate' && isActive ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {getActionText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};