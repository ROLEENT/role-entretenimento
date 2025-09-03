"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RHFDateTimeProps {
  name: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function RHFDateTime({
  name,
  label,
  disabled,
  className,
}: RHFDateTimeProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];

  // Convert Date/string to datetime-local string format for input
  const dateToLocalString = (date: Date | string | null): string => {
    if (!date) return "";
    
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    
    // Format: YYYY-MM-DDTHH:MM
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Convert datetime-local string to ISO string for schema validation
  const localStringToISOString = (value: string): string => {
    if (!value) return "";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "" : date.toISOString();
  };

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
          <Input
            id={name}
            type="datetime-local"
            value={dateToLocalString(field.value)}
            onChange={(e) => {
              const isoString = localStringToISOString(e.target.value);
              field.onChange(isoString);
            }}
            disabled={disabled}
            className={className}
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