import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { applyPhoneMask } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function PhoneInput({
  id,
  name,
  label,
  placeholder = "(11) 99999-9999",
  value = '',
  onChange,
  onBlur,
  error,
  disabled,
  required,
  className,
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyPhoneMask(e.target.value);
    onChange?.(maskedValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
      )}
      <Input
        id={id}
        name={name}
        type="tel"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={cn(error && "border-destructive")}
        maxLength={15} // (XX) XXXXX-XXXX
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}