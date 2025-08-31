import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { validationUtils } from '@/lib/validation';

interface UseFormValidationProps {
  schema?: z.ZodSchema<any>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  revalidateMode?: 'onChange' | 'onBlur';
}

export const useFormValidation = ({
  schema,
  mode = 'onBlur',
  revalidateMode = 'onChange',
}: UseFormValidationProps = {}) => {
  const {
    formState: { errors, isValid, isDirty, isSubmitting, touchedFields },
    trigger,
    getValues,
    setError,
    clearErrors,
  } = useFormContext();

  // Validate single field
  const validateField = useCallback(
    async (fieldName: string, value?: any) => {
      if (!schema) return { isValid: true };

      try {
        const currentValue = value !== undefined ? value : getValues(fieldName);
        
        // For field-level validation, we'll validate the entire form
        // and check for errors on this specific field
        await trigger(fieldName);
        
        const currentErrors = getValues(`errors.${fieldName}`);
        if (!currentErrors) {
          clearErrors(fieldName);
          return { isValid: true };
        }
        
        return { isValid: false, error: 'Erro de validação' };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const firstError = validationUtils.getFirstError(error);
          setError(fieldName, { message: firstError });
          return { isValid: false, error: firstError };
        }
        return { isValid: false, error: 'Erro de validação' };
      }
    },
    [schema, getValues, setError, clearErrors]
  );

  // Validate all fields
  const validateForm = useCallback(async () => {
    if (!schema) return { isValid: true };

    try {
      const values = getValues();
      await schema.parseAsync(values);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = validationUtils.errorsToFieldMap(error);
        
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field, { message });
        });
        
        return { 
          isValid: false, 
          errors: fieldErrors,
          firstError: validationUtils.getFirstError(error),
        };
      }
      return { isValid: false, error: 'Erro de validação' };
    }
  }, [schema, getValues, setError]);

  // Get field error
  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      const error = fieldName.split('.').reduce((obj, key) => obj?.[key], errors);
      if (typeof error === 'object' && error?.message) {
        return String(error.message);
      }
      return typeof error === 'string' ? error : undefined;
    },
    [errors]
  );

  // Check if field has error
  const hasFieldError = useCallback(
    (fieldName: string): boolean => {
      return !!getFieldError(fieldName);
    },
    [getFieldError]
  );

  // Check if field is touched
  const isFieldTouched = useCallback(
    (fieldName: string): boolean => {
      return !!fieldName.split('.').reduce((obj, key) => obj?.[key], touchedFields);
    },
    [touchedFields]
  );

  // Get all field errors as array
  const getAllErrors = useMemo(() => {
    const allErrors: string[] = [];
    
    const extractErrors = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && 'message' in value) {
          allErrors.push(value.message as string);
        } else if (value && typeof value === 'object') {
          extractErrors(value, fieldPath);
        }
      });
    };
    
    extractErrors(errors);
    return allErrors;
  }, [errors]);

  // Validation state summary
  const validationState = useMemo(() => {
    const errorCount = getAllErrors.length;
    const fieldCount = Object.keys(touchedFields).length;
    
    return {
      isValid,
      isDirty,
      isSubmitting,
      hasErrors: errorCount > 0,
      errorCount,
      fieldCount,
      completionRate: fieldCount > 0 ? ((fieldCount - errorCount) / fieldCount) * 100 : 0,
    };
  }, [isValid, isDirty, isSubmitting, getAllErrors.length, touchedFields]);

  // Create field handlers for common validation patterns
  const createFieldHandlers = useCallback(
    (fieldName: string) => ({
      onBlur: mode === 'onBlur' ? () => validateField(fieldName) : undefined,
      onChange: mode === 'onChange' ? (value: any) => validateField(fieldName, value) : undefined,
      validate: (value: any) => validateField(fieldName, value),
    }),
    [mode, validateField]
  );

  return {
    // Validation functions
    validateField,
    validateForm,
    
    // Error functions
    getFieldError,
    hasFieldError,
    getAllErrors,
    
    // State functions
    isFieldTouched,
    validationState,
    
    // Utilities
    createFieldHandlers,
    
    // React Hook Form trigger for manual validation
    trigger,
  };
};

export default useFormValidation;