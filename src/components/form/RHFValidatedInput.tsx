"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { RHFFormField } from "./RHFFormField";
import { BaseFormFieldProps } from "@/lib/forms";
import { cn } from "@/lib/utils";

interface RHFValidatedInputProps extends BaseFormFieldProps {
  type?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  onValueChange?: (value: string) => void;
}

export const RHFValidatedInput: React.FC<RHFValidatedInputProps> = ({
  name,
  label,
  placeholder,
  description,
  type = "text",
  disabled,
  required,
  className,
  prefix,
  suffix,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  step,
  min,
  max,
  onValueChange,
}) => {
  return (
    <RHFFormField
      name={name}
      label={label}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
    >
      {({ field, fieldState }) => (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {prefix}
            </div>
          )}
          
          <Input
            {...field}
            value={field.value as string || ''}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            step={step}
            min={min}
            max={max}
            onChange={(e) => {
              field.onChange(e);
              onValueChange?.(e.target.value);
            }}
            className={cn(
              prefix && "pl-10",
              suffix && "pr-10",
              fieldState.error && "border-destructive focus:border-destructive"
            )}
          />
          
          {suffix && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {suffix}
            </div>
          )}
        </div>
      )}
    </RHFFormField>
  );
};

export default RHFValidatedInput;