import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RHFTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  rows?: number;
}

export function RHFTextarea({ 
  name, 
  label, 
  placeholder, 
  className,
  required,
  rows = 4
}: RHFTextareaProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={className}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        {...register(name)}
        aria-invalid={!!error}
        className={error ? 'border-destructive' : ''}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">
          {error.message as string}
        </p>
      )}
    </div>
  );
}