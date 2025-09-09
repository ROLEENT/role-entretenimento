import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface RHFSliderProps {
  name: string;
  label?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  required?: boolean;
}

export function RHFSlider({
  name,
  label,
  description,
  min = 0,
  max = 100,
  step = 1,
  className,
  showValue = true,
  formatValue,
  required = false
}: RHFSliderProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          
          {showValue && (
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <div className="text-sm font-medium text-muted-foreground">
                  {formatValue 
                    ? formatValue(field.value || min)
                    : (field.value || min)
                  }
                </div>
              )}
            />
          )}
        </div>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="px-2">
            <Slider
              value={[field.value || min]}
              onValueChange={(value) => field.onChange(value[0])}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatValue ? formatValue(min) : min}</span>
              <span>{formatValue ? formatValue(max) : max}</span>
            </div>
          </div>
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