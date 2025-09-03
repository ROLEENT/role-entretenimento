"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { SelectUniversal } from "@/components/ui/select-universal";
import { BaseFormFieldProps } from "@/lib/forms";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RHFSelectUniversalProps extends BaseFormFieldProps {
  options: string[] | SelectOption[];
  onValueChange?: (value: string) => void;
  align?: 'left' | 'right';
}

export default function RHFSelectUniversal({
  name,
  label,
  placeholder = "Selecione uma opção",
  description,
  disabled,
  required,
  className,
  options,
  onValueChange,
  align = 'left'
}: RHFSelectUniversalProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];

  // Normalize options to SelectOption format
  const normalizedOptions: SelectOption[] = options.map((option) => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  });

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <SelectUniversal
            value={field.value || ""}
            onValueChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
            options={normalizedOptions}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            align={align}
          />
        )}
      />
      
      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {fieldError && (
        <p className="text-sm text-destructive" role="alert">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}