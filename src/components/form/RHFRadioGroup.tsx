import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RHFRadioGroupProps {
  name: string;
  label?: string;
  description?: string;
  options: RadioOption[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
}

export function RHFRadioGroup({
  name,
  label,
  description,
  options,
  className,
  orientation = 'vertical',
  required = false
}: RHFRadioGroupProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <Label className="text-base font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value || ''}
            onValueChange={field.onChange}
            className={cn(
              'grid gap-3',
              orientation === 'horizontal' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'
            )}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-3 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                  disabled={option.disabled}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
      />

      {error && (
        <p className="text-sm font-medium text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  );
}