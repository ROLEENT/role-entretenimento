import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect } from 'react';
import { useFormDirtyGuard } from '@/lib/forms';
import { validationUtils } from '@/lib/validation';
import { toast } from 'sonner';

interface UseValidatedFormProps<TSchema extends z.ZodSchema> extends Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> {
  schema: TSchema;
  onSubmit?: (data: z.infer<TSchema>) => Promise<void> | void;
  onError?: (errors: Record<string, string>) => void;
  enableDirtyGuard?: boolean;
  autoSave?: {
    enabled: boolean;
    delay?: number;
    onSave?: (data: z.infer<TSchema>) => Promise<void> | void;
  };
  showToastOnError?: boolean;
}

interface UseValidatedFormReturn<TSchema extends z.ZodSchema> extends UseFormReturn<z.infer<TSchema>> {
  submitHandler: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  hasErrors: boolean;
  errorCount: number;
  validationState: {
    isValid: boolean;
    isDirty: boolean;
    hasErrors: boolean;
    errorCount: number;
    completionRate: number;
  };
}

export function useValidatedForm<TSchema extends z.ZodSchema>({
  schema,
  onSubmit,
  onError,
  enableDirtyGuard = true,
  autoSave,
  showToastOnError = true,
  ...useFormProps
}: UseValidatedFormProps<TSchema>): UseValidatedFormReturn<TSchema> {
  
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    ...useFormProps,
  });

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting, touchedFields },
    watch,
  } = form;

  // Enable dirty guard if requested
  useFormDirtyGuard(isDirty, enableDirtyGuard);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave?.enabled || !autoSave.onSave) return;

    const subscription = watch((data) => {
      if (!isDirty) return;

      const timeoutId = setTimeout(() => {
        try {
          const validData = schema.parse(data);
          autoSave.onSave!(validData);
        } catch {
          // Ignore validation errors during auto-save
        }
      }, autoSave.delay || 2000);

      return () => clearTimeout(timeoutId);
    });

    return subscription.unsubscribe;
  }, [watch, isDirty, autoSave, schema]);

  // Calculate validation state
  const validationState = {
    isValid,
    isDirty,
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length,
    completionRate: Object.keys(touchedFields).length > 0 
      ? ((Object.keys(touchedFields).length - Object.keys(errors).length) / Object.keys(touchedFields).length) * 100 
      : 0,
  };

  // Enhanced submit handler
  const submitHandler = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      return handleSubmit(
        async (data) => {
          try {
            // Clean data before submission
            const cleanedData = validationUtils.cleanFormData(data);
            await onSubmit?.(cleanedData);
          } catch (error: any) {
            console.error('Form submission error:', error);
            
            if (showToastOnError) {
              toast.error(error.message || 'Erro ao enviar formulário');
            }
            
            throw error;
          }
        },
        (errors) => {
          // Handle validation errors
          const errorMap = validationUtils.errorsToFieldMap({ errors } as any);
          onError?.(errorMap);
          
          if (showToastOnError) {
            const firstErrorObj = Object.values(errors)[0];
            const firstError = typeof firstErrorObj === 'object' && firstErrorObj?.message 
              ? firstErrorObj.message 
              : 'Por favor, corrija os erros no formulário';
            toast.error(String(firstError));
          }
        }
      )(e);
    },
    [handleSubmit, onSubmit, onError, showToastOnError]
  );

  return {
    ...form,
    submitHandler,
    isSubmitting,
    hasErrors: validationState.hasErrors,
    errorCount: validationState.errorCount,
    validationState,
  };
}

export default useValidatedForm;