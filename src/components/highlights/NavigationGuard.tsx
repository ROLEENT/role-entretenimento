import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface NavigationGuardProps {
  hasUnsavedChanges: boolean;
  onSave?: () => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NavigationGuard = ({ 
  hasUnsavedChanges, 
  onSave,
  isOpen,
  onOpenChange
}: NavigationGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleSaveAndContinue = async () => {
    if (onSave) {
      try {
        await onSave();
        onOpenChange(false);
        // Continue with original navigation
      } catch (error) {
        console.error('Error saving:', error);
      }
    }
  };

  const handleDiscardAndContinue = () => {
    onOpenChange(false);
    // Continue with original navigation
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
          <AlertDialogDescription>
            Você possui alterações não salvas que serão perdidas se continuar. 
            O que deseja fazer?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
          <Button 
            variant="outline" 
            onClick={handleDiscardAndContinue}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Descartar alterações
          </Button>
          {onSave && (
            <AlertDialogAction 
              onClick={handleSaveAndContinue}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar e continuar
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};