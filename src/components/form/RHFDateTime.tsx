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

  // Convert Date to datetime-local string format
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

  // Convert datetime-local string to Date
  const localStringToDate = (value: string): Date | null => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
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
              const date = localStringToDate(e.target.value);
              field.onChange(date);
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