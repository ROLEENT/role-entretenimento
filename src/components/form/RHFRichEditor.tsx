"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RHFRichEditorProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export default function RHFRichEditor({
  name,
  label,
  placeholder = "Escreva o conteúdo...",
  disabled,
  className,
  rows = 10,
}: RHFRichEditorProps) {
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