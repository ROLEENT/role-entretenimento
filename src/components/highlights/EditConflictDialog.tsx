import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface EditConflictDialogProps {
  open: boolean;
  onReload: () => void;
  onOverwrite: () => void;
  conflictData?: {
    currentUpdatedAt: string;
    serverUpdatedAt: string;
    updatedBy?: string;
  };
}

export const EditConflictDialog = ({ 
  open, 
  onReload, 
  onOverwrite, 
  conflictData 
}: EditConflictDialogProps) => {
  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Conflito de Edição Detectado
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Este item foi modificado por outra pessoa enquanto você o editava.
            </p>
            
            {conflictData && (
              <div className="bg-muted p-3 rounded-md text-sm space-y-2">
                <div>
                  <strong>Sua versão:</strong>{' '}
                  {formatDateTime(conflictData.currentUpdatedAt)}
                </div>
                <div>
                  <strong>Versão no servidor:</strong>{' '}
                  {formatDateTime(conflictData.serverUpdatedAt)}
                  {conflictData.updatedBy && (
                    <span className="text-muted-foreground">
                      {' '}(por {conflictData.updatedBy})
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              <strong>Recarregar:</strong> Perde suas alterações e carrega a versão mais recente.<br/>
              <strong>Sobrescrever:</strong> Mantém suas alterações e sobrescreve a versão no servidor.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onReload}>
            🔄 Recarregar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onOverwrite}
            className="bg-destructive hover:bg-destructive/90"
          >
            ⚠️ Sobrescrever
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};