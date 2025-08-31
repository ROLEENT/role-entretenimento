"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { RHFFormField } from "./RHFFormField";
import { BaseFormFieldProps } from "@/lib/forms";
import { cn } from "@/lib/utils";

interface RHFValidatedTextareaProps extends BaseFormFieldProps {
  rows?: number;
  maxLength?: number;
  minLength?: number;
  resize?: boolean;
  showCharCount?: boolean;
  onValueChange?: (value: string) => void;
}

export const RHFValidatedTextarea: React.FC<RHFValidatedTextareaProps> = ({
  name,
  label,
  placeholder,
  description,
  disabled,
  required,
  className,
  rows = 4,
  maxLength,
  minLength,
  resize = true,
  showCharCount = false,
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
        <div className="space-y-1">
          <Textarea
            {...field}
            rows={rows}
            placeholder={placeholder}
            maxLength={maxLength}
            minLength={minLength}
            onChange={(e) => {
              field.onChange(e);
              onValueChange?.(e.target.value);
            }}
            className={cn(
              !resize && "resize-none",
              fieldState.error && "border-destructive focus:border-destructive"
            )}
          />
          
          {showCharCount && maxLength && (
            <div className="flex justify-end">
              <span className={cn(
                "text-xs",
                field.value?.length > maxLength * 0.9 
                  ? "text-destructive" 
                  : "text-muted-foreground"
              )}>
                {field.value?.length || 0} / {maxLength}
              </span>
            </div>
          )}
        </div>
      )}
    </RHFFormField>
  );
};

export default RHFValidatedTextarea;