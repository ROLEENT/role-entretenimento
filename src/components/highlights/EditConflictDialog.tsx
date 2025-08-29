import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface EditConflictDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReload: () => void;
  onOverwrite: () => void;
  lastModified?: string;
}

export const EditConflictDialog = ({ 
  isOpen, 
  onOpenChange, 
  onReload, 
  onOverwrite,
  lastModified 
}: EditConflictDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Conflito de edição detectado
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Este destaque foi modificado por outro usuário enquanto você estava editando.
            </p>
            {lastModified && (
              <p className="text-sm text-muted-foreground">
                Última modificação: {new Date(lastModified).toLocaleString('pt-BR')}
              </p>
            )}
            <p className="font-medium">
              Escolha uma das opções abaixo:
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onReload}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar dados atuais
          </Button>
          <AlertDialogAction 
            onClick={onOverwrite}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <AlertTriangle className="w-4 h-4" />
            Sobrescrever mesmo assim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};