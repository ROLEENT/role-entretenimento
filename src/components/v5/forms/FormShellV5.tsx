import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

interface FormShellV5Props {
  title: string;
  description?: string;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  onBack?: () => void;
  backUrl?: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
  enableAutosave?: boolean;
  onAutosave?: (data: any) => void;
}

export function FormShellV5({
  title,
  description,
  form,
  onSubmit,
  onBack,
  backUrl,
  isSubmitting = false,
  children,
  enableAutosave = true,
  onAutosave
}: FormShellV5Props) {
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const watchedValues = form.watch();
  const [debouncedValues] = useDebounce(watchedValues, 800);

  // Track if form is dirty
  useEffect(() => {
    setIsDirty(form.formState.isDirty);
  }, [form.formState.isDirty]);

  // Autosave functionality
  useEffect(() => {
    if (enableAutosave && onAutosave && isDirty && debouncedValues) {
      // Only autosave if form is valid or has no errors
      if (Object.keys(form.formState.errors).length === 0) {
        onAutosave({ ...debouncedValues, status: 'draft' });
        setLastSaved(new Date());
        setIsDirty(false);
      }
    }
  }, [debouncedValues, enableAutosave, onAutosave, isDirty, form.formState.errors]);

  // Navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = () => {
    if (isDirty) {
      const confirmed = window.confirm('Você tem alterações não salvas. Deseja continuar?');
      if (!confirmed) return;
    }
    
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {lastSaved && (
          <p className="text-sm text-muted-foreground">
            Salvo automaticamente às {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-sm text-muted-foreground">
                • Alterações não salvas
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-24"
            >
              {isSubmitting ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}