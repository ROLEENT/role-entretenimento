"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BaseFormFieldProps, toUTC, fromUTC, roundTo15Min } from "@/lib/forms";

interface RHFDateTimeUtcProps extends BaseFormFieldProps {
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
  timeZone?: string;
  round15Min?: boolean;
}

export default function RHFDateTimeUtc({
  name,
  label,
  placeholder,
  description,
  disabled,
  className,
  showTime = true,
  minDate,
  maxDate,
  timeZone = "America/Sao_Paulo",
  round15Min = false,
}: RHFDateTimeUtcProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const [showCalendar, setShowCalendar] = useState(false);
  const fieldError = errors[name];

  const formatDateTimeLocal = (date: Date | null): string => {
    if (!date) return "";
    
    const localDate = fromUTC(date, timeZone);
    
    if (showTime) {
      return format(localDate, "yyyy-MM-dd'T'HH:mm", { locale: ptBR });
    }
    return format(localDate, "yyyy-MM-dd", { locale: ptBR });
  };

  const parseLocalToUtc = (dateTimeString: string): Date | null => {
    if (!dateTimeString) return null;
    
    const localDate = new Date(dateTimeString);
    if (isNaN(localDate.getTime())) return null;
    
    const finalDate = round15Min ? roundTo15Min(localDate) : localDate;
    return toUTC(finalDate, timeZone);
  };

  const getDisplayValue = (utcDate: Date | null): string => {
    if (!utcDate) return "";
    
    const localDate = fromUTC(utcDate, timeZone);
    
    if (showTime) {
      return format(localDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
    return format(localDate, "dd/MM/yyyy", { locale: ptBR });
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
          <div className="space-y-2">
            {/* Hidden datetime-local input for actual input */}
            <Input
              type="datetime-local"
              value={formatDateTimeLocal(field.value)}
              onChange={(e) => {
                const utcDate = parseLocalToUtc(e.target.value);
                field.onChange(utcDate);
              }}
              disabled={disabled}
              min={minDate ? formatDateTimeLocal(minDate) : undefined}
              max={maxDate ? formatDateTimeLocal(maxDate) : undefined}
              className={className}
              aria-invalid={!!fieldError}
              aria-describedby={description ? `${name}-description` : undefined}
            />
            
            {/* Display value for better UX */}
            {field.value && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {showTime ? <Clock size={14} /> : <Calendar size={14} />}
                <span>{getDisplayValue(field.value)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => field.onChange(null)}
                  disabled={disabled}
                  className="h-auto p-1 text-xs"
                >
                  Limpar
                </Button>
              </div>
            )}
          </div>
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