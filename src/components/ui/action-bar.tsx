import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Save, Plus, FileText, Loader2, Check } from 'lucide-react';

interface ActionBarProps {
  isVisible?: boolean;
  isSubmitting?: boolean;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
  onSave?: () => void;
  onSaveAndCreate?: () => void;
  onSaveDraft?: () => void;
  className?: string;
}

export function ActionBar({
  isVisible = true,
  isSubmitting = false,
  isSaving = false,
  lastSavedAt,
  onSave,
  onSaveAndCreate,
  onSaveDraft,
  className,
}: ActionBarProps) {
  const getTimeSinceLastSaved = () => {
    if (!lastSavedAt) return null;
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastSavedAt.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `há ${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `há ${minutes}m`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `há ${hours}h`;
    }
  };

  const getSaveStatus = () => {
    if (isSaving || isSubmitting) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Salvando...</span>
        </div>
      );
    }

    if (lastSavedAt) {
      const timeAgo = getTimeSinceLastSaved();
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-500" />
          <span>Salvo {timeAgo}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            duration: 0.3
          }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-40",
            "bg-background/80 backdrop-blur-sm border-t",
            "shadow-lg",
            className
          )}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Status */}
              <div className="flex items-center gap-4">
                {getSaveStatus()}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {onSaveDraft && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting || isSaving}
                    onClick={onSaveDraft}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Salvar como rascunho
                  </Button>
                )}

                <Separator orientation="vertical" className="h-6" />

                {onSaveAndCreate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting || isSaving}
                    onClick={onSaveAndCreate}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Salvar e criar outro
                  </Button>
                )}

                {onSave && (
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || isSaving}
                    onClick={onSave}
                    className="gap-2 min-w-[100px]"
                  >
                    {isSubmitting || isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Salvar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ActionBar;