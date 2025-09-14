import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RHFTextProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'url' | 'number';
  className?: string;
  required?: boolean;
}

export function RHFText({ 
  name, 
  label, 
  placeholder, 
  type = 'text',
  className,
  required 
}: RHFTextProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={className}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
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