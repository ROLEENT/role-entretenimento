import { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Save, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface NavigationGuardV3Props {
  hasUnsavedChanges: boolean;
  onSave?: () => Promise<void> | void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmNavigation?: () => void;
  saveLabel?: string;
  discardLabel?: string;
  cancelLabel?: string;
  title?: string;
  description?: string;
}

export const NavigationGuardV3 = ({ 
  hasUnsavedChanges, 
  onSave,
  isOpen,
  onOpenChange,
  onConfirmNavigation,
  saveLabel = "Salvar e continuar",
  discardLabel = "Descartar alterações",
  cancelLabel = "Cancelar",
  title = "Alterações não salvas",
  description = "Você possui alterações não salvas que serão perdidas se continuar. O que deseja fazer?"
}: NavigationGuardV3Props) => {
  const [isSaving, setIsSaving] = useState(false);

  // Browser navigation guard (refresh, close tab, etc.)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Você tem alterações não salvas. Deseja sair mesmo assim?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleSaveAndContinue = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave();
      toast.success('Alterações salvas com sucesso!');
      onOpenChange(false);
      onConfirmNavigation?.();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardAndContinue = () => {
    onOpenChange(false);
    onConfirmNavigation?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleCancel} disabled={isSaving}>
            {cancelLabel}
          </AlertDialogCancel>
          
          <Button 
            variant="outline" 
            onClick={handleDiscardAndContinue}
            disabled={isSaving}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
            {discardLabel}
          </Button>
          
          {onSave && (
            <AlertDialogAction 
              onClick={handleSaveAndContinue}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : saveLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};