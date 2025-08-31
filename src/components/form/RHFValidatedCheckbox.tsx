"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RHFFormField } from "./RHFFormField";
import { BaseFormFieldProps } from "@/lib/forms";
import { cn } from "@/lib/utils";

interface RHFValidatedCheckboxProps extends Omit<BaseFormFieldProps, 'placeholder'> {
  onValueChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export const RHFValidatedCheckbox: React.FC<RHFValidatedCheckboxProps> = ({
  name,
  label,
  description,
  disabled,
  required,
  className,
  onValueChange,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6",
  };

  return (
    <RHFFormField
      name={name}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
    >
      {({ field, fieldState }) => (
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={!!field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked);
              onValueChange?.(!!checked);
            }}
            disabled={disabled}
            className={cn(
              sizeClasses[size],
              fieldState.error && "border-destructive",
              "mt-0.5"
            )}
            aria-describedby={description ? `${name}-description` : undefined}
          />
          
          {label && (
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={field.name}
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                  fieldState.error && "text-destructive"
                )}
              >
                {label}
                {required && <span className="text-destructive ml-1" aria-label="obrigatório">*</span>}
              </label>
            </div>
          )}
        </div>
      )}
    </RHFFormField>
  );
};

export default RHFValidatedCheckbox;