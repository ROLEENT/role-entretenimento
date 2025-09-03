"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseFormFieldProps } from "@/lib/forms";

interface RHFInputProps extends BaseFormFieldProps {
  type?: string;
}

export default function RHFInput({
  name,
  label,
  placeholder,
  description,
  type = "text",
  disabled,
  required,
  className,
}: RHFInputProps) {
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
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
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