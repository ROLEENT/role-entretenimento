import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RHFCheckboxGroupProps {
  name: string;
  label?: string;
  description?: string;
  options: CheckboxOption[] | string[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
  min?: number;
  max?: number;
}

export function RHFCheckboxGroup({
  name,
  label,
  description,
  options,
  className,
  orientation = 'vertical',
  required = false,
  min,
  max
}: RHFCheckboxGroupProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext();

  const error = errors[name];

  // Normalize options to consistent format
  const normalizedOptions: CheckboxOption[] = options.map(option => 
    typeof option === 'string' 
      ? { value: option, label: option }
      : option
  );

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <Label className="text-base font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
          {min && <span className="text-muted-foreground text-sm ml-2">(mín. {min})</span>}
          {max && <span className="text-muted-foreground text-sm ml-2">(máx. {max})</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const currentValue = field.value || [];

          const handleChange = (optionValue: string, checked: boolean) => {
            let newValue = [...currentValue];
            
            if (checked) {
              if (!newValue.includes(optionValue)) {
                newValue.push(optionValue);
              }
            } else {
              newValue = newValue.filter(v => v !== optionValue);
            }

            // Apply max limit
            if (max && newValue.length > max) {
              newValue = newValue.slice(0, max);
            }

            field.onChange(newValue);
          };

          return (
            <div className={cn(
              'grid gap-3',
              orientation === 'horizontal' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'
            )}>
              {normalizedOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-3 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Checkbox
                    id={`${name}-${option.value}`}
                    checked={currentValue.includes(option.value)}
                    onCheckedChange={(checked) => handleChange(option.value, checked as boolean)}
                    disabled={option.disabled || (max && !currentValue.includes(option.value) && currentValue.length >= max)}
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
            </div>
          );
        }}
      />

      {error && (
        <p className="text-sm font-medium text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  );
}