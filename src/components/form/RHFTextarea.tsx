"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BaseFormFieldProps } from "@/lib/forms";

interface RHFTextareaProps extends BaseFormFieldProps {
  rows?: number;
}

export default function RHFTextarea({
  name,
  label,
  placeholder,
  description,
  disabled,
  required,
  className,
  rows = 3,
}: RHFTextareaProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];

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
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            rows={rows}
            aria-invalid={!!fieldError}
            aria-describedby={description ? `${name}-description` : undefined}
            aria-required={required}
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