import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ZodError } from 'zod';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { roundToNearestMinutes } from 'date-fns';

/**
 * Convert Zod errors to a mapped object for easy field access
 */
export function zodErrorToMap(error: ZodError): Record<string, string> {
  const errorMap: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errorMap[path] = err.message;
  });
  
  return errorMap;
}

/**
 * Hook to guard against navigation when form is dirty
 */
export function useFormDirtyGuard(isDirty: boolean, enabled = true) {
  useEffect(() => {
    if (!enabled || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Você tem alterações não salvas. Deseja sair mesmo assim?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, enabled]);
}

/**
 * Convert local date to UTC using timezone
 */
export function toUTC(date: Date | string, timeZone = 'America/Sao_Paulo'): Date {
  const localDate = typeof date === 'string' ? new Date(date) : date;
  return fromZonedTime(localDate, timeZone);
}

/**
 * Convert UTC date to local timezone
 */
export function fromUTC(date: Date | string, timeZone = 'America/Sao_Paulo'): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(utcDate, timeZone);
}

/**
 * Round time to nearest 15 minute interval
 */
export function roundTo15Min(date: Date): Date {
  return roundToNearestMinutes(date, { nearestTo: 15 });
}

/**
 * Standard form validation patterns
 */
export const formValidation = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  url: /^https?:\/\/.+\..+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  instagram: /^@?[a-zA-Z0-9._]{1,30}$/,
};

/**
 * Common form field configurations
 */
export interface BaseFormFieldProps {
  id?: string;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Form field error display helper
 */
export function getFieldError(errors: any, fieldName: string): string | undefined {
  const fieldError = fieldName.split('.').reduce((obj, key) => obj?.[key], errors);
  return fieldError?.message || fieldError;
}