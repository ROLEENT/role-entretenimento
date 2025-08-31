"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RHFTextareaProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export default function RHFTextarea({
  name,
  label,
  placeholder,
  disabled,
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
          />
        )}
      />
      {fieldError && (
        <p className="text-sm text-destructive">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}