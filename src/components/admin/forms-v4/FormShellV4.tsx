import React from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EntityFormConfig } from './types';
import { FormErrorSummary } from '@/components/ui/form-error-summary';

interface FormShellV4Props<T extends FieldValues> {
  config: EntityFormConfig;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  onBack?: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormShellV4<T extends FieldValues>({
  config,
  form,
  onSubmit,
  onBack,
  isLoading = false,
  children,
  className
}: FormShellV4Props<T>) {
  const { formState: { errors, isDirty }, handleSubmit } = form;
  
  // Extrair todos os erros de forma plana
  const getAllErrors = (obj: any, prefix = ''): string[] => {
    const errorMessages: string[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object') {
        if ('message' in value && typeof value.message === 'string') {
          errorMessages.push(value.message);
        } else if ('type' in value && value.type === 'required') {
          errorMessages.push(`${fullKey} é obrigatório`);
        } else {
          errorMessages.push(...getAllErrors(value, fullKey));
        }
      }
    });
    
    return errorMessages;
  };

  const errorMessages = getAllErrors(errors);
  const hasErrors = errorMessages.length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{config.title}</h1>
              {isDirty && (
                <Badge variant="secondary" className="text-xs">
                  Não salvo
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              {config.description}
            </p>
          </div>
        </div>

        <Button
          type="submit"
          form="entity-form"
          disabled={isLoading}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Salvando...' : config.submitText}
        </Button>
      </div>

      {/* Error Summary */}
      {hasErrors && (
        <FormErrorSummary 
          errors={errorMessages}
          className="border-destructive/20 bg-destructive/5"
        />
      )}

      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
          <form 
            id="entity-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {children}
          </form>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="text-sm text-muted-foreground">
          {isDirty ? (
            <span className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="h-3 w-3" />
              Você tem alterações não salvas
            </span>
          ) : (
            "Todas as alterações foram salvas"
          )}
        </div>

        <div className="flex gap-2">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          
          <Button
            type="submit"
            form="entity-form"
            disabled={isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Salvando...' : config.submitText}
          </Button>
        </div>
      </div>
    </div>
  );
}