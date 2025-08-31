"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { validationUtils } from "@/lib/validation";

interface RHFFormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: (props: {
    field: any;
    fieldState: any;
    formState: any;
  }) => React.ReactElement;
}

export const RHFFormField: React.FC<RHFFormFieldProps> = ({
  name,
  label,
  description,
  required,
  disabled,
  className,
  children,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = React.useMemo(() => {
    const error = name.split('.').reduce((obj, key) => obj?.[key], errors);
    return typeof error === 'object' && error?.message ? error.message : 
           typeof error === 'string' ? error : undefined;
  }, [errors, name]);

  const fieldId = `field-${name}`;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = fieldError ? `${fieldId}-error` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          htmlFor={fieldId} 
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            fieldError && "text-destructive"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="obrigatório">*</span>}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        disabled={disabled}
        render={(props) => 
          React.cloneElement(children(props), {
            id: fieldId,
            "aria-invalid": !!fieldError,
            "aria-describedby": cn(
              descriptionId,
              errorId
            ).trim() || undefined,
            "aria-required": required,
            className: cn(
              props.field.value && "has-value",
              fieldError && "border-destructive focus:border-destructive",
              disabled && "opacity-50 cursor-not-allowed"
            ),
          })
        }
      />
      
      {description && !fieldError && (
        <p 
          id={descriptionId} 
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      
      {fieldError && (
        <p 
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-sm text-destructive font-medium"
        >
          {String(fieldError)}
        </p>
      )}
    </div>
  );
};

export default RHFFormField;