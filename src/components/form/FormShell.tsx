"use client";

import { ReactNode, useEffect } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FormShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  form: UseFormReturn<any>;
  onSaveDraft?: (data: any) => Promise<void>;
  onPublish?: (data: any) => Promise<void>;
  onSaveAndExit?: (data: any) => Promise<void>;
  backUrl?: string;
  isDraft?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

export default function FormShell({
  title,
  description,
  children,
  form,
  onSaveDraft,
  onPublish,
  onSaveAndExit,
  backUrl,
  isDraft = true,
  isSubmitting = false,
  className,
}: FormShellProps) {
  const navigate = useNavigate();
  const { formState } = form;

  // Block navigation if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formState.isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "Você tem alterações não salvas. Deseja sair mesmo assim?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formState.isDirty, isSubmitting]);

  const handleSaveDraft = async () => {
    try {
      const data = form.getValues();
      await onSaveDraft?.(data);
      toast.success("Rascunho salvo com sucesso!");
      form.reset(data); // Mark as not dirty
    } catch (error) {
      console.error("Erro ao salvar rascunho:", error);
      toast.error("Erro ao salvar rascunho");
    }
  };

  const handlePublish = async () => {
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error("Corrija os erros no formulário antes de publicar");
        return;
      }

      const data = form.getValues();
      await onPublish?.(data);
      toast.success("Publicado com sucesso!");
      form.reset(data); // Mark as not dirty
    } catch (error) {
      console.error("Erro ao publicar:", error);
      toast.error("Erro ao publicar");
    }
  };

  const handleSaveAndExit = async () => {
    try {
      console.log('[FormShell] Attempting to save data...');
      const data = form.getValues();
      console.log('[FormShell] Form data:', data);
      
      // First validate the form
      const isValid = await form.trigger();
      if (!isValid) {
        console.error('[FormShell] Form validation failed:', form.formState.errors);
        toast.error("Corrija os erros no formulário antes de salvar");
        return;
      }
      
      await onSaveAndExit?.(data);
      console.log('[FormShell] Save successful');
      toast.success("Salvo com sucesso!");
      
      if (backUrl) {
        navigate(backUrl);
      }
    } catch (error) {
      console.error("[FormShell] Erro ao salvar:", error);
      toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleBack = () => {
    if (formState.isDirty) {
      const confirmed = window.confirm(
        "Você tem alterações não salvas. Deseja sair mesmo assim?"
      );
      if (!confirmed) return;
    }

    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <FormProvider {...form}>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {backUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            </div>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Rascunho
              </Button>
            )}

            {onSaveAndExit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndExit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar e Voltar
              </Button>
            )}

            {onPublish && (
              <Button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {isDraft ? "Publicar" : "Atualizar"}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="sr-only">{title}</CardTitle>
            {description && (
              <CardDescription className="sr-only">{description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
          </CardContent>
        </Card>

        {/* Status indicator */}
        {formState.isDirty && (
          <div className="fixed bottom-4 right-4 bg-amber-100 text-amber-800 px-3 py-2 rounded-md text-sm font-medium border border-amber-200">
            Alterações não salvas
          </div>
        )}
      </div>
    </FormProvider>
  );
}